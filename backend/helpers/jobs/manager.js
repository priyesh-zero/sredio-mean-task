const Job = require("../../models/job");
const jobState = require("./state");
const jobExecuter = require("./executer");
const { sleep } = require("../utils");

exports.processJobs = async () => {
  while (jobState.isProcessing) {
    try {
      // Check if we have available worker slots
      if (jobState.workers.size < jobState.CONCURRENCY) {
        const job = await getNextJob();

        if (job) {
          processJob(job);
        }
      }

      // Process retry jobs
      await processRetryJobs();

      // Wait before next poll
      await sleep(jobState.POLL_INTERVAL);
    } catch (error) {
      console.error("Error in job processing loop:", error);
      await sleep(jobState.POLL_INTERVAL);
    }
  }
};

// Process retry jobs
const processRetryJobs = async () => {
  const retryJobs = await Job.find({
    status: "retry",
    nextRetryAt: { $lte: new Date() },
  }).sort({ priority: -1, nextRetryAt: 1 });

  for (const job of retryJobs) {
    if (jobState.workers.size >= jobState.CONCURRENCY) break;

    await Job.findByIdAndUpdate(job._id, {
      status: "processing",
      startedAt: new Date(),
    });

    processJob(job);
  }
};

// Get next job to process
const getNextJob = async () => {
  const job = await Job.findOneAndUpdate(
    {
      status: "pending",
      scheduledAt: { $lte: new Date() },
    },
    {
      status: "processing",
      startedAt: new Date(),
    },
    {
      sort: { priority: -1, scheduledAt: 1 },
      new: true,
    },
  );

  return job;
};

// Process individual job
const processJob = async (job) => {
  const workerId = `worker_${Date.now()}_${Math.random()}`;
  jobState.workers.set(workerId, job);

  try {
    console.log(`Processing job ${job._id} of type ${job.type}`);

    // Execute the job
    const result = await jobExecuter.executeJob(job);

    // Mark job as completed
    await Job.findByIdAndUpdate(job._id, {
      status: "completed",
      result,
      completedAt: new Date(),
    });

    console.log(`Job ${job._id} completed successfully`);
  } catch (error) {
    if (error.message.includes("RateLimitReset")) {
      const nextReset = error.message.split(":")[1];
      console.error(`Job ${job._id} failed:`, error.message);
      await handleJobError(job, error, nextReset);
    } else {
      console.error(`Job ${job._id} failed:`, error.message);
      await handleJobError(job, error);
    }
  } finally {
    jobState.workers.delete(workerId);
  }
};

// Handle job errors and retries
const handleJobError = async (job, error, nextReset) => {
  const attempts = job.attempts + 1;

  if (attempts >= job.maxAttempts) {
    // Max attempts reached, mark as failed
    await Job.findByIdAndUpdate(job._id, {
      status: "failed",
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      attempts,
      completedAt: new Date(),
    });
  } else {
    // Schedule retry
    const retryDelay =
      jobState.RETRY_DELAYS[attempts - 1] ||
      jobState.RETRY_DELAYS[jobState.RETRY_DELAYS.length - 1];
    const nextRetryAt = nextReset
      ? new Date(nextReset)
      : new Date(Date.now() + retryDelay);

    await Job.findByIdAndUpdate(job._id, {
      status: "retry",
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      attempts,
      nextRetryAt,
    });
  }
};

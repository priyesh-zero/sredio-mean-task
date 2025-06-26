const Job = require("../models/Job");

class JobQueue {
  constructor() {
    if (JobQueue.instance) {
      return JobQueue.instance;
    }
    this.workers = new Map();
    this.isProcessing = false;
    this.concurrency = 3; // Number of concurrent jobs
    this.pollInterval = 5000; // 5 seconds
    this.retryDelays = [30000, 300000, 1800000]; // 30s, 5m, 30m

    JobQueue.instance = this;
  }

  static getInstance() {
    if (!JobQueue.instance) {
      return new JobQueue();
    }

    return JobQueue.instance;
  }

  // Add a job to the queue
  async add(type, userId, data = {}, options = {}) {
    const job = new Job({
      type,
      userId,
      organizationId: data.organizationId,
      repositoryId: data.repositoryId,
      priority: options.priority || 5,
      data,
      maxAttempts: options.maxAttempts || 3,
      delay: options.delay || 0,
      scheduledAt: options.delay
        ? new Date(Date.now() + options.delay)
        : new Date(),
    });

    await job.save();
    return job;
  }

  // Start processing jobs
  start() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processJobs();
    console.log(`Job queue started with ${this.concurrency} workers`);
  }

  // Stop processing jobs
  stop() {
    this.isProcessing = false;
    this.workers.clear();
    console.log("Job queue stopped");
  }

  // Main job processing loop
  async processJobs() {
    while (this.isProcessing) {
      try {
        // Check if we have available worker slots
        if (this.workers.size < this.concurrency) {
          const job = await this.getNextJob();

          if (job) {
            this.processJob(job);
          }
        }

        // Process retry jobs
        await this.processRetryJobs();

        // Wait before next poll
        await this.sleep(this.pollInterval);
      } catch (error) {
        console.error("Error in job processing loop:", error);
        await this.sleep(this.pollInterval);
      }
    }
  }

  // Get next job to process
  async getNextJob() {
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
  }

  // Process retry jobs
  async processRetryJobs() {
    const retryJobs = await Job.find({
      status: "retry",
      nextRetryAt: { $lte: new Date() },
    }).sort({ priority: -1, nextRetryAt: 1 });

    for (const job of retryJobs) {
      if (this.workers.size >= this.concurrency) break;

      await Job.findByIdAndUpdate(job._id, {
        status: "processing",
        startedAt: new Date(),
      });

      this.processJob(job);
    }
  }

  // Process individual job
  async processJob(job) {
    const workerId = `worker_${Date.now()}_${Math.random()}`;
    this.workers.set(workerId, job);

    try {
      console.log(`Processing job ${job._id} of type ${job.type}`);

      // Execute the job
      const result = await this.executeJob(job);

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
        await this.handleJobError(job, error, nextReset);
      } else {
        console.error(`Job ${job._id} failed:`, error.message);
        await this.handleJobError(job, error);
      }
    } finally {
      this.workers.delete(workerId);
    }
  }

  // Execute job based on type
  async executeJob(job) {
    const JobProcessor = require("./JobProcessor");
    const processor = new JobProcessor();

    switch (job.type) {
      case "sync-organizations":
        return await processor.syncOrganizations(job);
      case "sync-repositories":
        return await processor.syncRepositories(job);
      case "sync-members":
        return await processor.syncOrganizationMembers(job);
      case "sync-commits":
        return await processor.syncCommits(job);
      case "sync-issues":
        return await processor.syncIssues(job);
      case "sync-pulls":
        return await processor.syncPulls(job);
      case "sync-changelog":
        return await processor.syncPulls(job);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  // Handle job errors and retries
  async handleJobError(job, error, nextReset) {
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
        this.retryDelays[attempts - 1] ||
        this.retryDelays[this.retryDelays.length - 1];
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
  }

  // Utility method for delays
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get job statistics
  async getStats() {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      retry: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // Clean up old completed jobs
  async cleanup(olderThanDays = 7) {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
    );

    const result = await Job.deleteMany({
      status: { $in: ["completed", "failed"] },
      completedAt: { $lt: cutoffDate },
    });

    console.log(`Cleaned up ${result.deletedCount} old jobs`);
    return result.deletedCount;
  }
}

module.exports = JobQueue;

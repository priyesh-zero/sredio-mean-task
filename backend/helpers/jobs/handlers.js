const Job = require("../../models/job");
const jobState = require("./state");
const jobManager = require("./manager");

exports.add = async (type, userId, data = {}, options = {}) => {
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
};

// Start processing jobs
exports.start = () => {
  if (jobState.isProcessing) return;

  jobState.isProcessing = true;
  jobManager.processJobs();
  console.log(`Job queue started with ${jobState.CONCURRENCY} workers`);
};

// Stop processing jobs
exports.stop = () => {
  jobState.isProcessing = false;
  jobState.workers.clear();
  console.log("Job queue stopped");
};

// Get job statistics
exports.getStats = async () => {
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
};

// Clean up old completed jobs
exports.cleanup = async (olderThanDays = 7) => {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const result = await Job.deleteMany({
    status: { $in: ["completed", "failed"] },
    completedAt: { $lt: cutoffDate },
  });

  console.log(`Cleaned up ${result.deletedCount} old jobs`);
  return result.deletedCount;
};

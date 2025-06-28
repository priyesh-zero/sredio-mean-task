const jobProcessor = require("./processor");
// Execute job based on type
exports.executeJob = async (job) => {
  switch (job.type) {
    case "sync-organizations":
      return await jobProcessor.syncOrganizations(job);
    case "sync-repositories":
      return await jobProcessor.syncRepositories(job);
    case "sync-members":
      return await jobProcessor.syncOrganizationMembers(job);
    case "sync-commits":
      return await jobProcessor.syncCommits(job);
    case "sync-issues":
      return await jobProcessor.syncIssues(job);
    case "sync-pulls":
      return await jobProcessor.syncPulls(job);
    case "sync-changelog":
      return await jobProcessor.syncPulls(job);
    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
};

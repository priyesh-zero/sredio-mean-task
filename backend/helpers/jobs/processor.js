const jobHandler = require("./handlers");
const { checkRateLimit, githubRequest, paginateRequest } = require("./request");
const Organization = require("../../models/github/organisation");
const Repository = require("../../models/github/repo");
const OrganizationMember = require("../../models/github/user");
const Commit = require("../../models/github/commit");
const Issue = require("../../models/github/issues");
const Pull = require("../../models/github/pull");
const Changelog = require("../../models/github/changelog");

// Sync organizations
exports.syncOrganizations = async (job) => {
  const { user } = await checkRateLimit(job.userId);

  const orgs = await githubRequest(user, "/user/orgs?per_page=100");

  const results = [];

  for (const orgData of orgs) {
    const org = await Organization.findOneAndUpdate(
      { userId: job.userId, login: orgData.login },
      {
        ...orgData,
        userId: job.userId,
      },
      { upsert: true, new: true },
    );

    results.push(org);

    // Queue repository sync for this organization
    await jobHandler.add(
      "sync-repositories",
      job.userId,
      { organizationId: org._id },
      { priority: 2 },
    );
    await jobHandler.add(
      "sync-members",
      job.userId,
      { organizationId: org._id },
      { priority: 2 },
    );
  }

  return { synced: results.length, organizations: results };
};

// Sync organizations members
exports.syncOrganizationMembers = async (job) => {
  const { user } = await checkRateLimit(job.userId);
  const org = await Organization.findById(job.data.organizationId);

  if (!org) throw new Error("Organization not found");

  const {
    allEntities: allMembers,
    concurrent_request,
    perPage,
    page,
  } = await paginateRequest(
    `/orgs/${org.login}/members`,
    user,
    job,
    OrganizationMember,
    "login",
  );

  // If there might be more commits, queue another job
  if (allMembers.length === concurrent_request * perPage) {
    await jobHandler.add(
      "sync-members",
      job.userId,
      {
        organizationId: org._id,
        page: page + concurrent_request,
      },
      { priority: 2 },
    );
  }

  return { synced: allMembers.length, members: allMembers };
};

// Sync repositories
exports.syncRepositories = async (job) => {
  const { user } = await checkRateLimit(job.userId);
  const org = await Organization.findById(job.data.organizationId);

  if (!org) throw new Error("Organization not found");

  const {
    allEntities: allRepos,
    concurrent_request,
    perPage,
    page,
  } = await paginateRequest(
    `/orgs/${org.login}/repos`,
    user,
    job,
    Repository,
    "full_name",
  );

  for (const repoData of allRepos) {
    // Queue commits sync for this repository
    await jobHandler.add(
      "sync-commits",
      job.userId,
      { repositoryId: repoData._id },
      { priority: 3 },
    );
    await jobHandler.add(
      "sync-pulls",
      job.userId,
      { repositoryId: repoData._id },
      { priority: 4 },
    );
    await jobHandler.add(
      "sync-issues",
      job.userId,
      { repositoryId: repoData._id },
      { priority: 5 },
    );
    await jobHandler.add(
      "sync-changelog",
      job.userId,
      { repositoryId: repoData._id },
      { priority: 5 },
    );
  }

  // If there might be more commits, queue another job
  if (allRepos.length === concurrent_request * perPage) {
    await jobHandler.add(
      "sync-repositories",
      job.userId,
      {
        organizationId: org._id,
        page: page + concurrent_request,
      },
      { priority: 2 },
    );
  }

  return { synced: allRepos.length, repositories: allRepos };
};

// Sync commits (with pagination)
exports.syncCommits = async (job) => {
  const { user } = await checkRateLimit(job.userId);
  const repo = await Repository.findById(job.data.repositoryId);

  if (!repo) throw new Error("Repository not found");

  const {
    allEntities: allCommits,
    concurrent_request,
    perPage,
    page,
  } = await paginateRequest(
    `/repos/${repo.full_name}/commits`,
    user,
    job,
    Commit,
    "url",
  );

  // If there might be more commits, queue another job
  if (allCommits.length === concurrent_request * perPage) {
    await jobHandler.add(
      "sync-commits",
      job.userId,
      {
        repositoryId: repo._id,
        page: page + concurrent_request,
      },
      { priority: 3 },
    );
  }

  return {
    synced: allCommits.length,
    page,
    hasMore: allCommits.length === page + concurrent_request,
  };
};

// Similar methods for syncIssues and syncPulls...
exports.syncIssues = async (job) => {
  const { user } = await checkRateLimit(job.userId);
  const repo = await Repository.findById(job.data.repositoryId);

  if (!repo) throw new Error("Repository not found");

  const {
    allEntities: allIssues,
    concurrent_request,
    perPage,
    page,
  } = await paginateRequest(
    `/repos/${repo.full_name}/issues`,
    user,
    job,
    Issue,
    "url",
  );

  // If there might be more commits, queue another job
  if (allIssues.length === concurrent_request * perPage) {
    await jobHandler.add(
      "sync-issues",
      job.userId,
      {
        repositoryId: repo._id,
        page: page + concurrent_request,
      },
      { priority: 5 },
    );
  }

  return {
    synced: allIssues.length,
    page,
    hasMore: allIssues.length === page + concurrent_request,
  };
};

exports.syncPulls = async (job) => {
  const { user } = await checkRateLimit(job.userId);
  const repo = await Repository.findById(job.data.repositoryId);

  if (!repo) throw new Error("Repository not found");

  const {
    allEntities: allPulls,
    concurrent_request,
    perPage,
    page,
  } = await paginateRequest(
    `/repos/${repo.full_name}/pulls`,
    user,
    job,
    Pull,
    "url",
  );

  // If there might be more commits, queue another job
  if (allPulls.length === concurrent_request * perPage) {
    await jobHandler.add(
      "sync-pulls",
      job.userId,
      {
        repositoryId: repo._id,
        page: page + concurrent_request,
      },
      { priority: 4 },
    );
  }

  return {
    synced: allPulls.length,
    page,
    hasMore: allPulls.length === page + concurrent_request,
  };
};

exports.syncChangelog = async (job) => {
  const { user } = await checkRateLimit(job.userId);
  const repo = await Repository.findById(job.data.repositoryId);

  if (!repo) throw new Error("Repository not found");

  const {
    allEntities: allChangelogs,
    concurrent_request,
    perPage,
    page,
  } = await paginateRequest(
    `/repos/${repo.full_name}/releases`,
    user,
    job,
    Changelog,
    "url",
  );

  // If there might be more commits, queue another job
  if (allChangelogs.length === concurrent_request * perPage) {
    await jobHandler.add(
      "sync-changelog",
      job.userId,
      {
        repositoryId: repo._id,
        page: page + concurrent_request,
      },
      { priority: 5 },
    );
  }

  return {
    synced: allChangelogs.length,
    page,
    hasMore: allChangelogs.length === page + concurrent_request,
  };
};

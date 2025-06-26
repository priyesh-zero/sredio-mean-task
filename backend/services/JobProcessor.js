const axios = require("axios");
const User = require("../models/Integration");
const Organization = require("../models/GitHubOrg");
const OrganizationMember = require("../models/GitHubUser");
const Repository = require("../models/GitHubRepo");
const Commit = require("../models/GitHubCommit");
const Issue = require("../models/GitHubIssue");
const Pull = require("../models/GitHubPull");
const Changelog = require("../models/GitHubChangelog");
const JobQueue = require("./JobQueue");

class JobProcessor {
  constructor() {
    this.rateLimiter = new Map(); // User ID -> rate limit info
  }

  // Check and update rate limit for user
  async checkRateLimit(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const rateLimit = this.rateLimiter.get(userId.toString()) || {
      remaining: 5000,
      resetAt: now,
    };

    if (rateLimit.remaining <= 0 && now < rateLimit.resetAt) {
      throw new Error(`RateLimitReset:${new Date(rateLimit.resetAt)}`);
    }

    return { user, rateLimit };
  }

  // Make GitHub API request with rate limiting
  async githubRequest(user, url, options = {}) {
    const response = await axios.get(`https://api.github.com${url}`, {
      headers: {
        Authorization: `token ${user.accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
      ...options,
    });

    // Update rate limit info
    const remaining = parseInt(response.headers["x-ratelimit-remaining"]) || 0;
    const resetAt = parseInt(response.headers["x-ratelimit-reset"]) * 1000;

    this.rateLimiter.set(user._id.toString(), { remaining, resetAt });

    return response.data;
  }

  async paginateRequest(url, user, job, model, uniqueField) {
    let page = job.data.page || 1;
    let concurrent_request = 0;
    const perPage = 100;
    let allEntities = [];

    while (concurrent_request < 5) {
      // Limit to 5 pages per job to avoid long-running jobs
      const entities = await this.githubRequest(
        user,
        `${url}?per_page=${perPage}&page=${page + concurrent_request}`,
      );

      if (entities.length === 0) break;

      for (const entityData of entities) {
        const commit = await model.findOneAndUpdate(
          { userId: job.userId, [uniqueField]: entityData[uniqueField] },
          {
            ...entityData,
            userId: job.userId,
          },
          { upsert: true, new: true },
        );

        allEntities.push(commit);
      }

      if (entities.length < perPage) break;
      concurrent_request++;
    }

    concurrent_request = concurrent_request === 0 ? 1 : concurrent_request;

    return { allEntities, concurrent_request, perPage, page };
  }

  // Sync organizations
  async syncOrganizations(job) {
    const { user } = await this.checkRateLimit(job.userId);

    const orgs = await this.githubRequest(user, "/user/orgs?per_page=100");

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
      const queue = JobQueue.getInstance();
      await queue.add(
        "sync-repositories",
        job.userId,
        { organizationId: org._id },
        { priority: 2 },
      );
      await queue.add(
        "sync-members",
        job.userId,
        { organizationId: org._id },
        { priority: 2 },
      );
    }

    return { synced: results.length, organizations: results };
  }

  // Sync organizations members
  async syncOrganizationMembers(job) {
    const { user } = await this.checkRateLimit(job.userId);
    const org = await Organization.findById(job.data.organizationId);

    if (!org) throw new Error("Organization not found");

    const {
      allEntities: allMembers,
      concurrent_request,
      perPage,
      page,
    } = await this.paginateRequest(
      `/orgs/${org.login}/members`,
      user,
      job,
      OrganizationMember,
      "login",
    );

    // If there might be more commits, queue another job
    if (allMembers.length === concurrent_request * perPage) {
      const queue = JobQueue.getInstance();
      await queue.add(
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
  }

  // Sync repositories
  async syncRepositories(job) {
    const { user } = await this.checkRateLimit(job.userId);
    const org = await Organization.findById(job.data.organizationId);

    if (!org) throw new Error("Organization not found");

    const {
      allEntities: allRepos,
      concurrent_request,
      perPage,
      page,
    } = await this.paginateRequest(
      `/orgs/${org.login}/repos`,
      user,
      job,
      Repository,
      "full_name",
    );

    for (const repoData of allRepos) {
      // Queue commits sync for this repository
      const queue = JobQueue.getInstance();
      await queue.add(
        "sync-commits",
        job.userId,
        { repositoryId: repoData._id },
        { priority: 3 },
      );
      await queue.add(
        "sync-pulls",
        job.userId,
        { repositoryId: repoData._id },
        { priority: 4 },
      );
      await queue.add(
        "sync-issues",
        job.userId,
        { repositoryId: repoData._id },
        { priority: 5 },
      );
      await queue.add(
        "sync-changelog",
        job.userId,
        { repositoryId: repoData._id },
        { priority: 5 },
      );
    }

    // If there might be more commits, queue another job
    if (allRepos.length === concurrent_request * perPage) {
      const queue = JobQueue.getInstance();
      await queue.add(
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
  }

  // Sync commits (with pagination)
  async syncCommits(job) {
    const { user } = await this.checkRateLimit(job.userId);
    const repo = await Repository.findById(job.data.repositoryId);

    if (!repo) throw new Error("Repository not found");

    const {
      allEntities: allCommits,
      concurrent_request,
      perPage,
      page,
    } = await this.paginateRequest(
      `/repos/${repo.full_name}/commits`,
      user,
      job,
      Commit,
      "url",
    );

    // If there might be more commits, queue another job
    if (allCommits.length === concurrent_request * perPage) {
      const queue = JobQueue.getInstance();
      await queue.add(
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
  }

  // Similar methods for syncIssues and syncPulls...
  async syncIssues(job) {
    const { user } = await this.checkRateLimit(job.userId);
    const repo = await Repository.findById(job.data.repositoryId);

    if (!repo) throw new Error("Repository not found");

    const {
      allEntities: allIssues,
      concurrent_request,
      perPage,
      page,
    } = await this.paginateRequest(
      `/repos/${repo.full_name}/issues`,
      user,
      job,
      Issue,
      "url",
    );

    // If there might be more commits, queue another job
    if (allIssues.length === concurrent_request * perPage) {
      console.log("Adding new issue", concurrent_request, perPage);
      const queue = JobQueue.getInstance();
      await queue.add(
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
  }

  async syncPulls(job) {
    const { user } = await this.checkRateLimit(job.userId);
    const repo = await Repository.findById(job.data.repositoryId);

    if (!repo) throw new Error("Repository not found");

    const {
      allEntities: allPulls,
      concurrent_request,
      perPage,
      page,
    } = await this.paginateRequest(
      `/repos/${repo.full_name}/pulls`,
      user,
      job,
      Pull,
      "url",
    );

    // If there might be more commits, queue another job
    if (allPulls.length === concurrent_request * perPage) {
      const queue = JobQueue.getInstance();
      await queue.add(
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
  }

  async syncChangelog(job) {
    const { user } = await this.checkRateLimit(job.userId);
    const repo = await Repository.findById(job.data.repositoryId);

    if (!repo) throw new Error("Repository not found");

    const {
      allEntities: allChangelogs,
      concurrent_request,
      perPage,
      page,
    } = await this.paginateRequest(
      `/repos/${repo.full_name}/releases`,
      user,
      job,
      Changelog,
      "url",
    );

    // If there might be more commits, queue another job
    if (allChangelogs.length === concurrent_request * perPage) {
      const queue = JobQueue.getInstance();
      await queue.add(
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
  }
}

module.exports = JobProcessor;
;
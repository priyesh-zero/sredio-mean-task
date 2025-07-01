const User = require("../../models/integration");
const axios = require("axios");

const rateLimiter = new Map(); // User ID -> rate limit info

// Check and update rate limit for user
const checkRateLimit = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const now = Date.now();
  const rateLimit = rateLimiter.get(userId.toString()) || {
    remaining: 5000,
    resetAt: now,
  };

  if (rateLimit.remaining <= 0 && now < rateLimit.resetAt) {
    throw new Error(`RateLimitReset:${new Date(rateLimit.resetAt)}`);
  }

  return { user, rateLimit };
};

// Make GitHub API request with rate limiting
const githubRequest = async (user, url, options = {}) => {
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

  rateLimiter.set(user._id.toString(), { remaining, resetAt });

  return response.data;
};

exports.checkRateLimit = checkRateLimit;
exports.githubRequest = githubRequest;

exports.paginateRequest = async (
  url,
  user,
  job,
  model,
  uniqueField,
  metadata = {},
) => {
  let page = job.data.page || 1;
  let concurrent_request = 0;
  const perPage = 100;
  let allEntities = [];

  while (concurrent_request < 5) {
    // Limit to 5 pages per job to avoid long-running jobs
    const entities = await githubRequest(
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
          ...metadata,
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
};

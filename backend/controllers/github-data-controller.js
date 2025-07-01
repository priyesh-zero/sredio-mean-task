const Commit = require("../models/github/commit");
const Pull = require("../models/github/pull");
const Issue = require("../models/github/issues");
const Org = require("../models/github/organisation");
const Repo = require("../models/github/repo");
const User = require("../models/github/user");
const Changelog = require("../models/github/changelog");

const LOOKUP_TABLE = {
  Orgs: {
    fields: { repos: 1, members: 1 },
    query: [
      {
        $lookup: {
          from: "github_repos",
          localField: "id",
          foreignField: "owner.id",
          as: "repos",
          pipeline: [
            {
              $limit: 5,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "github_users",
          localField: "_id",
          foreignField: "_organizationId",
          as: "members",
          pipeline: [
            {
              $limit: 5,
            },
          ],
        },
      },
    ],
  },
  Repos: {
    fields: { commits: 1, pulls: 1, issues: 1 },
    query: [
      {
        $lookup: {
          from: "github_commits",
          localField: "_id",
          foreignField: "_repositoryId",
          as: "commits",
          pipeline: [
            {
              $limit: 5,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "github_pulls",
          localField: "_id",
          foreignField: "_repositoryId",
          as: "pulls",
          pipeline: [
            {
              $limit: 5,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "github_issues",
          localField: "url",
          foreignField: "repository_url",
          as: "issues",
          pipeline: [
            {
              $limit: 5,
            },
          ],
        },
      },
    ],
  },
  Pulls: {
    fields: { users: 1 },
    query: [
      {
        $lookup: {
          from: "github_users",
          localField: "user.login",
          foreignField: "login",
          as: "users",
          pipeline: [
            {
              $limit: 5,
            },
          ],
        },
      },
    ],
  },
};

exports.getCollectionData = async (req, res) => {
  const { collection, page = 1, limit = 20, searchText = "" } = req.query;

  try {
    const modelMap = {
      Commits: Commit,
      Pulls: Pull,
      Issues: Issue,
      Orgs: Org,
      Repos: Repo,
      Users: User,
      Changelog: Changelog,
    };

    const Model = modelMap[collection];
    if (!Model) return res.status(400).json({ error: "Invalid collection" });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    const excludedFields = ["_id", "githubUserId", "userId", "__v"];

    const inclusionFields = Object.entries(Model.schema.paths)
      .filter(([key]) => !excludedFields.includes(key))
      .reduce((acc, [key]) => {
        acc[key] = 1;
        return acc;
      }, {});

    const regexOrQuery = Object.entries(Model.schema.paths)
      .filter(([key]) => !excludedFields.includes(key))
      .map(([key]) => ({
        [key]: {
          $regex: new RegExp(searchText, "i"),
        },
      }));

    const lookupQuery = LOOKUP_TABLE[collection]
      ? LOOKUP_TABLE[collection].query
      : [];
    const lookupFields = LOOKUP_TABLE[collection]
      ? LOOKUP_TABLE[collection].fields
      : {};

    // Perform query
    const result = await Model.aggregate([
      {
        $match: {
          $and: [{ userId: req.body.userId }, { $or: regexOrQuery }],
        },
      },
      ...lookupQuery,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitVal }],
        },
      },
      {
        $unwind: "$metadata",
      },
      {
        $project: {
          total: "$metadata.total",
          data: { ...inclusionFields, ...lookupFields },
        },
      },
    ]);

    const { total, data } =
      result.length > 0 ? result[0] : { total: 0, data: [] };

    // Return only visible fields

    const fields = data.length > 0 ? Object.keys(data[0]) : [];

    res.json({ relations: Object.keys(lookupFields), data, total });
  } catch (err) {
    console.error("getCollectionData Error:", err);
    res.status(500).json({ error: err.message });
  }
};

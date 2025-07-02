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

const ModelMap = {
  Commits: Commit,
  Pulls: Pull,
  Issues: Issue,
  Orgs: Org,
  Repos: Repo,
  Users: User,
  Changelog: Changelog,
};

exports.getCollectionData = async (req, res) => {
  const {
    collection,
    page = 1,
    limit = 20,
    searchText = "",
    facet,
  } = req.query;

  try {
    const Model = ModelMap[collection];
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

    const facetSearchQueries = facet ? JSON.parse(facet) : [];

    // Perform query
    const result = await Model.aggregate([
      {
        $match: {
          $and: [
            { userId: req.body.userId },
            { $or: regexOrQuery },
            ...facetSearchQueries,
          ],
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

    res.json({ relations: Object.keys(lookupFields), data, total });
  } catch (err) {
    console.error("getCollectionData Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const DISTINCT_FIELDS = {
  Repos: {
    "owner.login": "Owner",
    default_branch: "Default Branch",
  },
};

const CONSTANT_FILTERS = {
  Repos: {
    private: {
      name: "Private Repository",
      type: "single",
      options: [true, false],
    },
  },
};

exports.getFacetSearchOption = async (req, res) => {
  const { collection } = req.query;
  try {
    const Model = ModelMap[collection];
    if (!Model)
      return res
        .status(400)
        .json({ success: false, error: "Invalid collection" });

    const distinctFields = DISTINCT_FIELDS[collection];

    if (!distinctFields || Object.keys(distinctFields).length === 0) {
      return res.json({ success: true, data: {} });
    }

    const distinctFieldKeys = Object.keys(distinctFields);

    const data = await Promise.all(
      distinctFieldKeys.map((field) => Model.distinct(field)),
    );

    const filterOptions = distinctFieldKeys.reduce((acc, cur) => {
      acc[cur] = {
        name: distinctFields[cur],
        type: "multi",
        options: data[distinctFieldKeys.indexOf(cur)],
      };
      return acc;
    }, {});

    return res.json({
      success: true,
      data: { ...filterOptions, ...CONSTANT_FILTERS[collection] },
    });
  } catch (err) {
    console.error("getCollectionData Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

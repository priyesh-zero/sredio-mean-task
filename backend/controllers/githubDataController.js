const Integration = require("../models/Integration");
const Commit = require("../models/GitHubCommit");
const Pull = require("../models/GitHubPull");
const Issue = require("../models/GitHubIssue");
const Org = require("../models/GitHubOrg");
const Repo = require("../models/GitHubRepo");
const User = require("../models/GitHubUser");
const Changelog = require("../models/GitHubChangelog");

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

    // Get only string fields from the schema for $regex filtering
    const stringFields = Object.entries(Model.schema.paths)
      .filter(
        ([key, type]) =>
          type.instance === "String" && !excludedFields.includes(key),
      )
      .map(([key]) => key);

    const query = {};

    // Perform query
    const result = await Model.aggregate([
      {
        $addFields: {
          flatFields: {
            $function: {
              body: function (obj) {
                function flatten(obj, prefix = "") {
                  let result = [];
                  for (let key in obj) {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    const val = obj[key];

                    if (val && typeof val === "object" && !Array.isArray(val)) {
                      result = result.concat(flatten(val, fullKey));
                    } else if (Array.isArray(val)) {
                      val.forEach((v, idx) => {
                        if (typeof v === "object") {
                          result = result.concat(
                            flatten(v, `${fullKey}[${idx}]`),
                          );
                        } else {
                          result.push({ k: `${fullKey}[${idx}]`, v: v });
                        }
                      });
                    } else {
                      result.push({ k: fullKey, v: val });
                    }
                  }
                  return result;
                }

                return flatten(obj);
              },
              args: ["$$ROOT"],
              lang: "js",
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$flatFields",
                    as: "field",
                    cond: {
                      $regexMatch: {
                        input: {
                          $convert: {
                            input: "$$field.v",
                            to: "string",
                            onError: "",
                            onNull: "",
                          },
                        },
                        regex: searchText,
                        options: "i",
                      },
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      },
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
          data: 1,
        },
      },
    ]);

    const { total, data } = result[0];

    let cleanData = []
    if (data.length > 0) {
      cleanData = data.map(({ flatFields, ...d}) => d)
    }


    // Return only visible fields

    const fields = cleanData.length ? Object.keys(data[0]) : [];

    res.json({ fields, data: cleanData, total });
  } catch (err) {
    console.error("getCollectionData Error:", err);
    res.status(500).json({ error: err.message });
  }
};

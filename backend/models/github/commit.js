const mongoose = require("mongoose");
const { UserSchema } = require("./_common-schema");

const CommitSchema = new mongoose.Schema(
  {
    url: {
      type: "String",
    },
    sha: {
      type: "String",
    },
    node_id: {
      type: "String",
    },
    html_url: {
      type: "String",
    },
    comments_url: {
      type: "String",
    },
    commit: {
      url: {
        type: "String",
      },
      author: {
        name: {
          type: "String",
        },
        email: {
          type: "String",
        },
        date: {
          type: "Date",
        },
      },
      committer: {
        name: {
          type: "String",
        },
        email: {
          type: "String",
        },
        date: {
          type: "Date",
        },
      },
      message: {
        type: "String",
      },
      tree: {
        url: {
          type: "String",
        },
        sha: {
          type: "String",
        },
      },
      comment_count: {
        type: "Number",
      },
      verification: {
        verified: {
          type: "Boolean",
        },
        reason: {
          type: "String",
        },
        signature: {
          type: "Mixed",
        },
        payload: {
          type: "Mixed",
        },
        verified_at: {
          type: "Mixed",
        },
      },
    },
    author: { type: UserSchema, default: null },
    committer: { type: UserSchema, default: null },
    parents: {
      type: ["Mixed"],
    },
  },
  { strict: false },
);

module.exports = mongoose.model("GitHubCommit", CommitSchema, "github_commits");

const mongoose = require("mongoose");

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
    author: {
      login: {
        type: "String",
      },
      id: {
        type: "Number",
      },
      node_id: {
        type: "String",
      },
      avatar_url: {
        type: "String",
      },
      gravatar_id: {
        type: "String",
      },
      url: {
        type: "String",
      },
      html_url: {
        type: "String",
      },
      followers_url: {
        type: "String",
      },
      following_url: {
        type: "String",
      },
      gists_url: {
        type: "String",
      },
      starred_url: {
        type: "String",
      },
      subscriptions_url: {
        type: "String",
      },
      organizations_url: {
        type: "String",
      },
      repos_url: {
        type: "String",
      },
      events_url: {
        type: "String",
      },
      received_events_url: {
        type: "String",
      },
      type: {
        type: "String",
      },
      site_admin: {
        type: "Boolean",
      },
    },
    committer: {
      login: {
        type: "String",
      },
      id: {
        type: "Number",
      },
      node_id: {
        type: "String",
      },
      avatar_url: {
        type: "String",
      },
      gravatar_id: {
        type: "String",
      },
      url: {
        type: "String",
      },
      html_url: {
        type: "String",
      },
      followers_url: {
        type: "String",
      },
      following_url: {
        type: "String",
      },
      gists_url: {
        type: "String",
      },
      starred_url: {
        type: "String",
      },
      subscriptions_url: {
        type: "String",
      },
      organizations_url: {
        type: "String",
      },
      repos_url: {
        type: "String",
      },
      events_url: {
        type: "String",
      },
      received_events_url: {
        type: "String",
      },
      type: {
        type: "String",
      },
      site_admin: {
        type: "Boolean",
      },
    },
    parents: {
      type: ["Mixed"],
    },
  },
  { strict: false },
);

module.exports = mongoose.model("GitHubCommit", CommitSchema, "github_commits");

const mongoose = require("mongoose");

const GitHubOrgSchema = new mongoose.Schema(
  {
    login: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    node_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    repos_url: {
      type: String,
      required: true,
    },
    events_url: {
      type: String,
      required: true,
    },
    hooks_url: {
      type: String,
      required: true,
    },
    issues_url: {
      type: String,
      required: true,
    },
    members_url: {
      type: String,
      required: true,
    },
    public_members_url: {
      type: String,
      required: true,
    },
    avatar_url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null, // Allows null as per schema
    },
  },
  { strict: false },
);

module.exports = mongoose.model("GitHubOrg", GitHubOrgSchema, "github_orgs");

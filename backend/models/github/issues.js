const mongoose = require("mongoose");
const { UserSchema } = require("./_common-schema");

const IssueSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    node_id: { type: String, required: true },
    url: { type: String, required: true },
    repository_url: { type: String, required: true },
    labels_url: { type: String, required: true },
    comments_url: { type: String, required: true },
    events_url: { type: String, required: true },
    html_url: { type: String, required: true },
    number: { type: Number, required: true },
    state: { type: String, required: true },
    state_reason: {
      type: String,
      enum: ["completed", "reopened", "not_planned", null],
      default: null,
    },
    title: { type: String, required: true },
    body: { type: String, default: null },
    user: { type: UserSchema, default: null },
    labels: {
      type: [mongoose.Schema.Types.Mixed], // Accepts string or object
      default: [],
    },
    assignee: { type: UserSchema, default: null },
    assignees: {
      type: [UserSchema],
      default: null,
    },
  },
  { strict: false },
);

module.exports = mongoose.model("GitHubIssue", IssueSchema, "github_issues");

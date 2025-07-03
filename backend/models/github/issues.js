const mongoose = require("mongoose");
const {
  UserSchema,
  MilestoneSchema,
  LabelSchema,
} = require("./_common-schema");

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
    labels: [{ type: LabelSchema }],
    assignee: { type: UserSchema, default: null },
    assignees: [{ type: UserSchema }],
    milestone: { type: MilestoneSchema, default: null },
    locked: { type: Boolean, required: true },
    active_lock_reason: { type: String, default: null },
    comments: { type: Number, required: true },
    pull_request: {
      merged_at: { type: Date, default: null },
      diff_url: { type: String, default: null },
      html_url: { type: String, default: null },
      patch_url: { type: String, default: null },
      url: { type: String, default: null },
    },
    closed_at: { type: Date, default: null },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    draft: { type: Boolean, default: false },
    closed_by: { type: UserSchema, default: null },
  },
  { strict: false },
);

module.exports = mongoose.model("GitHubIssue", IssueSchema, "github_issues");

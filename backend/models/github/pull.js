const mongoose = require("mongoose");
const { UserSchema, LabelSchema } = require("./_common-schema");

const MilestoneSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    html_url: { type: String, required: true },
    labels_url: { type: String, required: true },
    id: { type: Number, required: true },
    node_id: { type: String, required: true },
    number: { type: Number, required: true },
    state: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: null },
    creator: { type: UserSchema, default: null },
  },
  { _id: false },
);

const PullSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    id: { type: Number, required: true },
    node_id: { type: String, required: true },
    html_url: { type: String, required: true },
    diff_url: { type: String, required: true },
    patch_url: { type: String, required: true },
    issue_url: { type: String, required: true },
    commits_url: { type: String, required: true },
    review_comments_url: { type: String, required: true },
    review_comment_url: { type: String, required: true },
    comments_url: { type: String, required: true },
    statuses_url: { type: String, required: true },
    number: { type: Number, required: true },
    state: { type: String, required: true },
    locked: { type: Boolean, required: true },
    title: { type: String, required: true },
    user: { type: UserSchema, default: null },
    body: { type: String, default: null },
    labels: { type: [LabelSchema], default: [] },
    milestone: { type: MilestoneSchema, default: null },
  },
  { strict: false },
);

module.exports = mongoose.model("GitHubPull", PullSchema, "github_pulls");

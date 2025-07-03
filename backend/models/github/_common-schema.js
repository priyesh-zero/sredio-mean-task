const mongoose = require("mongoose");

exports.LabelSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    node_id: { type: String, required: true },
    url: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    color: { type: String, required: true },
    default: { type: Boolean, required: true },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: { type: String, default: null },
    login: { type: String, required: true },
    id: { type: Number, required: true },
    node_id: { type: String, required: true },
    avatar_url: { type: String, required: true },
    gravatar_id: { type: String, default: null },
    url: { type: String, required: true },
    html_url: { type: String, required: true },
    followers_url: { type: String, required: true },
    following_url: { type: String, required: true },
    gists_url: { type: String, required: true },
    starred_url: { type: String, required: true },
    subscriptions_url: { type: String, required: true },
    organizations_url: { type: String, required: true },
    repos_url: { type: String, required: true },
    events_url: { type: String, required: true },
    received_events_url: { type: String, required: true },
    type: { type: String, required: true },
    site_admin: { type: Boolean, required: true },
    starred_at: { type: String },
    user_view_type: { type: String },
  },
  { strict: false },
);

exports.UserSchema = UserSchema;

exports.MilestoneSchema = new mongoose.Schema(
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
    open_issues: { type: Number, required: true },
    closed_issues: { type: Number, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    closed_at: { type: Date, default: null },
    due_on: { type: Date, default: null },
  },
  { _id: false },
);

const mongoose = require("mongoose");
const { UserSchema, LabelSchema } = require("./_common-schema");

const RenameSchema = new mongoose.Schema(
  {
    from: String,
    to: String,
  },
  { _id: false },
);

const ReactionsSchema = new mongoose.Schema(
  {
    url: String,
    total_count: Number,
    "+1": Number,
    "-1": Number,
    laugh: Number,
    hooray: Number,
    confused: Number,
    heart: Number,
    rocket: Number,
    eyes: Number,
  },
  { _id: false },
);

const ChangelogSchema = new mongoose.Schema(
  {
    id: Number,
    node_id: String,
    url: String,
    html_url: String,
    issue_url: String,
    event: String,
    actor: UserSchema,
    user: UserSchema, // for comments
    commit_id: String,
    commit_url: String,
    created_at: Date,
    updated_at: Date,
    lock_reason: String,
    label: LabelSchema,
    rename: RenameSchema,
    body: String,
    author_association: String,
    reactions: ReactionsSchema,
    performed_via_github_app: mongoose.Schema.Types.Mixed,
  },
  { strict: false },
);

module.exports = mongoose.model(
  "GitHubChangelog",
  ChangelogSchema,
  "github_changelog",
);

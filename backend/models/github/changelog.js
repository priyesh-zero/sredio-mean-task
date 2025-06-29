const mongoose = require("mongoose");
const { UserSchema } = require("./_common-schema");

const ReleaseAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    browser_download_url: { type: String, required: true },
    id: { type: Number, required: true },
    node_id: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, default: null },
    state: { type: String, enum: ["uploaded", "open"], required: true },
    content_type: { type: String, required: true },
    size: { type: Number, required: true },
    digest: { type: String, default: null },
    download_count: { type: Number, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    uploader: {
      type: UserSchema,
      default: null,
    },
  },
  { _id: false },
);

const ReactionRollupSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    total_count: { type: Number, required: true },
    "+1": { type: Number, required: true },
    "-1": { type: Number, required: true },
    laugh: { type: Number, required: true },
    confused: { type: Number, required: true },
    heart: { type: Number, required: true },
    hooray: { type: Number, required: true },
    eyes: { type: Number, required: true },
    rocket: { type: Number, required: true },
  },
  { _id: false },
);

const ChangelogSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    html_url: { type: String, required: true },
    assets_url: { type: String, required: true },
    upload_url: { type: String, required: true },
    tarball_url: { type: String, default: null },
    zipball_url: { type: String, default: null },
    id: { type: Number, required: true },
    node_id: { type: String, required: true },
    tag_name: { type: String, required: true },
    target_commitish: { type: String, required: true },
    name: { type: String, default: null },
    body: { type: String, default: null },
    draft: { type: Boolean, required: true },
    prerelease: { type: Boolean, required: true },
    created_at: { type: Date, required: true },
    published_at: { type: Date, default: null },
    author: { type: UserSchema, required: true },
    assets: { type: [ReleaseAssetSchema], required: true },
    body_html: { type: String },
    body_text: { type: String },
    mentions_count: { type: Number },
    discussion_url: { type: String },
    reactions: { type: ReactionRollupSchema },
  },
  { strict: false },
);

module.exports = mongoose.model(
  "GitHubChangelog",
  ChangelogSchema,
  "github_changelog",
);

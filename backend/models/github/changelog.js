const mongoose = require("mongoose");

const ChangelogSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model(
  "GitHubChangelog",
  ChangelogSchema,
  "github_changelog",
);

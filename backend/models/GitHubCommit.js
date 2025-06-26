const mongoose = require("mongoose");

const CommitSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("GitHubCommit", CommitSchema, "github_commits");

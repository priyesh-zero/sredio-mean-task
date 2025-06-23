const mongoose = require('mongoose');

const PullSchema = new mongoose.Schema({
  id: Number,
  number: Number,
  state: String,
  title: String,
  user_login: String,
  assignee_login: String,
  created_at: Date,
  merged_at: Date,
  html_url: String,
  repoName: String,
  githubUserId: String,
}, { strict: false });

module.exports = mongoose.model('GitHubPull', PullSchema, 'github_pulls');

const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  id: Number,
  number: Number,
  title: String,
  body: String,
  state: String,
  created_at: Date,
  closed_at: Date,
  user_login: String,
  assignee_login: String,
  pull_request: Boolean,
  html_url: String,
  repoName: String,
  githubUserId: String,
}, { strict: false });

module.exports = mongoose.model('GitHubIssue', IssueSchema, 'github_issues');

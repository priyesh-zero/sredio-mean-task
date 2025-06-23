const mongoose = require('mongoose');

const RepoSchema = new mongoose.Schema({
  id: Number,
  name: String,
  full_name: String,
  private: Boolean,
  owner_login: String,
  html_url: String,
  description: String,
  default_branch: String,
  githubUserId: String,
}, { strict: false });

module.exports = mongoose.model('GitHubRepo', RepoSchema, 'github_repos');

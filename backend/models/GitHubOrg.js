const mongoose = require('mongoose');

const GitHubOrgSchema = new mongoose.Schema({
  id: Number,
  login: String,
  avatar_url: String,
  description: String,
  githubUserId: String,
}, { strict: false });

module.exports = mongoose.model('GitHubOrg', GitHubOrgSchema, 'github_orgs');

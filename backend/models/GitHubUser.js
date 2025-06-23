const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: Number,
  login: String,
  avatar_url: String,
  html_url: String,
  type: String,
  orgLogin: String,
  githubUserId: String
}, { strict: false });

module.exports = mongoose.model('GitHubUser', UserSchema, 'github_users');

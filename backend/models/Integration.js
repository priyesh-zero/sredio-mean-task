const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  accessToken: String,
  connectedAt: Date
});

module.exports = mongoose.model('GithubIntegration', integrationSchema, 'github_integration');

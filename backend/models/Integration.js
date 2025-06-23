const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  accessToken: String,
  connectedAt: Date
});

module.exports = mongoose.model('GithubIntegration', IntegrationSchema, 'github_integration');

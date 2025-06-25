const mongoose = require('mongoose');

const GitHubOrgSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('GitHubOrg', GitHubOrgSchema, 'github_orgs');

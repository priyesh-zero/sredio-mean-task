const mongoose = require('mongoose');

const OrgSchema = new mongoose.Schema({
    id: Number,
    login: String,
    url: String,
    repos_url: String,
    events_url: String,
    hooks_url: String,
    issues_url: String,
    members_url: String,
    public_members_url: String,
    avatar_url: String,
    description: String,
    githubUserId: String, // your custom tracking field
}, { strict: false });

module.exports = mongoose.model('GitHubOrg', OrgSchema, 'github_orgs');

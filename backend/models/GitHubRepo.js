const mongoose = require('mongoose');

const RepoSchema = new mongoose.Schema({
    id: Number,
    node_id: String,
    name: String,
    full_name: String,
    private: Boolean,
    owner_login: String,
    owner_id: Number,
    html_url: String,
    description: String,
    fork: Boolean,
    url: String,
    forks_count: Number,
    stargazers_count: Number,
    watchers_count: Number,
    language: String,
    open_issues_count: Number,
    default_branch: String,
    created_at: Date,
    updated_at: Date,
    pushed_at: Date,
    githubUserId: String,  // your custom tracking field
}, { strict: false });

module.exports = mongoose.model('GitHubRepo', RepoSchema, 'github_repos');

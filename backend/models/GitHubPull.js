const mongoose = require('mongoose');

const PullSchema = new mongoose.Schema({
    id: Number,                   // Pull request ID
    number: Number,               // PR number in repo
    state: String,                // e.g., 'open', 'closed', 'merged'
    title: String,
    body: String,
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merge_commit_sha: String,
    user_login: String,           // PR author login
    user_id: Number,
    assignee_login: String,
    assignee_id: Number,
    requested_reviewers_logins: [String], // Array of requested reviewers (simple strings)
    comments: Number,
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    html_url: String,
    githubUserId: String,         // your custom tracking field
}, { strict: false });

module.exports = mongoose.model('GitHubPull', PullSchema, 'github_pulls');

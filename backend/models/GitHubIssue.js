const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    id: Number,             // GitHub issue ID
    number: Number,         // Issue number in repo
    title: String,
    body: String,           // Issue description
    state: String,          // e.g., "open" or "closed"
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    user_login: String,     // Issue author login
    user_id: Number,
    assignee_login: String, // Single assignee login (optional)
    assignee_id: Number,
    comments: Number,       // Number of comments
    html_url: String,
    githubUserId: String,   // Your custom tracking field
}, { strict: false });

module.exports = mongoose.model('GitHubIssue', IssueSchema, 'github_issues');

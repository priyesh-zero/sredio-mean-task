const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema({
    sha: String,
    message: String,
    author_name: String,
    author_email: String,
    author_date: Date,
    committer_name: String,
    committer_email: String,
    committer_date: Date,
    url: String,
    githubUserId: String,  // your custom tracking field
}, { strict: false });

module.exports = mongoose.model('GitHubCommit', CommitSchema, 'github_commits');

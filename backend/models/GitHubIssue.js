const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('GitHubIssue', IssueSchema, 'github_issues');

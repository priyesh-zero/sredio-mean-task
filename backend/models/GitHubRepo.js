const mongoose = require('mongoose');

const RepoSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('GitHubRepo', RepoSchema, 'github_repos');

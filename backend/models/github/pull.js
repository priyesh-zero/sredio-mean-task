const mongoose = require('mongoose');

const PullSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('GitHubPull', PullSchema, 'github_pulls');

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('GitHubUser', UserSchema, 'github_users');

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: Number,
    login: String,
    node_id: String,
    avatar_url: String,
    gravatar_id: String,
    url: String,
    html_url: String,
    followers_url: String,
    following_url: String,
    gists_url: String,
    starred_url: String,
    subscriptions_url: String,
    organizations_url: String,
    repos_url: String,
    events_url: String,
    received_events_url: String,
    type: String,
    site_admin: Boolean,
    githubUserId: String, // your custom tracking field
}, { strict: false });

module.exports = mongoose.model('GitHubUser', UserSchema, 'github_users');

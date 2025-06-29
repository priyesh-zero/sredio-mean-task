const mongoose = require("mongoose");
const { UserSchema } = require("./_common-schema");

module.exports = mongoose.model("GitHubUser", UserSchema, "github_users");

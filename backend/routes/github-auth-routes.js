const express = require("express");
const router = express.Router();

const authController = require("../controllers/github-auth-controller");

// OAuth
router.get("/", authController.startGithubOAuth);
router.get("/callback", authController.handleGithubOAuthCallback);
router.get("/auth-status", authController.authStatus);
router.delete("/logout", authController.logout);

module.exports = router;

const express = require('express');
const router = express.Router();

const authController = require('../controllers/githubAuthController');
const dataController = require('../controllers/githubDataController');

// OAuth
router.get('/', authController.startGithubOAuth);
router.get('/callback', authController.handleGithubOAuthCallback);
router.get('/auth-status', authController.authStatus);
router.delete('/logout', authController.logout);

// Data
router.get('/collection-data', dataController.getCollectionData);

module.exports = router;

const express = require('express');
const router = express.Router();

const authController = require('../controllers/githubAuthController');
const dataController = require('../controllers/githubDataController');

// OAuth
router.get('/', authController.startGithubOAuth);
router.get('/callback', authController.githubCallback);

// Data
router.get('/status', dataController.getStatus);
router.delete('/', dataController.removeIntegration);
router.get('/collection-data', dataController.getCollectionData);

module.exports = router;

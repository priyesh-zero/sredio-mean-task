const express = require('express');
const router = express.Router();
const {
  sseSyncStream,
  startSync
} = require('../controllers/syncController');

router.get('/stream', sseSyncStream);
router.get('/start', startSync);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  sseSyncStream,
  startSync
} = require('../controllers/syncController');

router.get('/stream', sseSyncStream);
router.post('/start', startSync);

module.exports = router;

const { addClient, removeClient } = require('../helpers/syncStreams');
const syncAll = require('../helpers/syncAll');
const Integration = require('../models/Integration');

exports.sseSyncStream = (req, res) => {
  const clientId = req.query.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`event: connected\ndata: connected\n\n`);
  addClient(clientId, res);

  req.on('close', () => {
    removeClient(clientId);
  });
};

exports.startSync = async (req, res) => {
  const clientId = req.body.clientId;
  const integration = await Integration.findOne();
  if (!integration) {
    return res.status(400).json({ success: false, message: 'No integration found' });
  }
  const accessToken = integration.accessToken;
  const githubUserId = integration.githubId;
  syncAll(accessToken, clientId, githubUserId);
  res.json({ success: true, message: 'Sync started' });
};

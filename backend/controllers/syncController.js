const jwt = require("jsonwebtoken");
const Integration = require("../models/Integration");
const { addClient, removeClient } = require("../helpers/syncStreams");
const JobQueue = require("../services/JobQueue");

exports.sseSyncStream = (req, res) => {
  const clientId = req.query.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`event: connected\ndata: connected\n\n`);
  addClient(clientId, res);

  req.on("close", () => {
    removeClient(clientId);
  });
};

exports.startSync = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const githubId = decoded.githubId;

    const integration = await Integration.findOne({ githubId });
    if (!integration) {
      return res.status(400).json({
        success: false,
        message: "No integration found for this user",
      });
    }

    const job = await JobQueue.getInstance().add(
      "sync-organizations",
      integration._id,
      {},
      { priority: 1 },
    );

    res.json({ success: true, message: "Sync started" });
  } catch (err) {
    console.error("Sync Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during sync" });
  }
};

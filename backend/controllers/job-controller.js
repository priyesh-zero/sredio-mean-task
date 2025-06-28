const { getStats, cleanup, add: addJob } = require("../helpers/jobs/handlers");

exports.startUserSync = async (req, res) => {
  try {
    await addJob("sync-organizations", req.body.userId, {}, { priority: 1 });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cleanup = async (req, res) => {
  try {
    const cleaned = await cleanup();
    res.json({ cleaned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

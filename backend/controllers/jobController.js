const JobQueue = require("../services/JobQueue");

exports.jobStats = async (req, res) => {
  try {
    const stats = await JobQueue.getInstance().getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.jobCleanup = async (req, res) => {
  try {
    const cleaned = await await JobQueue.getInstance().cleanup();
    res.json({ cleaned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

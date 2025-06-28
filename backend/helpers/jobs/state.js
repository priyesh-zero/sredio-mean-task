exports.CONCURRENCY = 3; // Number of concurrent jobs
exports.POLL_INTERVAL = 5000; // 5 seconds
exports.RETRY_DELAYS = [30000, 300000, 1800000]; // 30s, 5m, 30m

exports.isProcessing = false;
exports.workers = new Map();

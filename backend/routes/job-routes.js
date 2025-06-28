const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job-controller");

router.get("/start-sync", jobController.startUserSync);
router.get("/stats", jobController.stats);
router.post("/cleanup", jobController.cleanup);

module.exports = router;

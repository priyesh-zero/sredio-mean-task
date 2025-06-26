const express = require("express");
const router = express.Router();
const { jobCleanup, jobStats } = require("../controllers/jobController");

router.get("/stats", jobStats);
router.post("/cleanup", jobCleanup);

module.exports = router;

const express = require("express");
const router = express.Router();

const dataController = require("../controllers/github-data-controller");

// Data
router.get("/", dataController.getCollectionData);

router.get("/facet-search", dataController.getFacetSearchOption);

module.exports = router;

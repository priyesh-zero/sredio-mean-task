const express = require("express");
const router = express.Router();

const dataController = require("../controllers/github-data-controller");

// Data
router.get("/", dataController.getCollectionData);

router.get("/facet-search", dataController.getFacetSearchOption);

router.get("/global-search", dataController.globalSearch);

module.exports = router;

const Integration = require('../models/Integration');
const Commit = require('../models/GitHubCommit');
const Pull = require('../models/GitHubPull');
const Issue = require('../models/GitHubIssue');
const Org = require('../models/GitHubOrg');
const Repo = require('../models/GitHubRepo');
const User = require('../models/GitHubUser');

exports.getStatus = async (req, res) => {
  try {
    const integration = await Integration.findOne();
    if (integration) {
      res.json({
        connected: true,
        username: integration.username,
        connectedAt: integration.connectedAt
      });
    } else {
      res.json({ connected: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeIntegration = async (req, res) => {
  try {
    await Integration.deleteOne();
    res.json({ success: true, message: 'Integration removed' });
  } catch (err) {
    console.error('Error removing integration:', err.message);
    res.status(500).json({ success: false, message: 'Failed to remove integration' });
  }
};

exports.getCollectionData = async (req, res) => {
  const { collection, page = 1, limit = 20, searchText = '' } = req.query;

  try {
    const modelMap = {
      Commits: Commit,
      Pulls: Pull,
      Issues: Issue,
      Orgs: Org,
      Repos: Repo,
      Users: User,
    };

    const Model = modelMap[collection];
    if (!Model) return res.status(400).json({ error: 'Invalid collection' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Get only string fields from the schema for safe $regex matching
    const excludedFields = ['_id', '__v'];
    const stringFields = Object.entries(Model.schema.paths)
      .filter(([key, type]) => type.instance === 'String' && !excludedFields.includes(key))
      .map(([key]) => key);


    const query = {};

    if (searchText) {
      if (stringFields.length === 0) {
        return res.json({ fields: [], data: [], total: 0 });
      }

      query.$or = stringFields.map(field => ({
        [field]: { $regex: searchText, $options: 'i' }
      }));
    }

    const docs = await Model.find(query).skip(skip).limit(limitVal);
    const total = await Model.countDocuments(query);

    const data = docs.map((doc) => doc.toObject());
    const fields = data.length ? Object.keys(data[0]) : [];

    res.json({ fields, data, total });
  } catch (err) {
    console.error('getCollectionData Error:', err);
    res.status(500).json({ error: err.message });
  }
};





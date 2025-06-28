const Integration = require("../models/integration");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const integration = await Integration.findOne({
      githubId: decoded.githubId,
    });

    if (!integration) {
      return res.status(400).json({
        success: false,
        message: "No integration found for this user",
      });
    }
    req.body.userId = integration._id;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = authMiddleware;

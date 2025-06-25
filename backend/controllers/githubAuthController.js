const axios = require('axios');
const jwt = require('jsonwebtoken');
const Integration = require('../models/Integration');

exports.startGithubOAuth = (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=repo,read:org,user&prompt=consent`;
  res.redirect(redirectUrl);
};

exports.handleGithubOAuthCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { accept: 'application/json' }
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userRes.data;
    const connectedAt = new Date();

    await Integration.updateOne(
      { githubId: user.id },
      { githubId: user.id, username: user.login, accessToken, connectedAt },
      { upsert: true }
    );

    // Create secure session cookie
    const token = jwt.sign({ githubId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false, // only on HTTPS
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      username: user.login,
      githubId: user.id,
      connectedAt
    });

  } catch (err) {
    console.error('OAuth Error:', err.message);
    return res.status(500).json({ success: false, error: 'GitHub authentication failed' });
  }
};

exports.authStatus = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ isConnected: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const integration = await Integration.findOne({ githubId: decoded.githubId });

    if (!integration) return res.status(404).json({ isConnected: false });

    res.json({
      isConnected: true,
      username: integration.username,
      connectedAt: integration.connectedAt
    });
  } catch (err) {
    return res.status(401).json({ isConnected: false });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const githubId = decoded.githubId;

    await Integration.deleteOne({ githubId });

    // Clear cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: false, // use true on production HTTPS
      sameSite: 'Lax'
    });

    res.json({ success: true, message: 'Integration removed and logged out' });
  } catch (err) {
    console.error('Error removing integration:', err.message);
    res.status(500).json({ success: false, message: 'Failed to remove integration' });
  }
};




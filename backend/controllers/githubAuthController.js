const axios = require('axios');
const Integration = require('../models/Integration');

exports.startGithubOAuth = (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=repo,read:org,user&prompt=consent`;
  res.redirect(redirectUrl);
};

exports.githubCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { accept: 'application/json' } }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userRes.data;

    const connectedAt = new Date();

    await Integration.updateOne(
      { githubId: user.id },
      {
        githubId: user.id,
        username: user.login,
        accessToken,
        connectedAt
      },
      { upsert: true }
    );

    res.send(`
      <script>
        window.opener.postMessage(${JSON.stringify({
      success: true,
      message: "GitHub connected, syncing started...",
      data: {
        username: user.login,
        githubId: user.id,
        connectedAt
      }
    })}, '*');
        window.close();
      </script>
    `);

  } catch (error) {
    console.error('OAuth Error:', error.message);
    res.send(`
      <script>
        window.opener.postMessage(${JSON.stringify({
      success: false,
      error: error.message
    })}, '*');
        window.close();
      </script>
    `);
  }
};

const axios = require('axios');
const Org = require('../models/GitHubOrg');
const Repo = require('../models/GitHubRepo');
const Commit = require('../models/GitHubCommit');
const Pull = require('../models/GitHubPull');
const Issue = require('../models/GitHubIssue');
const User = require('../models/GitHubUser');
const { sendToClient } = require('./syncStreams');

const GITHUB_API = 'https://api.github.com';

const syncAll = async (token, clientId, githubUserId) => {
  try {
    // Step 1: Fetch Organizations
    sendToClient(clientId, { stage: 'Fetching organizations...', step: 'ORGS', percent: 10 });
    const orgsRes = await axios.get(`${GITHUB_API}/user/orgs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const orgs = orgsRes.data.map(o => ({
      id: o.id,
      login: o.login,
      avatar_url: o.avatar_url,
      description: o.description,
      githubUserId,
    }));

    await Org.deleteMany({ githubUserId });
    await Org.insertMany(orgs);

    // Step 2: Fetch Repositories
    sendToClient(clientId, { stage: 'Fetching repositories...', step: 'REPOS', percent: 25 });
    const allRepos = [];

    for (const org of orgs) {
      try {
        const reposRes = await axios.get(`${GITHUB_API}/orgs/${org.login}/repos?per_page=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        allRepos.push(
          ...reposRes.data.map(r => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            private: r.private,
            owner_login: r.owner?.login,
            html_url: r.html_url,
            description: r.description,
            default_branch: r.default_branch,
            githubUserId,
          }))
        );
      } catch (e) {
        sendToClient(clientId, { stage: `Error fetching repos for ${org.login}: ${e.message}` });
      }
    }

    await Repo.deleteMany({ githubUserId });
    await Repo.insertMany(allRepos);

    // Step 3: Fetch Commits, Pull Requests, and Issues
    sendToClient(clientId, { stage: 'Fetching commits, pulls, issues...', step: 'DATA', percent: 50 });
    const allCommits = [], allPulls = [], allIssues = [];

    for (const repo of allRepos) {
      const base = `${GITHUB_API}/repos/${repo.owner_login}/${repo.name}`;
      try {
        const [commitsRes, pullsRes, issuesRes] = await Promise.all([
          axios.get(`${base}/commits?per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${base}/pulls?per_page=100&state=all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${base}/issues?per_page=100&state=all`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // Commits (Changelogs)
        allCommits.push(
          ...commitsRes.data.map(c => ({
            sha: c.sha,
            message: c.commit?.message,
            author_name: c.commit?.author?.name,
            author_email: c.commit?.author?.email,
            author_date: c.commit?.author?.date,
            committer_name: c.commit?.committer?.name,
            committer_email: c.commit?.committer?.email,
            committer_date: c.commit?.committer?.date,
            url: c.html_url,
            repoName: repo.name,
            githubUserId,
          }))
        );

        // Pull Requests
        allPulls.push(
          ...pullsRes.data.map(p => ({
            id: p.id,
            number: p.number,
            state: p.state,
            title: p.title,
            user_login: p.user?.login,
            assignee_login: p.assignee?.login,
            created_at: p.created_at,
            merged_at: p.merged_at,
            html_url: p.html_url,
            repoName: repo.name,
            githubUserId,
          }))
        );

        // Issues
        allIssues.push(
          ...issuesRes.data.map(i => ({
            id: i.id,
            number: i.number,
            title: i.title,
            user_login: i.user?.login,
            assignee_login: i.assignee?.login,
            state: i.state,
            created_at: i.created_at,
            closed_at: i.closed_at,
            body: i.body,
            pull_request: !!i.pull_request,
            html_url: i.html_url,
            repoName: repo.name,
            githubUserId,
          }))
        );
      } catch (e) {
        sendToClient(clientId, { stage: `Error fetching data for ${repo.name}: ${e.message}` });
      }
    }

    await Commit.deleteMany({ githubUserId });
    await Commit.insertMany(allCommits);

    await Pull.deleteMany({ githubUserId });
    await Pull.insertMany(allPulls);

    await Issue.deleteMany({ githubUserId });
    await Issue.insertMany(allIssues);

    // Step 4: Fetch Organization Members
    sendToClient(clientId, { stage: 'Fetching organization members...', step: 'USERS', percent: 80 });

    const uniqueUsersMap = new Map();

    for (const org of orgs) {
      try {
        const usersRes = await axios.get(`${GITHUB_API}/orgs/${org.login}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        for (const u of usersRes.data) {
          const key = `${u.id}_${org.login}`; // Composite key: user + org
          if (!uniqueUsersMap.has(key)) {
            uniqueUsersMap.set(key, {
              id: u.id,
              login: u.login,
              avatar_url: u.avatar_url,
              html_url: u.html_url,
              type: u.type,
              githubUserId,
              orgLogin: org.login,
            });
          }
        }
      } catch (e) {
        sendToClient(clientId, { stage: `Error fetching users for ${org.login}: ${e.message}` });
      }
    }

    const allUsers = Array.from(uniqueUsersMap.values());

    await User.deleteMany({ githubUserId });
    await User.insertMany(allUsers);


    // Done
    sendToClient(clientId, { stage: '[DONE] Sync completed successfully.', step: 'DONE', percent: 100 });

  } catch (err) {
    console.error('[SYNC ERROR]', err);
    sendToClient(clientId, { stage: `[FAILED] ${err.message}`, step: 'FAILED' });
  }
};

module.exports = syncAll;

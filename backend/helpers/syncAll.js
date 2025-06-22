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
    sendToClient(clientId, { stage: 'Fetching organizations...', step: 'ORGS', percent: 10 });

    const orgsRes = await axios.get(`${GITHUB_API}/user/orgs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Flatten orgs
    const orgs = orgsRes.data.map(o => ({
      id: o.id,
      login: o.login,
      node_id: o.node_id,
      url: o.url,
      repos_url: o.repos_url,
      events_url: o.events_url,
      hooks_url: o.hooks_url,
      issues_url: o.issues_url,
      members_url: o.members_url,
      public_members_url: o.public_members_url,
      avatar_url: o.avatar_url,
      description: o.description,
      githubUserId,
    }));

    await Org.deleteMany({ githubUserId });
    await Org.insertMany(orgs);

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
            node_id: r.node_id,
            name: r.name,
            full_name: r.full_name,
            private: r.private,
            owner_login: r.owner?.login,
            owner_id: r.owner?.id,
            html_url: r.html_url,
            description: r.description,
            fork: r.fork,
            url: r.url,
            forks_count: r.forks_count,
            stargazers_count: r.stargazers_count,
            watchers_count: r.watchers_count,
            language: r.language,
            open_issues_count: r.open_issues_count,
            default_branch: r.default_branch,
            created_at: r.created_at,
            updated_at: r.updated_at,
            pushed_at: r.pushed_at,
            githubUserId,
          }))
        );
      } catch (e) {
        sendToClient(clientId, { stage: `Skipping repos for ${org.login}: ${e.message}` });
      }
    }

    await Repo.deleteMany({ githubUserId });
    await Repo.insertMany(allRepos);

    sendToClient(clientId, { stage: 'Fetching commits, pulls, and issues...', step: 'DATA', percent: 50 });

    const allCommits = [], allPulls = [], allIssues = [];

    for (const repo of allRepos) {
      const base = `${GITHUB_API}/repos/${repo.owner_login}/${repo.name}`;
      try {
        const [commitsRes, pullsRes, issuesRes] = await Promise.all([
          axios.get(`${base}/commits?per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${base}/pulls?per_page=100&state=all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${base}/issues?per_page=100&state=all`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

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
            githubUserId,
          }))
        );

        allPulls.push(
          ...pullsRes.data.map(p => ({
            id: p.id,
            number: p.number,
            state: p.state,
            title: p.title,
            body: p.body,
            created_at: p.created_at,
            updated_at: p.updated_at,
            closed_at: p.closed_at,
            merged_at: p.merged_at,
            merge_commit_sha: p.merge_commit_sha,
            user_login: p.user?.login,
            user_id: p.user?.id,
            assignee_login: p.assignee?.login,
            assignee_id: p.assignee?.id,
            requested_reviewers_logins: p.requested_reviewers?.map(r => r.login) || [],
            comments: p.comments,
            commits: p.commits,
            additions: p.additions,
            deletions: p.deletions,
            changed_files: p.changed_files,
            html_url: p.html_url,
            githubUserId,
          }))
        );

        allIssues.push(
          ...issuesRes.data.map(i => ({
            id: i.id,
            number: i.number,
            title: i.title,
            user_login: i.user?.login,
            state: i.state,
            locked: i.locked,
            comments: i.comments,
            created_at: i.created_at,
            updated_at: i.updated_at,
            closed_at: i.closed_at,
            pull_request: !!i.pull_request,
            body: i.body,
            html_url: i.html_url,
            githubUserId,
          }))
        );
      } catch (e) {
        if (e.response?.status === 403 && e.response.headers['x-ratelimit-remaining'] === '0') {
          sendToClient(clientId, { stage: '[FAILED] GitHub rate limit exceeded. Try again later.' });
          return;
        }
        sendToClient(clientId, { stage: `Skipping repo ${repo.name}: ${e.message}` });
      }
    }

    await Commit.deleteMany({ githubUserId });
    await Commit.insertMany(allCommits);

    await Pull.deleteMany({ githubUserId });
    await Pull.insertMany(allPulls);

    await Issue.deleteMany({ githubUserId });
    await Issue.insertMany(allIssues);

    sendToClient(clientId, { stage: 'Fetching organization members...', step: 'USERS', percent: 80 });

    const allUsers = [];
    for (const org of orgs) {
      try {
        const usersRes = await axios.get(`${GITHUB_API}/orgs/${org.login}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allUsers.push(
          ...usersRes.data.map(u => ({
            id: u.id,
            login: u.login,
            node_id: u.node_id,
            avatar_url: u.avatar_url,
            gravatar_id: u.gravatar_id,
            url: u.url,
            html_url: u.html_url,
            followers_url: u.followers_url,
            following_url: u.following_url,
            gists_url: u.gists_url,
            starred_url: u.starred_url,
            subscriptions_url: u.subscriptions_url,
            organizations_url: u.organizations_url,
            repos_url: u.repos_url,
            events_url: u.events_url,
            received_events_url: u.received_events_url,
            type: u.type,
            site_admin: u.site_admin,
            githubUserId,
          }))
        );
      } catch (e) {
        sendToClient(clientId, { stage: `Skipping members for ${org.login}: ${e.message}` });
      }
    }

    await User.deleteMany({ githubUserId });
    await User.insertMany(allUsers);

    sendToClient(clientId, { stage: '[DONE] Sync completed successfully.', percent: 100, step: 'DONE' });

  } catch (err) {
    console.error('[SYNC ERROR]', err);
    sendToClient(clientId, { stage: `[FAILED] Sync failed: ${err.message}`, step: 'FAILED' });
  }
};

module.exports = syncAll;

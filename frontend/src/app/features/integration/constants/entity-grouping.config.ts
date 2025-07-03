export const ENTITY_GROUPING_FIELDS: Record<string, string[]> = {
  repos: ['owner.login', 'name', 'visibility'],                // Add repo name and visibility
  commits: ['author.login', 'committer.login', 'commit.message'], // Group by both author and committer
  issues: ['state', 'user.login', 'labels.name'],              // Add label name to group by label
  pulls: ['state', 'user.login', 'base.ref', 'head.ref'],      // Group by source/target branches
  changelogs: ['event', 'actor.login'],                        // Group by event and actor
  organizations: ['login', 'description'],                     // Add org description for clarity
  users: ['type'],                               // Add admin status
};
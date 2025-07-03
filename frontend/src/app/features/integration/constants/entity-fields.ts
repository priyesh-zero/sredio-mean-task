import { ENTITY } from './entity.constants';

export interface EntityField {
  field: string;
  label: string;
}

export const ENTITY_FIELDS: Record<(typeof ENTITY)[keyof typeof ENTITY], EntityField[]> = {
  [ENTITY.ORGS]: [
    { field: 'login', label: 'Organization Name' },
    { field: 'id', label: 'Organization ID' },
    { field: 'description', label: 'Description' },
    { field: 'url', label: 'Organization URL' },
    { field: 'repos.name', label: 'Repo Name' },
    { field: 'repos.description', label: 'Repo Description' },
    { field: 'repos.forks_count', label: 'Repo Forks (Count)' },
    { field: 'repos.open_issues_count', label: 'Repo Open Issues (Count)' },
    { field: 'repos.html_url', label: 'Repo URL' },
    { field: 'repos.created_at', label: 'Repo Created At' },
    { field: 'repos.updated_at', label: 'Repo Updated At' },
    { field: 'members.login', label: 'Member Username' },
    { field: 'members.type', label: 'Member Type' },
    { field: 'members.email', label: 'Member Email' },
  ],

  [ENTITY.REPOS]: [
    { field: 'name', label: 'Repo Name' },
    { field: 'full_name', label: 'Full Name' },
    { field: 'private', label: 'Private' },
    { field: 'owner.login', label: 'Owner' },
    { field: 'html_url', label: 'URL' },
    { field: 'description', label: 'Description' },
    { field: 'fork', label: 'Forked?' },
    { field: 'stargazers_count', label: 'Stars (Count)' },
    { field: 'forks_count', label: 'Forks (Count)' },
    { field: 'open_issues_count', label: 'Open Issues (Count)' },
    { field: 'created_at', label: 'Created At' },
    { field: 'updated_at', label: 'Updated At' },
  ],

  [ENTITY.USERS]: [
    { field: 'login', label: 'Username' },
    { field: 'name', label: 'Full Name' },
    { field: 'email', label: 'Email' },
    { field: 'type', label: 'Type' },
    { field: 'site_admin', label: 'Is Site Admin' },
    { field: 'user_view_type', label: 'View Type' },
  ],

  [ENTITY.COMMITS]: [
    { field: 'sha', label: 'SHA' },
    { field: 'commit.message', label: 'Commit Message' },
    { field: 'commit.author.name', label: 'Author' },
    { field: 'commit.author.email', label: 'Author Email' },
    { field: 'commit.author.date', label: 'Date' },
    { field: 'commit.committer.name', label: 'Committer' },
    { field: 'commit.committer.date', label: 'Committed Date' },
    { field: 'author.login', label: 'GitHub Author' },
  ],

  [ENTITY.PULLS]: [
    { field: 'number', label: 'PR Number' },
    { field: 'title', label: 'Title' },
    { field: 'user.login', label: 'Author' },
    { field: 'state', label: 'State' },
    // { field: 'created_at', label: 'Created At' },
    // { field: 'merged_at', label: 'Merged At' },
    // { field: 'closed_at', label: 'Closed At' },
    // { field: 'html_url', label: 'URL' },
  ],

  [ENTITY.ISSUES]: [
    { field: 'number', label: 'Issue Number' },
    { field: 'title', label: 'Title' },
    { field: 'state', label: 'State' },
    { field: 'user.login', label: 'Reporter' },
    { field: 'assignee.login', label: 'Assignee' },
    // { field: 'created_at', label: 'Created At' },
    // { field: 'updated_at', label: 'Updated At' },
    // { field: 'closed_at', label: 'Closed At' },
    // { field: 'html_url', label: 'URL' },
  ],

  [ENTITY.CHANGELOG]: [
    { field: 'event', label: 'Event Type' },
    { field: 'actor.login', label: 'Actor Username' },
    { field: 'actor.name', label: 'Actor Name' },
    { field: 'user.login', label: 'User Username' },
    { field: 'user.name', label: 'User Name' },
    { field: 'created_at', label: 'Created At' },
    { field: 'updated_at', label: 'Updated At' },
    { field: 'body', label: 'Comment / Body' },
    { field: 'author_association', label: 'Author Association' },
    { field: 'label.name', label: 'Label Name' },
    { field: 'lock_reason', label: 'Lock Reason' },
    { field: 'rename.to', label: 'Renamed To' },
  ],
};

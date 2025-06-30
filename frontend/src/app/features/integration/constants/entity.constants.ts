export const ENTITY = {
  ORGS: 'Orgs',
  REPOS: 'Repos',
  USERS: 'Users',
  COMMITS: 'Commits',
  PULLS: 'Pulls',
  ISSUES: 'Issues',
  CHANGELOG: 'Changelog'
} as const;

export type EntityType = typeof ENTITY[keyof typeof ENTITY];

export interface EntityOption {
  value: EntityType;
  label: string;
}

// Combine values + labels into one array
export const ENTITIES: EntityOption[] = [
  { value: ENTITY.ORGS, label: 'Organizations' },
  { value: ENTITY.REPOS, label: 'Repositories' },
  { value: ENTITY.USERS, label: 'Users' },
  { value: ENTITY.COMMITS, label: 'Commits' },
  { value: ENTITY.PULLS, label: 'Pull Requests' },
  { value: ENTITY.ISSUES, label: 'Issues' },
  { value: ENTITY.CHANGELOG, label: 'Changelog' }
];

export const ENTITY_HIERARCHY: Record<(typeof ENTITY)[keyof typeof ENTITY], (typeof ENTITY)[keyof typeof ENTITY] | null> = {
  [ENTITY.ORGS]: ENTITY.REPOS,
  [ENTITY.REPOS]: ENTITY.COMMITS,
  [ENTITY.USERS]: ENTITY.REPOS,
  [ENTITY.PULLS]: null,
  [ENTITY.ISSUES]: null,
  [ENTITY.CHANGELOG]: null,
  [ENTITY.COMMITS]: null
};



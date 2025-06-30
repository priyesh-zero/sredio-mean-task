// Enum-like constant for integration types
export const INTEGRATION = {
  GITHUB: 'GitHub'
} as const;

export type IntegrationType = typeof INTEGRATION[keyof typeof INTEGRATION];

// Interface for dropdown or metadata usage
export interface IntegrationOption {
  value: IntegrationType;
  label: string;
}

// Integration list with value + label
export const INTEGRATIONS: IntegrationOption[] = [
  { value: INTEGRATION.GITHUB, label: 'GitHub' }
];

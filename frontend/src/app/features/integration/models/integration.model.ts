export interface IGithubAuthResponse {
  connectedAt: string;
  isConnected: boolean;
  username: string;
}
export interface IUserAuth {
  isConnected: boolean;
  isLoading: boolean;
  username: string;
  connectedAt: Date | null;
  errorMessage: string;
}
export interface ISyncStatus {
  isSyncing: boolean;
  message: string;
  stats?: Record<string, number>;
}
export interface ICustomFilter {
  field: string;
  label: string;
  type: 'string' | 'boolean' | 'date' | 'dateRange' | 'select';
  value: any;
  options?: string[];
}

export interface IFacetOptionSuccess {
  success: true;
  data: {
    [key: string]: {
      name: string;
      type: 'single' | 'multi';
      options: string[];
    };
  };
}

export interface IFacetOptionError {
  success: false;
  error: string;
}

export interface IGlobalSearchSuccess {
  success: true;
  data: Record<string, { data: []; total: number }>;
}

export interface IGlobalSearchError {
  success: false;
  error: string;
}

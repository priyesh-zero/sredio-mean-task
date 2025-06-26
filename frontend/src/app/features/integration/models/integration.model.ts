export interface GithubAuthResponse {
  connectedAt: string;
  isConnected: boolean;
  username: string;
}

export interface UserAuthState {
  isConnected: boolean;
  isLoading: boolean;
  username: string;
  lastSynced: Date | null;
  errorMessage: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  message: string;
  progressPercent: number;
}

import { Component, NgZone } from '@angular/core';
import { IntegrationService } from './services/integration.service';
import { clearClientId, getClientId } from './utils/sync-client';
import {
  GithubAuthResponse,
  UserAuthState,
  SyncStatus,
} from './models/integration.model';

@Component({
  selector: 'app-integration',
  standalone: false,
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss'],
})
export class IntegrationComponent {
  user: UserAuthState = {
    isConnected: false,
    isLoading: true,
    username: '',
    lastSynced: null,
    errorMessage: '',
  };

  sync: SyncStatus = {
    isSyncing: false,
    message: '',
    progressPercent: 0,
  };

  expanded = true;

  constructor(
    private ngZone: NgZone,
    private integrationSvc: IntegrationService,
  ) {}

  ngOnInit(): void {
    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
      this.handleGithubCallback(code);
    } else {
      this.checkStatus();
    }
  }

  connect(): void {
    this.integrationSvc.initiateGithubLogin();
  }

  disconnect(): void {
    this.integrationSvc.logoutGithubIntegration().subscribe({
      next: () => (this.user.isConnected = false),
      error: (err) => {
        this.user.errorMessage = 'Logout failed. Please try again.';
        console.error('Logout failed', err);
      },
    });
  }

  checkStatus(): void {
    this.user.isLoading = true;

    this.integrationSvc.getAuthStatus().subscribe({
      next: (res: GithubAuthResponse) => {
        this.user.isConnected = res.isConnected;
        this.user.username = res.username;
        this.user.lastSynced = new Date(res.connectedAt);
        this.expanded = !res.isConnected;
      },
      error: () => this.resetAuthState(),
      complete: () => (this.user.isLoading = false),
    });
  }

  handleGithubCallback(code: string): void {
    this.integrationSvc.authenticateWithGithubCode(code).subscribe({
      next: (res: GithubAuthResponse) => this.setAuthSuccess(res),
      error: (err) => this.handleAuthError(err),
      complete: () => this.completeAuthAndStartSync(),
    });
  }

  private setAuthSuccess(res: GithubAuthResponse): void {
    this.user.isConnected = res.isConnected;
    this.user.username = res.username;
    this.user.lastSynced = new Date(res.connectedAt);
    this.user.errorMessage = '';
    this.user.isLoading = false;

    // Clean up URL
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());
  }

  private completeAuthAndStartSync(): void {
    this.expanded = false;
    this.integrationSvc.startUsersync().subscribe();
  }

  private handleAuthError(err: any): void {
    this.resetAuthState();
    this.user.errorMessage = 'GitHub authentication failed. Please try again.';
    console.error('GitHub auth failed:', err);
  }

  private resetAuthState(): void {
    this.user = {
      isConnected: false,
      isLoading: false,
      username: '',
      lastSynced: null,
      errorMessage: '',
    };
  }
}

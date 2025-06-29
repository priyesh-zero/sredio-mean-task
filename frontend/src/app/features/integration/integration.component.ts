import { Component, NgZone, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { IntegrationService } from './services/integration.service';
import { clearClientId, getClientId } from './utils/sync-client';
import {
  IGithubAuthResponse,
  IUserAuth,
  ISyncStatus,
} from './models/integration.model';
import { LSKeys, setToLS } from './utils/storage';
import { FilterDrawerService } from './services/filter-drawer.service';
@Component({
  selector: 'app-integration',
  standalone: false,
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss'],
})
export class IntegrationComponent {
  @ViewChild('drawer') drawer!: MatDrawer;

  user: IUserAuth = {
    isConnected: false,
    isLoading: true,
    username: '',
    lastSynced: null,
    errorMessage: '',
  };

  sync: ISyncStatus = {
    isSyncing: false,
    message: '',
    progressPercent: 0,
  };

  expanded = true;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private integrationSvc: IntegrationService,
    private drawerSvc: FilterDrawerService,
  ) { }

  ngOnInit(): void {
    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
      this.handleGithubCallback(code);
    } else {
      this.checkStatus();
    }
  }

  ngAfterViewInit(): void {
    // Register the drawer reference
    this.drawerSvc.setDrawer(this.drawer);
  }

  connect(): void {
    this.integrationSvc.initiateGithubLogin();
  }

  disconnect(): void {
    this.integrationSvc.logoutGithubIntegration().subscribe({
      next: () => {
        this.resetAuthState();
        this.integrationSvc.removeUser();
      },
      error: (err: Error) => {
        this.user.errorMessage = err.message;
      },
    });
  }

  checkStatus(): void {
    this.user.isLoading = true;

    this.integrationSvc.getAuthStatus().subscribe({
      next: (res: IGithubAuthResponse) => {
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
      next: (res: IGithubAuthResponse) => this.setAuthSuccess(res),
      error: (err) => this.handleAuthError(err),
      complete: () => {
        this.completeAuthAndStartSync();
        this.router.navigate(['/integration/result']);
      }
    });
  }

  private setAuthSuccess(res: IGithubAuthResponse): void {
    this.user = {
      ...res,
      isLoading: false,
      lastSynced: res.connectedAt ? new Date(res.connectedAt) : null,
      errorMessage: ''
    }
    setToLS(LSKeys.USER, this.user)
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

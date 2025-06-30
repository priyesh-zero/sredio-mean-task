import { Component, NgZone, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { IntegrationService } from './services/integration.service';
import {
  IGithubAuthResponse,
  IUserAuth,
  ISyncStatus,
} from './models/integration.model';
import { LSKeys, setToLS } from './utils/storage';
import { FilterDrawerService } from './services/filter-drawer.service';
import { SyncService } from './services/sync.service';
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
    connectedAt: null,
    errorMessage: '',
  };

  sync: ISyncStatus = {
    isSyncing: false,
    message: '',
    stats: {},
  };

  expanded = true;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private integrationSvc: IntegrationService,
    private syncSvc: SyncService,
    private drawerSvc: FilterDrawerService,
  ) { }

  ngOnInit(): void {
    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
      this.handleGithubCallback(code);
    } else {
      this.user.isLoading = true;
      this.integrationSvc.getAuthStatus().subscribe((user: IUserAuth) => {
        this.user = user;
        if (user.isConnected) {
          this.listenToSyncProgress();
        }
      });
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

  handleGithubCallback(code: string): void {
    this.integrationSvc.authenticateWithGithubCode(code).subscribe({
      next: (res: IGithubAuthResponse) => this.setAuthSuccess(res),
      error: (err) => this.handleAuthError(err),
      complete: () => {
        this.listenToSyncProgress(true);
        this.router.navigate(['/integration/result']);
      }
    });
  }

  private setAuthSuccess(res: IGithubAuthResponse): void {
    this.user = {
      ...res,
      isLoading: false,
      connectedAt: res.connectedAt ? new Date(res.connectedAt) : null,
      errorMessage: ''
    }
    setToLS(LSKeys.USER, this.user)
    // Clean up URL
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());
  }

  listenToSyncProgress(triggerSync: boolean = false): void {
    this.expanded = false;

    if (triggerSync) {
      this.syncSvc.startUserSync().subscribe();
    }

    const eventSource = this.syncSvc.connectToSyncStatus();

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as ISyncStatus;
      this.sync = data;
      this.ngZone.run(() => {
        if (!this.sync.isSyncing) {
          eventSource.close();
          this.sync.isSyncing = false;
        }
      });
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      this.sync.isSyncing = false;
    };
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
      connectedAt: null,
      errorMessage: '',
    };
  }
}

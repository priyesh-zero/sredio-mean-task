import { Component, NgZone } from '@angular/core';
import { IntegrationService } from './services/integration.service';
import { clearClientId, getClientId } from './utils/sync-client';
@Component({
  selector: 'app-integration',
  standalone: false,
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent {
  isLoadingStatus: boolean = true;
  isConnected: boolean = false;
  lastSynced: Date | null = null;
  expanded: boolean = true;
  username: string = '';
  isSyncing: boolean = false;
  syncMessage: string = '';
  syncProgressPercent: number = 0;
  errorMessage: string = '';

  constructor(private ngZone: NgZone, private integrationSvc: IntegrationService) { }

  ngOnInit() {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      this.handleGithubCallback(code);
    } else {
      this.checkStatus();
    }
    const existingClientId = getClientId();
    if (existingClientId) {
      this.listenToSyncProgress(existingClientId, false); // Don't re-trigger sync
    }
  }

  connect() {
    this.integrationSvc.initiateGithubLogin();
  }

  handleGithubCallback(code: string) {
    this.integrationSvc.authenticateWithGithubCode(code)
      .subscribe({
        next: (res: any) => {
          this.isLoadingStatus = false;
          this.isConnected = res.success;
          this.username = res.username;
          this.lastSynced = res.connectedAt;
          // Cleanup the URL
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.toString());
        },
        error: (err) => {
          this.isLoadingStatus = false;
          this.isConnected = false;
          this.username = '';
          this.lastSynced = null;
          this.errorMessage = 'GitHub authentication failed. Please try again.';
          console.error('GitHub auth failed:', err);
        },
        complete: () => {
          // If authentication was successful, start listening to sync progress
          this.errorMessage = '';
          this.expanded = false;
          this.isLoadingStatus = false;
          const clientId = getClientId(true);
          this.listenToSyncProgress(clientId, true); // Trigger sync after auth
        }
      });
  }

  disconnect() {
    this.integrationSvc.logoutGithubIntegration().subscribe({
      next: () => {
        this.isConnected = false;
      },
      error: (err) => {
        this.errorMessage = 'Logout failed. Please try again.';
        console.error('Logout failed', err);
      }
    });
  }

  checkStatus() {
    this.isLoadingStatus = true;
    this.integrationSvc.getAuthStatus().subscribe({
      next: (res: any) => {
        this.isConnected = res.isConnected;
        this.username = res.username;
        this.lastSynced = res.connectedAt;
        this.expanded = !res.isConnected;
      },
      error: () => {
        this.isLoadingStatus = false;
        this.isConnected = false;
        this.username = '';
      },
      complete: () => {
        this.isLoadingStatus = false;
      }
    });
  }

  listenToSyncProgress(clientId: string, triggerSync: boolean) {
    this.isSyncing = true;
    this.expanded = false;

    if (triggerSync) {
      this.integrationSvc.startDataSync(clientId).subscribe();
    }

    const eventSource = this.integrationSvc.createSyncStream(clientId);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      this.ngZone.run(() => {
        if (data.stage) this.syncMessage = data.stage;
        if (data.percent !== undefined) this.syncProgressPercent = data.percent;

        const isDone = data.stage?.includes('[DONE]');
        const isFailed = data.stage?.includes('[FAILED]');

        if (isDone || isFailed) {
          eventSource.close();
          clearClientId();
          this.isSyncing = false;
        }
      });
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      this.isSyncing = false;
    };
  }

}

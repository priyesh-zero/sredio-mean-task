import { Component, NgZone } from '@angular/core';
import { IntegrationService } from './services/integration.service';

interface SyncMessage {
  label: string;
  done: boolean;
}

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

  constructor(private ngZone: NgZone, private integrationSvc: IntegrationService) { }

  ngOnInit() {
    this.checkStatus();
  }

  connectIntegration() {
    const that = this;
    this.integrationSvc.connect();

    window.addEventListener(
      'message',
      (event) => {
        if (event.origin !== 'http://localhost:3000') return;

        if (event.data.success) {
          that.isConnected = true;
          that.lastSynced = new Date(event.data.data.connectedAt);
          that.username = event.data.data.username;
          that.listenToSyncProgress();
        } else {
          console.error('GitHub OAuth failed', event.data.error);
        }
      },
      { once: true }
    );
  }


  removeIntegration() {
    this.integrationSvc.removeIntegration().subscribe(() => {
      this.isConnected = false;
      this.username = '';
    });
  }

  checkStatus() {
    this.isLoadingStatus = true;
    this.integrationSvc.getStatus().subscribe({
      next: (res: any) => {
        this.isConnected = res.connected;
        this.username = res.username;
        this.lastSynced = res.connectedAt;
        this.expanded = !res.connected;
      },
      error: () => {
        this.isConnected = false;
        this.username = '';
      },
      complete: () => {
        this.isLoadingStatus = false;
      }
    });
  }

  listenToSyncProgress() {
    const clientId = Date.now().toString();
    this.isSyncing = true;
    this.expanded = false;

    this.integrationSvc.startSync(clientId).subscribe();

    const eventSource = this.integrationSvc.createSyncEventSource(clientId);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      this.ngZone.run(() => {
        if (data.stage) this.syncMessage = data.stage;
        if (data.percent !== undefined) this.syncProgressPercent = data.percent;

        if (data.stage?.includes('[DONE]') || data.stage?.includes('[FAILED]')) {
          eventSource.close();
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

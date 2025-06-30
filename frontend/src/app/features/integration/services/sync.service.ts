import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private API_BASE = 'http://localhost:3000/jobs';

  constructor(private http: HttpClient) { }

  startUserSync() {
    return this.http.get(`${this.API_BASE}/start-sync`, {
      withCredentials: true,
    });
  }

  connectToSyncStatus(): EventSource {
    return new EventSource(`${this.API_BASE}/sync-status`, {
      withCredentials: true
    });
  }

  getStats() {
    return this.http.get(`${this.API_BASE}/stats`, { withCredentials: true });
  }

  cleanup() {
    return this.http.post(`${this.API_BASE}/cleanup`, {}, { withCredentials: true });
  }
}

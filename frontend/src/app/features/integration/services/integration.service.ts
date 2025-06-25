import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { flattenObject, formatHeaderName } from '../utils/data-flattener';

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // -----------------------------
  // Authentication Methods
  // -----------------------------

  initiateGithubLogin(): void {
    window.location.href = `${this.api}/auth/github`;
  }

  getAuthStatus() {
    return this.http.get(`${this.api}/auth/github/auth-status`, {
      withCredentials: true
    });
  }

  authenticateWithGithubCode(code: string) {
    return this.http.get(`${this.api}/auth/github/callback?code=${code}`, {
      withCredentials: true
    });
  }

  logoutGithubIntegration() {
    return this.http.delete(`${this.api}/auth/github/logout`, {
      withCredentials: true
    });
  }

  // -----------------------------
  // Data Fetching Methods
  // -----------------------------

  getCollectionData(
    collection: string,
    page = 0,
    limit = 20,
    searchText = ''
  ) {
    const params = new HttpParams()
      .set('collection', collection)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('searchText', searchText);

    return this.http.get<{
      fields: string[];
      data: any[];
      total: number;
    }>(`${this.api}/auth/github/collection-data`, { params });
  }

  generateColumnDefs(data: any[]): ColDef[] {
    if (!data?.length) return [];

    const sample = flattenObject(
      data.reduce((a, b) =>
        Object.keys(flattenObject(b)).length > Object.keys(flattenObject(a)).length ? b : a
      )
    );

    return Object.keys(sample).map((key) => ({
      field: key,
      headerName: formatHeaderName(key),
      resizable: true,
      sortable: true,
      filter: true,
      tooltipField: key,
      valueGetter: (params) => params.data[key]
    }));
  }

  // -----------------------------
  // Sync Methods (SSE + Trigger)
  // -----------------------------

  createSyncStream(clientId: string): EventSource {
    return new EventSource(`${this.api}/sync/stream?id=${clientId}`);
  }

  startDataSync(clientId: string) {
    return this.http.get(`${this.api}/sync/start?id=${clientId}`, {
      withCredentials: true
    });
  }
}

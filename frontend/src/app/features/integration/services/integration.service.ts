import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { flattenObject, formatHeaderName } from '../utils/data-flattener';
import { Observable } from 'rxjs';
import { GithubAuthResponse } from '../models/integration.model';

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

  getAuthStatus(): Observable<GithubAuthResponse> {
    return this.http.get<GithubAuthResponse>(`${this.api}/auth/github/auth-status`, {
      withCredentials: true
    });
  }

  authenticateWithGithubCode(code: string): Observable<GithubAuthResponse> {
    return this.http.get<GithubAuthResponse>(`${this.api}/auth/github/callback?code=${code}`, {
      withCredentials: true
    });
  }

  logoutGithubIntegration(): Observable<any> {
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

    return Object.keys(sample).map((key) => {
      const value = sample[key];

      const isImage = typeof value === 'string' && value.includes('avatar');
      const isUrl = typeof value === 'string' && /^https?:\/\//.test(value) && !isImage;
      const isEnabledField = typeof value === 'string' && (String(value).toLowerCase() === 'enabled' || String(value).toLowerCase() === 'disabled');
      const isBoolean = typeof value === 'boolean';

      return {
        field: key,
        headerName: formatHeaderName(key),
        resizable: true,
        sortable: true,
        filter: true,
        tooltipField: key,
        valueGetter: (params) => params.data[key],
        cellRenderer: (params: any) => {
          const val = params.value;

          // Handle undefined or null values
          if (val === undefined || val === null) return '';

          // For 'enabled' or 'disabled' string values
          if (isEnabledField) {
            const isEnabled = String(val).toLowerCase() === 'enabled';
            const color = isEnabled ? '#89ad8b' : '#dd7f79';
            const label = isEnabled ? 'Enabled' : 'Disabled';

            return `
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="width:12px; height:12px; border-radius:50%; background-color:${color}; display:inline-block;"></span>
                <span>${label}</span>
              </span>
            `;
          }

          // Booleans
          if (isBoolean) {
            return `<input type="checkbox" disabled ${val ? 'checked' : ''} style="accent-color: #4caf50;"  />`;
          }

          // Image (avatar)
          if (isImage) {
            return `<img src="${val}" alt="avatar" style="width: 32px; height: 32px; border-radius: 50%;" />`;
          }

          // URL
          if (isUrl) {
            return `<a href="${val}" target="_blank" style="text-decoration: none; color: #1976d2;">${val}</a>`;
          }

          return val;
        }
      };
    });
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

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getStatus() {
    return this.http.get(`${this.api}/auth/github/status`);
  }

  removeIntegration() {
    return this.http.delete(`${this.api}/auth/github`);
  }

  connect(): Window | null {
    const width = 600;
    const height = 600;

    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'resizable=no',
      'scrollbars=no',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'status=no'
    ].join(',');

    return window.open(`${this.api}/auth/github`, '_blank', features);
  }

  getCollectionData(
    collection: string,
    page: number = 0,
    limit: number = 20,
    searchText: string = ''
  ) {
    const params = new HttpParams()
      .set('collection', collection)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('searchText', searchText.toString());

    return this.http.get<{
      fields: string[];
      data: any[];
      total: number;
    }>(`${this.api}/auth/github/collection-data`, { params });
  }


  createSyncEventSource(clientId: string): EventSource {
    return new EventSource(`${this.api}/sync/stream?id=${clientId}`);
  }

  startSync(clientId: string) {
    return this.http.post(`${this.api}/sync/start`, { clientId });
  }

}

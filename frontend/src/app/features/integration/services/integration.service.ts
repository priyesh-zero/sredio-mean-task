import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGithubAuthResponse, IUserAuth } from '../models/integration.model';
import { Router } from '@angular/router';
import { getFromLS, LSKeys, removeFromLS } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) { }

  // -----------------------------
  // Authentication Methods
  // -----------------------------

  initiateGithubLogin(): void {
    window.location.href = `${this.api}/auth/github`;
  }

  getAuthStatus(): Observable<IGithubAuthResponse> {
    return this.http.get<IGithubAuthResponse>(
      `${this.api}/auth/github/auth-status`,
      {
        withCredentials: true,
      },
    );
  }

  authenticateWithGithubCode(code: string): Observable<IGithubAuthResponse> {
    return this.http.get<IGithubAuthResponse>(
      `${this.api}/auth/github/callback?code=${code}`,
      {
        withCredentials: true,
      },
    );
  }

  logoutGithubIntegration(): Observable<any> {
    return this.http.delete(`${this.api}/auth/github/logout`, {
      withCredentials: true,
    });
  }

  isLoggedIn(): boolean {
    const authData = getFromLS<IUserAuth>(LSKeys.USER);
    if (!authData) return false;

    try {
      return authData.isConnected === true;
    } catch {
      return false;
    }
  }

  removeUser(): void {
    removeFromLS(LSKeys.USER);
    this.router.navigate(['/integration']);
  }


  // -----------------------------
  // Data Fetching Methods
  // -----------------------------

  getCollectionData(collection: string, page = 0, limit = 20, searchText = '') {
    const params = new HttpParams()
      .set('collection', collection)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('searchText', searchText);

    return this.http.get<{
      fields: string[];
      data: any[];
      total: number;
    }>(`${this.api}/github/collection`, { params, withCredentials: true });
  }

  // -----------------------------
  // Sync Methods (SSE + Trigger)
  // -----------------------------

  startDataSync(clientId: string) {
    return this.http.get(`${this.api}/sync/start?id=${clientId}`, {
      withCredentials: true,
    });
  }

  // job api
  startUsersync(): Observable<any> {
    return this.http.get(`${this.api}/jobs/start-sync`, {
      withCredentials: true,
    });
  }
}

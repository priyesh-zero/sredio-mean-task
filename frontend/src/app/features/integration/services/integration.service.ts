import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  ICustomFilter,
  IFacetOptionError,
  IFacetOptionSuccess,
  IGithubAuthResponse,
  IGlobalSearchError,
  IGlobalSearchSuccess,
  IUserAuth,
} from '../models/integration.model';
import { Router } from '@angular/router';
import { getFromLS, LSKeys, removeFromLS, setToLS } from '../utils/storage';
import { EntityType } from '../constants/entity.constants';
import {
  FacetedFilterPayload,
  FacetedFilterService,
} from './faceted-filter.service';
import { formatDate } from '../utils/utility';

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private api = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // -----------------------------
  // Authentication Methods
  // -----------------------------

  initiateGithubLogin(): void {
    window.location.href = `${this.api}/auth/github`;
  }

  getAuthStatus(): Observable<IUserAuth> {
    return this.http
      .get<IGithubAuthResponse>(`${this.api}/auth/github/auth-status`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          const user: IUserAuth = {
            isConnected: res.isConnected,
            username: res.username,
            connectedAt: new Date(res.connectedAt),
            isLoading: false,
            errorMessage: '',
          };
          setToLS(LSKeys.USER, user);
          return user;
        }),
        catchError((err) => {
          const fallback: IUserAuth = {
            isConnected: false,
            isLoading: false,
            username: '',
            connectedAt: null,
            errorMessage: '',
          };
          setToLS(LSKeys.USER, fallback);
          return of(fallback);
        }),
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

  getCollectionData(
    collection: EntityType,
    page = 1,
    limit = 20,
    searchText = '',
    facetOptions?: FacetedFilterPayload['selected'],
    customFilter?: ICustomFilter[],
  ) {
    const params = new HttpParams()
      .set('collection', collection)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('searchText', searchText)
      .set(
        'facet',
        facetOptions && facetOptions.length > 0
          ? JSON.stringify(facetOptions)
          : JSON.stringify([]),
      )
      .set(
        'custom',
        customFilter && customFilter.length > 0
          ? JSON.stringify(
              customFilter
                .filter((option) => option.value !== '' && option.value != null)
                .map((option) => {
                  if (option.type === 'date' && option.value instanceof Date) {
                    return {
                      ...option,
                      value: formatDate(option.value),
                    };
                  }

                  if (
                    option.type === 'dateRange' &&
                    option.value?.from &&
                    option.value?.to
                  ) {
                    return {
                      ...option,
                      value: {
                        from: formatDate(new Date(option.value.from)),
                        to: formatDate(new Date(option.value.to)),
                      },
                    };
                  }

                  return option;
                }),
            )
          : JSON.stringify([]),
      );
    return this.http.get<{
      fields: string[];
      data: any[];
      relations: string[];
      total: number;
    }>(`${this.api}/github/collection/`, { params, withCredentials: true });
  }

  getFacetSearchOptions(
    collection: EntityType,
  ): Observable<IFacetOptionSuccess | IFacetOptionError> {
    const params = new HttpParams().set('collection', collection);

    return this.http.get<IFacetOptionSuccess | IFacetOptionError>(
      `${this.api}/github/collection/facet-search`,
      {
        params,
        withCredentials: true,
      },
    );
  }

  getGlobalSearch(
    searchTerm: string,
    paginationQuery: Record<string, { page: number; limit: number }> = {},
  ): Observable<IGlobalSearchSuccess | IGlobalSearchError> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('pagination', JSON.stringify(paginationQuery));

    return this.http.get<IGlobalSearchSuccess | IGlobalSearchError>(
      `${this.api}/github/collection/global-search`,
      {
        params,
        withCredentials: true,
      },
    );
  }

  findUser(ticketId: string) {
    const params = new HttpParams().set('ticketId', ticketId);
    return this.http.get(`${this.api}/github/collection/ticket`, {
      params,
      withCredentials: true,
    });
  }
}

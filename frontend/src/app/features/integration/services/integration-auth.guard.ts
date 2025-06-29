import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IntegrationService } from './integration.service';

@Injectable({
  providedIn: 'root'
})
export class IntegrationAuthGuard implements CanActivate {
  constructor(
    private integrationSvc: IntegrationService,
    private router: Router
  ) { }

  canActivate(): boolean {
    const isLoggedIn = this.integrationSvc.isLoggedIn();
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['/integration']);
      return false;
    }
  }
}

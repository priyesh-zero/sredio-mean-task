import { Component } from '@angular/core';
import { IntegrationService } from '../services/integration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'integration-landing',
  standalone: false,
  templateUrl: './integration-landing.component.html',
  styleUrls: ['./integration-landing.component.scss']
})
export class IntegrationLandingComponent {
  isLoggedIn: boolean = false;
  constructor(private router: Router, private integrationSvc: IntegrationService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.integrationSvc.isLoggedIn();
    // if (this.isLoggedIn) {
    //   this.goToResult();
    // }
  }

  goToResult(): void {
    this.router.navigate(['integration/result']);
  }
}

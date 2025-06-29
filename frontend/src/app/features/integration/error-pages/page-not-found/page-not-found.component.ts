import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'integration-page-not-found',
  standalone: false,
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {
  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

import { Component, Input } from '@angular/core';
@Component({
  selector: 'integration-toolbar',
  standalone: false,
  templateUrl: './integration-toolbar.component.html',
  styleUrls: ['./integration-toolbar.component.scss']
})
export class IntegrationToolbarComponent {
  @Input() expanded = true;

  isMenuOpen = false;

  constructor() { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

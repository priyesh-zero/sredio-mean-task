import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IUserAuth, ISyncStatus } from '../../models/integration.model';
@Component({
  selector: 'integration-header',
  standalone: false,
  templateUrl: './integration-header.component.html',
  styleUrls: ['./integration-header.component.scss']
})
export class IntegrationHeaderComponent {
  @Input() user!: IUserAuth;
  @Input() sync!: ISyncStatus;
  @Input() expanded = true;

  @Output() connectClicked = new EventEmitter<void>();
  @Output() disconnectClicked = new EventEmitter<void>();

  isMenuOpen = false;

  constructor() { }

  connect() {
    this.connectClicked.emit();
  }

  disconnect() {
    this.disconnectClicked.emit();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

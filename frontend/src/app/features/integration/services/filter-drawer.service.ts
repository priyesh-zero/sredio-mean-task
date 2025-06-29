// src/app/services/filter-drawer.service.ts
import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';

export interface FilterDrawerState {
  open: boolean;
  payload: any;
}

@Injectable({ providedIn: 'root' })
export class FilterDrawerService {
  private drawerRef: MatDrawer | null = null;

  private drawerStateSubject = new BehaviorSubject<FilterDrawerState>({
    open: false,
    payload: null
  });

  drawerState$ = this.drawerStateSubject.asObservable();

  setDrawer(drawer: MatDrawer) {
    this.drawerRef = drawer;
  }

  openDrawer(payload: any = null) {
    this.drawerStateSubject.next({ open: true, payload });
    this.drawerRef?.open();
  }

  closeDrawer() {
    this.drawerStateSubject.next({ open: false, payload: null });
    this.drawerRef?.close();
  }

  toggleDrawer(payload: any = null) {
    const isOpen = this.drawerRef?.opened ?? false;
    this.drawerStateSubject.next({ open: !isOpen, payload: !isOpen ? payload : null });
    this.drawerRef?.toggle();
  }
}

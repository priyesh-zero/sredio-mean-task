import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'integration-find-user',
  standalone: false,
  templateUrl: './find-user.component.html',
  styleUrls: ['./find-user.component.scss']
})
export class FindUserComponent implements OnInit {
  ticketId: string = '';

  ticketDetail: {
    title: string;
    status: string;
    createdAt: string;
    createdBy: string;
  } | null = null;

  rowData: any[] = [];

  columnDefs: ColDef[] = [
    { headerName: 'User', field: 'user', sortable: true, filter: true, width: 120 },
    { headerName: 'Action', field: 'action', sortable: true, filter: true, width: 130 },
    { headerName: 'Message', field: 'message', flex: 1, cellStyle: { 'white-space': 'normal' } },
    { headerName: 'Date', field: 'date', sortable: true, filter: true, width: 140 }
  ];

  defaultColDef: ColDef = {
    resizable: true
  };

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.ticketId = params['ticketId'];

      this.mockFetchTicketDetail(this.ticketId);
      this.mockFetchUserActivity(this.ticketId);
    });
  }

  mockFetchTicketDetail(ticketId: string) {
    // Simulate fetching ticket detail
    this.ticketDetail = {
      title: 'Fix login bug on mobile devices',
      status: 'Open',
      createdAt: '2024-07-01',
      createdBy: 'alice'
    };
  }

  mockFetchUserActivity(ticketId: string): void {
    // Simulate user activity data
    this.rowData = [
      {
        user: 'alice',
        action: 'commented',
        message: 'This issue occurs on Android 13 devices.',
        date: '2024-07-02'
      },
      {
        user: 'bob',
        action: 'assigned',
        message: 'Assigned to QA team.',
        date: '2024-07-03'
      },
      {
        user: 'carol',
        action: 'closed',
        message: 'Issue resolved in commit abc123.',
        date: '2024-07-05'
      }
    ];
  }
}

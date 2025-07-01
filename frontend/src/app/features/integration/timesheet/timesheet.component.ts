import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';

@Component({
  selector: 'integration-timesheet',
  standalone: false,
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent {
  searchTerm = '';

  rowData = [
    {
      ticketId: 'GH-101',
      issueUrl: 'https://github.com/org/repo/issues/101',
      title: 'Fix login bug',
      status: 'Open',
      createdBy: 'alice'
    },
    {
      ticketId: 'GH-102',
      issueUrl: 'https://github.com/org/repo/issues/102',
      title: 'Update readme',
      status: 'Closed',
      createdBy: 'bob'
    }
  ];

  columnDefs: ColDef[] = [
    {
      headerName: 'Action',
      field: 'ticketId',
      cellRenderer: (params: any) => {
        const id = params.data.ticketId;
        return `<a href="integration/find-user?ticketId=${id}" target="_blank">Find User</a>`;
      }
    },
    { headerName: 'Ticket ID', field: 'ticketId', sortable: true, filter: true },
    { headerName: 'Title', field: 'title', sortable: true, filter: true },
    { headerName: 'Status', field: 'status', sortable: true, filter: true },
    { headerName: 'Created By', field: 'createdBy', sortable: true, filter: true }
  ];

  defaultColDef: ColDef = {
    resizable: true
  };

  get filteredData() {
    if (!this.searchTerm) return this.rowData;
    const term = this.searchTerm.toLowerCase();
    return this.rowData.filter(row =>
      Object.values(row).some(value =>
        value.toString().toLowerCase().includes(term)
      )
    );
  }
}

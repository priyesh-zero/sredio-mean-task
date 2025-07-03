import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ColDef, GridOptions } from 'ag-grid-community';
import { IntegrationService } from '../services/integration.service';
import { ENTITY } from '../constants/entity.constants';
import { flattenObject, generateFlatColumnDefs } from '../utils/data-flattener';

@Component({
  selector: 'integration-find-user',
  standalone: false,
  templateUrl: './find-user.component.html',
  styleUrls: ['./find-user.component.scss'],
})
export class FindUserComponent implements OnInit {
  ticketId: string = '';

  ticketDetail: {
    title: string;
    state: string;
    closed_at: string;
    closed_by: string;
    created_at: string;
    user: {
      name: string;
      login: string
    }
  } | null = null;

  rowData: any[] = [];

  columnDefs: ColDef[] = [];

  defaultColDef: ColDef = {
    resizable: true,
  };

  constructor(
    private route: ActivatedRoute,
    private intgrationSvc: IntegrationService,
  ) { }

  gridOptions: GridOptions = {
    masterDetail: true,
    detailCellRendererParams: (params: any) => {
      const detailData = params.data?.changelog ?? [];
      const flattenedData = detailData.map((item: any) => flattenObject(item));
      const generatedCols = generateFlatColumnDefs(flattenedData);
      const dynamicCols = generatedCols.length > 0
        ? generatedCols
        : [];

      return {
        detailGridOptions: {
          columnDefs: dynamicCols,
          defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
            flex: 1,
            minWidth: 220
          }
        },
        getDetailRowData: (detailParams: any) => {

          detailParams.successCallback(flattenedData);
        }
      };
    }
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.ticketId = params['ticketId'];
      this.intgrationSvc.findUser(this.ticketId).subscribe((response: any) => {
        // Extract only the first record from the response, as we expect a single user who closed the ticket.
        // This prevents issues caused by duplicate or multiple entries in the data array.
        const firstItemOnly = response.data?.length > 0 ? [response.data[0]] : [];
        const keysToSkip = ['changelog'];
        const flattenedData = firstItemOnly.map((item) => flattenObject(item, '', {}, keysToSkip));
        const generatedCols = generateFlatColumnDefs(flattenedData, keysToSkip, ENTITY.CHANGELOG);
        if (generatedCols.length > 0) {
          generatedCols[0] = {
            ...generatedCols[0],
            cellRenderer: 'agGroupCellRenderer', // This adds the expand icon
          };
        }
        this.columnDefs = generatedCols;
        this.rowData = flattenedData;
        this.ticketDetail = firstItemOnly[0];
      });
    });
  }
}

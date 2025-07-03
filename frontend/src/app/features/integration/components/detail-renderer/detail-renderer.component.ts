import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IDetailCellRendererParams, ColDef } from 'ag-grid-community';
import { flattenObject, generateFlatColumnDefs } from '../../utils/data-flattener';

@Component({
  selector: 'app-detail-renderer',
  standalone: false,
  templateUrl: './detail-renderer.component.html',
  styleUrls: ['./detail-renderer.component.scss']
})
export class DetailRendererComponent implements ICellRendererAngularComp {
  tabs: string[] = [];
  selectedTab: string = '';
  dataMap: Record<string, any[]> = {};
  columnMap: Record<string, ColDef[]> = {};
  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 250,
  };

  agInit(params: IDetailCellRendererParams): void {
    const rowData = params.data;

    // Extract all array fields from rowData
    const arrayFields = Object.entries(rowData).filter(([_, val]) => Array.isArray(val));

    this.tabs = arrayFields.map(([key]) => key);
    this.selectedTab = this.tabs[0];

    arrayFields.forEach(([key, value]) => {
      const items = value as Record<string, any>[];
      const flatData = items.map(item => flattenObject(item));
      this.dataMap[key] = flatData;
      this.columnMap[key] = generateFlatColumnDefs(flatData);
    });
  }

  onTabChange(index: number): void {
    this.selectedTab = this.tabs[index];
  }

  getRowData(tab: string): any[] {
    return this.dataMap[tab] || [];
  }

  getColumnDefs(tab: string): ColDef[] {
    return this.columnMap[tab] || [];
  }

  get selectedTabIndex(): number {
    return this.tabs.indexOf(this.selectedTab);
  }

  refresh(): boolean {
    return false;
  }
}

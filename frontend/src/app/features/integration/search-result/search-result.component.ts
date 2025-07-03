import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ENTITIES } from '../constants/entity.constants';
import { IntegrationService } from '../services/integration.service';
import { flattenObject, generateFlatColumnDefs } from '../utils/data-flattener';

type TabData = {
  key: string;
  label: string;
  data: any[];
  page: number;
  pageSize: number;
  total: number;
};
@Component({
  selector: 'integration-search-result',
  standalone: false,
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
})
export class SearchResultComponent implements OnInit {
  title = 'Search Results';
  searchKeyword = '';

  resultData: Record<string, { data: any[]; total: number }> = {};
  filteredTabs: TabData[] = [];
  activeTabIndex = 0;

  isInitialLoad: boolean = true;

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  constructor(
    private route: ActivatedRoute,
    private integrationSvc: IntegrationService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchKeyword = params['keyword']?.trim().toLowerCase() || '';
      this.loadInitialTabData();
    });
  }

  loadInitialTabData(): void {
    this.integrationSvc.getGlobalSearch(this.searchKeyword, {})
      .subscribe((response) => {
        this.isInitialLoad = false;
        if (!response.success) {
          console.log(response.error);
          return;
        }

        this.resultData = response.data;

        this.filteredTabs = Object.entries(this.resultData || {})
          .filter(([, val]) => val?.data?.length > 0)
          .map(([key, val]) => {
            const match = ENTITIES.find(
              (e) => e.value.toLowerCase() === key.toLowerCase()
            );
            return {
              key,
              label: match?.label || key,
              data: [],
              page: 1,
              pageSize: 10,
              total: val.total || val.data.length,
            };
          });

        if (this.filteredTabs.length > 0) {
          this.loadTabData(this.filteredTabs[0]);
        }
      }, (error) => {
        this.isInitialLoad = false;
      });
  }

  loadTabData(tab: TabData): void {
    this.integrationSvc
      .getGlobalSearch(this.searchKeyword, {
        [tab.key]: {
          limit: tab.pageSize,
          page: tab.page,
        },
      })
      .subscribe((response) => {
        if (!response.success) {
          console.log(response.error);
          return;
        }

        const tabResult = response.data?.[tab.key];
        tab.data = (tabResult?.data || []).map((item: any) => flattenObject(item));
        tab.total = tabResult?.total || tab.data.length;
      });
  }

  onPageChange(tabKey: string, newPage: number): void {
    const tab = this.filteredTabs.find((t) => t.key === tabKey);
    if (!tab || tab.page === newPage) return;

    tab.page = newPage;
    this.loadTabData(tab);
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
    const tab = this.filteredTabs[index];
    if (tab && tab.data.length === 0) {
      tab.page = 1;
      this.loadTabData(tab);
    }
  }

  getColumnDefs(data: any[], entity: string = ''): any[] {
    return generateFlatColumnDefs(data, [], entity, true); // grouping true
  }
}

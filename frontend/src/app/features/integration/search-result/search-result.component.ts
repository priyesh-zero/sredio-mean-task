import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ENTITIES, EntityOption } from '../constants/entity.constants';

@Component({
  selector: 'integration-search-result',
  standalone: false,
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
  title = 'Search Results';
  searchKeyword = '';

  resultData: Record<string, any[]> = {
    repos: [{ id: 1, name: 'Repo 1', organization: 'org', date: '12-06-2025', owner: 'Alice', user: 'Job', private: "Yes", description: 'testing Repo' }],
    commits: [{ id: 201, message: 'Initial commit', organization: 'org', date: '12-06-2025', user: 'Alice', owner: 'Alice', block: "Yes" }],
    issues: []
  };

  filteredTabs: { key: string; label: string; data: any[] }[] = [];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchKeyword = params['keyword']?.trim().toLowerCase() || '';
      this.buildFilteredTabs();
    });
  }

  buildFilteredTabs(): void {
    this.filteredTabs = Object.entries(this.resultData)
      .filter(([, value]) => Array.isArray(value) && value.length > 0)
      .map(([key, value]) => {
        const match = ENTITIES.find(e => e.value.toLowerCase() === key.toLowerCase());
        return {
          key,
          label: match?.label || key,
          data: value
        };
      });
  }

  getColumnDefs(data: any[]): any[] {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0]).map(field => ({
      headerName: this.capitalize(field),
      field
    }));
  }

  capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}

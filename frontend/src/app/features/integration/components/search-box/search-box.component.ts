import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'integration-search-box',
  standalone: false,
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent {
  keyword: string = '';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword']?.trim().toLowerCase() || '';
    });
  }

  onSearch(): void {
    const trimmedkeyword = this.keyword.trim();
    if (trimmedkeyword) {
      this.router.navigate(['integration/search-result'], {
        queryParams: { keyword: trimmedkeyword },
      });
    }
  }
}

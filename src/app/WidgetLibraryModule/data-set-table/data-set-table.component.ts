import { RowHeightCache } from '@swimlane/ngx-datatable/release/utils';
import { Component, Input } from '@angular/core';


interface DataSet {
    columns: string[];
    data: string [][];
}

@Component({
  selector: 'app-data-set-table',
  templateUrl: './data-set-table.component.html',
  styleUrls: ['./data-set-table.component.css']
})
export class DataSetTableComponent {

  pageSize = 30;
  currentPage = 0;
  minPage = 0;
  maxPage = 0;
  columns: string[] = [];
  rows: string[][] = [];
  filterRows: string[][] = [];
  filter = '';

  @Input() set dataset(value: any) {

    if (value) {
      this.columns = value.columns;
      this.rows = value.data;
      this.minPage = 1;
      this.currentPage = 1;
      this.ApplyFilter();
    } else {
      this.currentPage = 0;
      this.minPage = 0;
      this.maxPage = 0;
    }

  }

  onFilterChanged (newValue: string) {
    this.filter = newValue;
    this.ApplyFilter();
  }

   ApplyFilter() {
      if (this.rows) {
        if (this.filter) {

          const filters = this.filter.toLowerCase().split('|');
          this.filterRows = this.rows.filter(row =>
            {
              let  matchingCells = 0;
              filters.forEach(filter => {
                const cellMatchIdx = row.findIndex(cell => cell.toLowerCase().indexOf(filter) > -1);
                if (cellMatchIdx > -1) {
                  matchingCells++;
                }
              });

              return matchingCells == filters.length;
            });
        } else {
          this.filterRows = this.rows;
        }
      }
      this.CalculateMaxPage();
   }


  onPageSizeChange(newValue: string) {
    this.pageSize = Number(newValue);
    this.CalculateMaxPage();
  }

  CalculateMaxPage() {
    this.maxPage = this.filterRows ? Math.ceil(this.filterRows.length / this.pageSize) : 0;
  }

  PageCrement(amount: number) {
    if (this.columns) {
      this.currentPage += amount;
      if (this.currentPage < 1) {
        this.currentPage = 1;
      } else if (this.currentPage > this.maxPage) {
        this.currentPage = this.maxPage;
      }
    }

  }

  PageOfRows(): string[][] {
    if (this.filterRows) {
      const lastIndex = this.filterRows.length - 1;
      if (lastIndex < this.pageSize) {
        return this.filterRows;
      } else {
        const pageStart = (this.currentPage - 1) * this.pageSize;
        const pageEnd = pageStart + this.pageSize - 1;

        if (pageStart < lastIndex) {
          if (pageEnd < lastIndex) {
            return this.filterRows.slice(pageStart, pageEnd);
          } else {
            return this.filterRows.slice(pageStart, lastIndex);
          }
        } else {
          return this.filterRows.slice(lastIndex - this.pageSize - 1, lastIndex);
        }
      }
    }
  }

}

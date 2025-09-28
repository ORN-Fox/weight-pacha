import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  standalone: false
})
export class PaginationComponent implements OnInit {

  @Input() page: number;
  @Input() itemsPerPage: number;

  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() itemsPerPageChange: EventEmitter<number> = new EventEmitter<number>();

  itemsPerPages: number[];

  constructor() {
    this.itemsPerPages = [10, 25, 50];
  }

  ngOnInit() {
    this.onPageChange(this.page);
    this.onItemsPerPageChange(this.itemsPerPage);
  }

  onPageChange(page: number = 1) {
    this.page = page;
    this.pageChange.emit(page);
  }

  onItemsPerPageChange(itemsPerPage: number = this.itemsPerPages[0]) {
    this.itemsPerPage = itemsPerPage;
    this.itemsPerPageChange.emit(itemsPerPage);
    this.onPageChange(1);
  }

}

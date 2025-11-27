import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

import { SettingsService } from '../../services/settings/settings.service';

import { Settings } from '../../models/settings/settings.model';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  standalone: false
})
export class PaginationComponent implements OnInit {

  readonly settingsService = inject(SettingsService);

  @Input() page: number;

  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() itemsPerPageChange: EventEmitter<number> = new EventEmitter<number>();

  settings!: Settings;

  itemsPerPages: number[] = [10, 25, 50];
  itemsPerPage: number;

  constructor() {
    this.settings = this.settingsService.currentSettings;
    
    this.itemsPerPage = this.settings.itemsPerPage || this.itemsPerPages[0];
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

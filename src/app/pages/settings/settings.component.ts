import { Component } from '@angular/core';
import { Settings } from 'src/app/core/models/settings/settings.model';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone: false
})
export class SettingsComponent {

  APP_STORAGE_KEY: string;

  settings: Settings;
  locales: string[];
  selectedLocale: string;

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-settings';

    this.locales = ['en-US', 'fr-CA', 'fr-FR'];
    this.selectedLocale = this.locales[1];

    this.loadSettings();
  }

  updateLocale(locale: string) {
    this.selectedLocale = locale;
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { locale: this.selectedLocale });
  }

  private loadSettings() {
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      this.settings = this.localStorageService.getItem(this.APP_STORAGE_KEY) as Settings;
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { locale: this.selectedLocale });
    }
  }

}

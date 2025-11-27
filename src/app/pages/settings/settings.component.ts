import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { Settings } from 'src/app/core/models/settings/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone: false
})
export class SettingsComponent {

  readonly settingsService = inject(SettingsService);
  readonly translateService = inject(TranslateService);

  settings: Settings;

  locales: string[] = ['en-US', 'fr-CA', 'fr-FR'];
  themes: string[] = ['light', 'dark'];
  calendarViewFormats: string[] = ['dayGridMonth', 'listMonth'];
  itemsPerPages: number[] = [10, 25, 50];
  weightUnits: number[] = [0, 1];
  weightUnitsLabels: string[] = ['Kg', 'Lbs'];

  constructor() {
    this.settings = this.settingsService.currentSettings;
  }

  updateLocale(locale: string) {
    this.settingsService.updateSettings({ locale });
    this.settings = this.settingsService.currentSettings;
    this.translateService.use(locale);
  }

  updateTheme(theme: string) {
    this.settingsService.updateSettings({ theme });
    this.settings = this.settingsService.currentSettings;
    document.documentElement.setAttribute('data-theme', theme);
  }

  updateCalendarViewFormat(calendarViewFormat: string) {
    this.settingsService.updateSettings({ calendarViewFormat });
    this.settings = this.settingsService.currentSettings;
  }

  updateItemsPerPage(itemsPerPage: number) {
    this.settingsService.updateSettings({ itemsPerPage });
    this.settings = this.settingsService.currentSettings;
  }

  updateWeightUnit(weightUnit: number) {
    this.settingsService.updateSettings({ weightUnit });
    this.settings = this.settingsService.currentSettings;
  }

}

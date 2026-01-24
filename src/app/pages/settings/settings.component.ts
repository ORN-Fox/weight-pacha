import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { english } from "flatpickr/dist/l10n/default.js"
import { French } from "flatpickr/dist/l10n/fr.js";

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { UnitType } from 'src/app/core/enums/unit-type/unit-type.enum';

import { UserSettings } from 'src/app/core/models/user-settings/user-settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone: false
})
export class SettingsComponent {

  readonly authService = inject(AuthService);
  readonly settingsService = inject(SettingsService);
  readonly translateService = inject(TranslateService);

  settings: UserSettings;

  locales: string[] = ['en-US', 'fr-CA', 'fr-FR'];
  themes: string[] = ['light', 'dark'];
  calendarViewFormats: string[] = ['dayGridMonth', 'listMonth'];
  itemsPerPages: number[] = [10, 25, 50];
  weightUnits: number[] = [UnitType.KiloGram, UnitType.Pounds, UnitType.Gram, UnitType.Ounce];
  weightUnitsLabels: string[] = ['Kg', 'Lbs', 'g', 'oz'];

  constructor() {
    this.settingsService.settings$.subscribe((settings) => {
      this.settings = settings;
      if (this.settings) {
        this.translateService.use(this.settings.locale);
        flatpickr.localize(this.settings.locale === 'en-US' ? english : French);

        document.documentElement.setAttribute('data-theme', this.settings.theme as string);
      }
    });
  }

  updateLocale(locale: string) {
    this.settingsService.updateSettings(this.authService.userValue.id, { locale });
  }

  updateTheme(theme: string) {
    this.settingsService.updateSettings(this.authService.userValue.id, { theme });
  }

  updateCalendarViewFormat(calendarViewFormat: string) {
    this.settingsService.updateSettings(this.authService.userValue.id, { calendarViewFormat });
  }

  updateItemsPerPage(itemsPerPage: number) {
    this.settingsService.updateSettings(this.authService.userValue.id, { itemsPerPage });
  }

  updateWeightUnit(weightUnit: number) {
    this.settingsService.updateSettings(this.authService.userValue.id, { weightUnit });
  }

}

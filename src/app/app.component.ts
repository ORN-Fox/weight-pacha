import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { english } from "flatpickr/dist/l10n/default.js"
import { French } from "flatpickr/dist/l10n/fr.js";

import { SettingsService } from './core/services/settings/settings.service';

import { Settings } from './core/models/settings/settings.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {

  settings: Settings;

  locales: string[] = ['en-US', 'fr-CA', 'fr-FR'];

  constructor(
    private translateService: TranslateService,
    private appSettingsService: SettingsService
  ) {}

  ngOnInit() {
    this.appSettingsService.settings$.subscribe(settings => {
      this.settings = this.appSettingsService.currentSettings;
      
      const locale = settings.locale || 'en-US';
      this.translateService.use(locale);
      
      flatpickr.localize(locale === 'en-US' ? english : French);
      
      document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    });
  }

  updateLocale(locale: string) {
    this.appSettingsService.updateSettings({ locale });
    this.translateService.use(locale);
  }

}

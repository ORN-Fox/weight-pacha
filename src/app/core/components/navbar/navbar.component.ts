import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { english } from "flatpickr/dist/l10n/default.js"
import { French } from "flatpickr/dist/l10n/fr.js";

import { SettingsService } from '../../services/settings/settings.service';
import { Settings } from '../../models/settings/settings.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {

  readonly settingsService = inject(SettingsService);
  readonly translateService = inject(TranslateService);

  settings: Settings;

  locales: string[] = ['en-US', 'fr-CA', 'fr-FR'];

  isOpenSidebar: boolean = false;

  constructor() { }

  ngOnInit() {
    this.settingsService.settings$.subscribe(settings => {
      this.settings = this.settingsService.currentSettings;

      const locale = settings.locale || 'en-US';
      this.translateService.use(locale);

      flatpickr.localize(locale === 'en-US' ? english : French);

      document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    });
  }

  updateLocale(locale: string) {
    this.settingsService.updateSettings({ locale });
    this.translateService.use(locale);
  }

  toggleSidebar() {
    this.isOpenSidebar = !this.isOpenSidebar;
  }


}

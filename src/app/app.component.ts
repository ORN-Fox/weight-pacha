import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { english } from "flatpickr/dist/l10n/default.js"
import { French } from "flatpickr/dist/l10n/fr.js";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {

  locales: string[];
  selectedLocale!: string;

  constructor(private translateService: TranslateService) {
    this.locales = ['en-US', 'fr-FR'];
    this.updateLocale(this.locales[1]);
    flatpickr.localize(French);
  }

  updateLocale(locale: string) {
    this.selectedLocale = locale;
    this.translateService.use(this.selectedLocale);
    flatpickr.localize(this.selectedLocale == 'en-US' ? english : French);
  }

}

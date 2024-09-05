import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  locales: string[];
  locale!: string;

  constructor(private translateService: TranslateService) {
    this.locales = ['en-US', 'fr-FR'];

    this.changeLocale('fr-FR');
  }

  changeLocale(locale: string) {
    this.locale = locale;
    this.translateService.use(this.locale);
  }

}

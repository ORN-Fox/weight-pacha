import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LocalStorageService } from './core/services/local-storage/local-storage.service';
import { SettingsService } from './core/services/settings/settings.service';

import { AppComponent } from './app.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [
      AppComponent,
      NavbarComponent
    ],
    imports: [
      RouterTestingModule,
      TranslateModule.forRoot({})
    ],
    providers: [
      TranslateService,
      SettingsService,
      LocalStorageService,
      provideHttpClient(),
      provideHttpClientTesting()
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

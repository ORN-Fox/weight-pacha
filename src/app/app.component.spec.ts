import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LocalStorageService } from './core/services/local-storage/local-storage.service';
import { SettingsService } from './core/services/settings/settings.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      TranslateModule.forRoot({})
    ],
    declarations: [AppComponent],
    providers: [
      TranslateService,
      SettingsService,
      LocalStorageService
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

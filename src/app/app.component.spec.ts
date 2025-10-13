import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SettingsService } from './core/services/settings/settings.service';
import { LocalStorageService } from './core/services/local-storage/local-storage.service';

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

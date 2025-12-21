import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { DateService } from 'src/app/core/services/date/date.service';
import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { ActionButtonComponent } from 'src/app/core/components/action-button/action-button.component';
import { FormErrorComponent } from 'src/app/core/components/form-error/form-error.component';
import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';
import { MeasureComponent } from 'src/app/core/components/measure/measure.component';

import { WeightMonitoringComponent } from './weight-monitoring.component';

describe('WeightMonitoringComponent', () => {
  let component: WeightMonitoringComponent;
  let fixture: ComponentFixture<WeightMonitoringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent,
        FormErrorComponent,
        PageTitleComponent,
        MeasureComponent,
        WeightMonitoringComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        DateService,
        LocalStorageService,
        ToastService,
        SerializerService,
        SettingsService,
        TranslateService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            selectedPetRecordValue: { id: 1 }
          }
        }
      ]
    });
    fixture = TestBed.createComponent(WeightMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

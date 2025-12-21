import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from 'src/app/core/services/auth/auth.service';

import { ActionButtonComponent } from 'src/app/core/components/action-button/action-button.component';
import { FormErrorComponent } from 'src/app/core/components/form-error/form-error.component';
import { NoVaccineRageAlertComponent } from 'src/app/core/components/no-vaccine-rage-alert/no-vaccine-rage-alert.component';
import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';
import { PaginationComponent } from 'src/app/core/components/pagination/pagination.component';

import { InformationsComponent } from './informations.component';

describe('InformationsComponent', () => {
  let component: InformationsComponent;
  let fixture: ComponentFixture<InformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent,
        FormErrorComponent,
        NoVaccineRageAlertComponent,
        PageTitleComponent,
        PaginationComponent,
        InformationsComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgxPaginationModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            selectedPetRecordValue: { id: 1 }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationsComponent);
    component = fixture.componentInstance;
    const fb = TestBed.inject(FormBuilder);
    component.petForm = fb.group({
      firstName: [''],
      specie: [''],
      breed: [''],
      color: [''],
      sex: [''],
      birthDate: [''],
      adoptedDate: [''],
      sterilize: [''],
      sterilizeDate: [''],
      tagNumber: [''],
      tagRageNumber: [''],
      description: ['']
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

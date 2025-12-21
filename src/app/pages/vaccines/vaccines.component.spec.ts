import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from 'src/app/core/services/auth/auth.service';

import { NoVaccineRageAlertComponent } from 'src/app/core/components/no-vaccine-rage-alert/no-vaccine-rage-alert.component';
import { PaginationComponent } from 'src/app/core/components/pagination/pagination.component';
import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';

import { VaccinesComponent } from './vaccines.component';

describe('VaccinesComponent', () => {
  let component: VaccinesComponent;
  let fixture: ComponentFixture<VaccinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NoVaccineRageAlertComponent,
        PageTitleComponent,
        PaginationComponent,
        VaccinesComponent
      ],
      imports: [
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

    fixture = TestBed.createComponent(VaccinesComponent);
    component = fixture.componentInstance;

    // Prevent paginationComponent data binding
    component.itemsPerPage = 10;
    component.page = 1;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

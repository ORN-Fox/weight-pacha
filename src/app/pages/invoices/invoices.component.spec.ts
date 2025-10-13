import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';
import { PaginationComponent } from 'src/app/core/components/pagination/pagination.component';

import { InvoicesComponent } from './invoices.component';

describe('InvoicesComponent', () => {
  let component: InvoicesComponent;
  let fixture: ComponentFixture<InvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PageTitleComponent,
        PaginationComponent,
        InvoicesComponent
      ],
      imports: [
        FormsModule,
        NgxPaginationModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        LocalStorageService,
        ToastService,
        SerializerService,
        SettingsService,
        TranslateService
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesComponent);
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

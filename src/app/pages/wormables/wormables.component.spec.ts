import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';

import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';
import { PaginationComponent } from 'src/app/core/components/pagination/pagination.component';

import { WormablesComponent } from './wormables.component';

describe('WormablesComponent', () => {
  let component: WormablesComponent;
  let fixture: ComponentFixture<WormablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PageTitleComponent,
        PaginationComponent,
        WormablesComponent
      ],
      imports: [
        FormsModule,
        NgxPaginationModule,
        TranslateModule.forRoot({})
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(WormablesComponent);
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';

import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';
import { PaginationComponent } from 'src/app/core/components/pagination/pagination.component';

import { InformationsComponent } from './informations.component';

describe('InformationsComponent', () => {
  let component: InformationsComponent;
  let fixture: ComponentFixture<InformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
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
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

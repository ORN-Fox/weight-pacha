import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';

import { ActionButtonComponent } from 'src/app/core/components/action-button/action-button.component';
import { FormErrorComponent } from 'src/app/core/components/form-error/form-error.component';

import { CalendarEventDialogComponent } from './calendar-event-dialog.component';

describe('CalendarEventDialogComponent', () => {
  let component: CalendarEventDialogComponent;
  let fixture: ComponentFixture<CalendarEventDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent,
        FormErrorComponent,
        CalendarEventDialogComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { 
          provide: MatDialogRef, 
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            action: 0,
            calendarEvent: new CalendarEvent()
          }
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarEventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

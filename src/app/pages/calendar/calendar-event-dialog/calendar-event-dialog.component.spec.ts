import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CalendarEventDialogComponent } from './calendar-event-dialog.component';
import moment from 'moment';
import { CalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';

describe('CalendarEventDialogComponent', () => {
  let component: CalendarEventDialogComponent;
  let fixture: ComponentFixture<CalendarEventDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CalendarEventDialogComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        TranslateModule.forRoot({})
      ],
      providers: [
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

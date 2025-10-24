import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WormableDialogComponent } from './wormable-dialog.component';

describe('WormableDialogComponent', () => {
  let component: WormableDialogComponent;
  let fixture: ComponentFixture<WormableDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WormableDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WormableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WormablesComponent } from './wormables.component';

describe('WormablesComponent', () => {
  let component: WormablesComponent;
  let fixture: ComponentFixture<WormablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WormablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WormablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

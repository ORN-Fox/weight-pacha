import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntiFleaComponent } from './anti-flea.component';

describe('AntiFleaComponent', () => {
  let component: AntiFleaComponent;
  let fixture: ComponentFixture<AntiFleaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntiFleaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntiFleaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

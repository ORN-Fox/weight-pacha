import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AccountTabInformationsComponent } from './account-tab-informations.component';

describe('AccountTabInformationsComponent', () => {
  let component: AccountTabInformationsComponent;
  let fixture: ComponentFixture<AccountTabInformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountTabInformationsComponent],
      imports: [
        TranslateModule.forRoot({})
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountTabInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

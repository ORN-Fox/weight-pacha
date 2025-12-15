import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AccountTabSecurityComponent } from './account-tab-security.component';

describe('AccountTabSecurityComponent', () => {
  let component: AccountTabSecurityComponent;
  let fixture: ComponentFixture<AccountTabSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountTabSecurityComponent],
      imports: [
        TranslateModule.forRoot({})
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountTabSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

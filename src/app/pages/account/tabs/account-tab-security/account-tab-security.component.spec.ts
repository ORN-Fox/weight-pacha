import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ActionButtonComponent } from 'src/app/core/components/action-button/action-button.component';

import { AccountTabSecurityComponent } from './account-tab-security.component';

describe('AccountTabSecurityComponent', () => {
  let component: AccountTabSecurityComponent;
  let fixture: ComponentFixture<AccountTabSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent,
        AccountTabSecurityComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ActionButtonComponent } from 'src/app/core/components/action-button/action-button.component';
import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';

import { AccountComponent } from './account.component';
import { AccountTabInformationsComponent } from './tabs/account-tab-informations/account-tab-informations.component';
import { AccountTabSecurityComponent } from './tabs/account-tab-security/account-tab-security.component';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent,
        PageTitleComponent,
        AccountComponent,
        AccountTabInformationsComponent,
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

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

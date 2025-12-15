import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AccountComponent } from './account.component';
import { AccountTabInformationsComponent } from './tabs/account-tab-informations/account-tab-informations.component';
import { AccountTabSecurityComponent } from './tabs/account-tab-security/account-tab-security.component';
import { PageTitleComponent } from 'src/app/core/components/page-title/page-title.component';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AccountComponent,
        AccountTabInformationsComponent,
        AccountTabSecurityComponent,
        PageTitleComponent
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

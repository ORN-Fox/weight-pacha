import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AccountTabInformationsComponent } from './account-tab-informations.component';

describe('AccountTabInformationsComponent', () => {
  let component: AccountTabInformationsComponent;
  let fixture: ComponentFixture<AccountTabInformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountTabInformationsComponent],
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

    fixture = TestBed.createComponent(AccountTabInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-account-tab-security',
  templateUrl: './account-tab-security.component.html',
  styleUrl: './account-tab-security.component.scss',
  standalone: false
})
export class AccountTabSecurityComponent {

  readonly formBuilder = inject(FormBuilder);
  readonly translateService = inject(TranslateService);

  passwordForm: FormGroup;

  isLoading: boolean = false;
  isSubmitted: boolean = false;

  constructor() {
    this.initPasswordForm();
  }

  savePassword() {
    this.isLoading = true;
    this.isSubmitted = true;
    // TODO

    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = false;
    }, 1000);
  }

  private initPasswordForm() {
    this.passwordForm = this.formBuilder.group({
      oldPassword: [null, [Validators.required, Validators.min(8), Validators.max(128)]],
      newPassword: [null, [Validators.required, Validators.min(8), Validators.max(128)]],
      newPasswordConfirmation: [null, [Validators.required, Validators.min(8), Validators.max(128)]],
    });
  }

}

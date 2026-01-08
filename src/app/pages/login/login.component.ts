import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService, LoginFormData } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false
})
export class LoginComponent implements OnDestroy {

  readonly authService = inject(AuthService);
  readonly formBuilder = inject(FormBuilder);

  loginForm: FormGroup;
  loginSub: Subscription;

  isError: boolean = false;
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  constructor() {
    this.initForm();
  }

  ngOnDestroy() {
    this.loginSub?.unsubscribe();
  }

  clearError() {
    this.isError = false;
  }

  protected login() {
    this.isError = false;
    this.isLoading = true;
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      setTimeout(() => this.isLoading = false, 500);
      return;
    }

    const userAccessData: LoginFormData = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('rememberMe')?.value
    };

    this.loginSub = this.authService.login(userAccessData).subscribe({
      next: () => {
        this.isSubmitted = false;
      },
      error: () => {
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  private initForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.min(8), Validators.max(128)]],
      rememberMe: [false, []]
    });
  }

}

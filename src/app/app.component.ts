import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {

  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.redirectToHomeIfAlreadyAuthenticaded();
  }

  private redirectToHomeIfAlreadyAuthenticaded() {
    if (this.authService.isAuthenticated()) {
      this.authService.loadCurrentUser().subscribe(() => this.router.navigate(['/home']));
    }
  }

}

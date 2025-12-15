import { Component, inject } from '@angular/core';

import { AuthService } from 'src/app/core/services/auth/auth.service';

import { User } from 'src/app/core/models/user/user.model';

@Component({
  selector: 'app-account-tab-informations',
  templateUrl: './account-tab-informations.component.html',
  styleUrl: './account-tab-informations.component.scss',
  standalone: false
})
export class AccountTabInformationsComponent {

  readonly authService = inject(AuthService);

  user: User;

  constructor() {
    this.user = this.authService.userValue;
  }

}

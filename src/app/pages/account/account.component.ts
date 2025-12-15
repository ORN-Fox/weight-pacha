import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from 'src/app/core/services/auth/auth.service';

interface ITabConfig {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
  standalone: false
})
export class AccountComponent {

  readonly authService = inject(AuthService);
  readonly translateService = inject(TranslateService);

  tabs: ITabConfig[] = [
    { id: 'informations', name: 'Informations', icon: 'address-card' },
    { id: 'security', name: 'security', icon: 'user-shield' }
  ];
  selectedTab: ITabConfig;

  constructor() {
    this.selectTab(this.tabs[0]);
  }

  selectTab(tab: ITabConfig) {
    if (tab && tab?.id != this.selectedTab?.id) {
      this.selectedTab = tab;
    }
  }

}

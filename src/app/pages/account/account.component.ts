import { Component, inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
export class AccountComponent implements OnDestroy {

  readonly authService = inject(AuthService);
  readonly translateService = inject(TranslateService);

  logoutSub: Subscription;

  tabs: ITabConfig[] = [
    { id: 'informations', name: 'Informations', icon: 'address-card' },
    { id: 'security', name: 'security', icon: 'user-shield' }
  ];
  selectedTab: ITabConfig;

  constructor() {
    this.selectTab(this.tabs[0]);
  }

  ngOnDestroy() {
    this.logoutSub?.unsubscribe();
  }

  selectTab(tab: ITabConfig) {
    if (tab && tab?.id != this.selectedTab?.id) {
      this.selectedTab = tab;
    }
  }

  protected logout() {
    this.logoutSub = this.authService.logout().subscribe();
  }

}

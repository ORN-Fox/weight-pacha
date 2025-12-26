import { Component, inject } from '@angular/core';

import { AuthService } from 'src/app/core/services/auth/auth.service';

interface IPageConfig {
  path: string;
  title: string;
  enabled: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {

  readonly authService = inject(AuthService);

  pages: IPageConfig[];

  constructor() {
    this.loadPages();

    this.authService.selectedPetRecord$.subscribe(() => {
      this.loadPages();
    });
  }

  private loadPages() {
    const editPetRecordMode = !this.authService.selectedPetRecordValue?.isNewPetRecord;

    this.pages = [
      { path: 'calendar', title: 'calendar', enabled: editPetRecordMode },
      { path: 'informations', title: 'informations', enabled: true },
      { path: 'weight', title: 'weight', enabled: editPetRecordMode },
      { path: 'notes', title: 'notes', enabled: editPetRecordMode },
      { path: 'invoices', title: 'invoices', enabled: editPetRecordMode },
      { path: 'vaccines', title: 'vaccines', enabled: editPetRecordMode },
      { path: 'wormables', title: 'wormables', enabled: editPetRecordMode },
      { path: 'settings', title: 'settings', enabled: true }
    ];
  }

}

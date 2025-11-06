import { Component } from '@angular/core';

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

  pages: IPageConfig[];

  constructor() {
    this.pages = [
      { path: 'calendar', title: 'calendar', enabled: true },
      { path: 'informations', title: 'informations', enabled: true },
      { path: 'weight', title: 'weight', enabled: true },
      { path: 'notes', title: 'notes', enabled: true },
      { path: 'invoices', title: 'invoices', enabled: true },
      { path: 'vaccines', title: 'vaccines', enabled: true },
      { path: 'wormables', title: 'wormables', enabled: true },
      { path: 'settings', title: 'settings', enabled: true }
    ];
  }

}

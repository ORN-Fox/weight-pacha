import { Component } from '@angular/core';

interface IPageConfig {
  path: string;
  title: string;
  iconSrc: string;
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
      { path: 'informations', title: 'pages.informations.title', iconSrc: 'https://cdn-icons-png.flaticon.com/128/8334/8334289.png', enabled: true },
      { path: 'weigth', title: 'pages.weightMonitoring.title', iconSrc: 'https://cdn-icons-png.flaticon.com/128/9184/9184519.png', enabled: true },
      { path: 'notes', title: 'pages.notes.title', iconSrc: 'https://cdn-icons-png.flaticon.com/128/2865/2865447.png', enabled: true },
      { path: 'vaccines', title: 'pages.vaccines.title', iconSrc: 'https://cdn-icons-png.flaticon.com/128/1303/1303467.png', enabled: true },
      { path: 'antiflea', title: 'pages.antiflea.title', iconSrc: 'https://cdn-icons-png.flaticon.com/128/4216/4216649.png', enabled: false },
      { path: 'settings', title: 'pages.settings.title', iconSrc: 'https://cdn-icons-png.flaticon.com/128/7216/7216457.png', enabled: false }
    ];
  }

}

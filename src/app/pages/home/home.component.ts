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
      { path: 'informations', title: 'Informations', iconSrc: 'https://cdn-icons-png.flaticon.com/128/8334/8334289.png', enabled: true },
      { path: 'weigth', title: 'Suivi du poids', iconSrc: 'https://cdn-icons-png.flaticon.com/128/9184/9184519.png', enabled: true },
      { path: 'notes', title: 'Notes', iconSrc: 'https://cdn-icons-png.flaticon.com/128/2865/2865447.png', enabled: true },
      { path: 'vaccines', title: 'Vaccins', iconSrc: 'https://cdn-icons-png.flaticon.com/128/1303/1303467.png', enabled: true },
      { path: 'antiflea', title: 'Vermifuges', iconSrc: 'https://cdn-icons-png.flaticon.com/128/4216/4216649.png', enabled: false },
      { path: 'settings', title: 'Parametres', iconSrc: 'https://cdn-icons-png.flaticon.com/128/7216/7216457.png', enabled: false }
    ];
  }

}

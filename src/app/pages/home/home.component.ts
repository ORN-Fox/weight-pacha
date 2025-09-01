import { Component } from '@angular/core';

interface IPageConfig {
  path: string;
  title: string;
  iconSrc: string;
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
      { path: 'informations', title: 'Informations', iconSrc: 'https://cdn-icons-png.flaticon.com/128/8334/8334289.png' },
      { path: 'weigth', title: 'Suivi du poids', iconSrc: 'https://cdn-icons-png.flaticon.com/128/9184/9184519.png' },
      { path: 'settings', title: 'Parametres', iconSrc: 'https://cdn-icons-png.flaticon.com/128/7216/7216457.png' }
    ];
  }

}

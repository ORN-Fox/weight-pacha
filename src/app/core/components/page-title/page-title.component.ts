import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss',
  standalone: false
})
export class PageTitleComponent implements OnInit {

  @Input() title: string;

  srcImage: string;
  titleKey: string;

  constructor() {}

  ngOnInit() {
    this.srcImage = `/assets/images/pages/${ this.title }.png`;
    this.titleKey = `pages.${ this.title }.title`;
  }

}

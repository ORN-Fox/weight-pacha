import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
  standalone: false
})
export class ActionButtonComponent {

  @Input() type: string;
  @Input() title: string;
  @Input() customClass: string;
  @Input() icon: string;
  @Input() isLoading: boolean = false;
  @Input() isDisabled: boolean = false;

  constructor() {}

}

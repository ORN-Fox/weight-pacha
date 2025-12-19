import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.scss',
  standalone: false
})
export class FormErrorComponent {

  @Input() form: FormGroup;
  @Input() fieldName: string;
  @Input() errorRuleName: string;
  @Input() errorMessage: string;
  @Input() customClass: string;
  @Input() isSubmitted: boolean = false;

  constructor() {}

}

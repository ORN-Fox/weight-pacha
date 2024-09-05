import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Measure } from '../../models/measure/measure.model';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss']
})
export class MeasureComponent {

  @Input() measure!: Measure;
  @Input() measureUnitLabel!: string;

  @Output() deleteMeasureEvent: EventEmitter<{ measure: Measure }> = new EventEmitter();

  constructor()
  {}

  deleteMeasure() {
    this.deleteMeasureEvent.emit({ measure: this.measure });
  }

}

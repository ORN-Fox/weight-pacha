import { Component, Input, OnInit } from '@angular/core';

import { PetType } from '../../enums/pet-type/pet-type.enum';

import { PetRecord } from '../../models/pet-record/pet-record.model';

@Component({
  selector: 'app-no-vaccine-rage-alert',
  templateUrl: './no-vaccine-rage-alert.component.html',
  styleUrl: './no-vaccine-rage-alert.component.scss',
  standalone: false
})
export class NoVaccineRageAlertComponent implements OnInit {

  @Input() petRecord: PetRecord;

  displayAlert: boolean = false;

  constructor()
  {}

  ngOnInit() {
    this.displayAlert = this.isNoVaccinedForRage();
  }

  private isNoVaccinedForRage(): boolean {
    if (this.petRecord) {
      return this.petRecord.specie != PetType.Others && !this.petRecord.tagRageNumber;
    }
    return false;
  }

}

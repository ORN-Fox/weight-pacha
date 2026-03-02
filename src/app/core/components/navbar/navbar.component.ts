import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { english } from "flatpickr/dist/l10n/default.js"
import { French } from "flatpickr/dist/l10n/fr.js";

import { AuthService } from '../../services/auth/auth.service';
import { SettingsService } from '../../services/settings/settings.service';

import { PetRecord } from '../../models/pet-record/pet-record.model';
import { User } from '../../models/user/user.model';
import { UserSettings } from '../../models/user-settings/user-settings.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {

  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly settingsService = inject(SettingsService);
  readonly translateService = inject(TranslateService);

  user: User;
  private userSub: Subscription;

  petRecords: PetRecord[];
  private petRecordsSub: Subscription;

  selectedPetRecord: PetRecord;
  private selectedPetRecordSub: Subscription;

  locales: string[] = ['en-US', 'fr-CA', 'fr-FR'];
  selectedLocale: string;

  isOpenSidebar: boolean = false;

  constructor() { }

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.petRecordsSub = this.authService.petRecords$.subscribe(petRecords => {
      this.petRecords = petRecords;
    });

    this.selectedPetRecordSub = this.authService.selectedPetRecord$.subscribe(selectedPetRecord => {
      this.selectedPetRecord = selectedPetRecord;
    });

    this.settingsService.settings$.subscribe(settings => {
      this.selectedLocale = settings.locale;
      this.translateService.use(this.selectedLocale);
      flatpickr.localize(this.selectedLocale === 'en-US' ? english : French);

      document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.petRecordsSub?.unsubscribe();
    this.selectedPetRecordSub?.unsubscribe();
  }

  updateLocale(locale: string) {
    this.settingsService.updateSettings(this.authService?.userValue?.id, { locale });
    this.translateService.use(locale);
  }

  toggleSidebar() {
    this.isOpenSidebar = !this.isOpenSidebar;
  }

  // #region Pet Record 

  selectPetRecord(petRecord: PetRecord) {
    if (petRecord.isNewPetRecord || this.authService.selectedPetRecordValue.id != petRecord.id) {
      this.authService.selectedPetRecordValue = petRecord;

      let routeName = petRecord.isNewPetRecord ? '/informations' : '/home';
      this.router.navigate([routeName]);
    }
  }

  createPetRecord() {
    let petRecord = new PetRecord();
    petRecord.isNewPetRecord = true;
    this.selectPetRecord(petRecord);
  }

  // #endregion

}

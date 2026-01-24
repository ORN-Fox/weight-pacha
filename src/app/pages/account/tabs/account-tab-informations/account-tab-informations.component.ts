import { Component, inject, OnDestroy } from '@angular/core';
import { catchError, Subscription, tap, throwError } from 'rxjs';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { TranslateService } from '@ngx-translate/core';

import { PetRecord } from 'src/app/core/models/pet-record/pet-record.model';
import { User } from 'src/app/core/models/user/user.model';

@Component({
  selector: 'app-account-tab-informations',
  templateUrl: './account-tab-informations.component.html',
  styleUrl: './account-tab-informations.component.scss',
  standalone: false
})
export class AccountTabInformationsComponent implements OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);

  archiveOrRestorePetRecordSub: Subscription;

  user: User;

  constructor() {
    this.user = this.authService.userValue;
  }

  ngOnDestroy() {
    this.archiveOrRestorePetRecordSub?.unsubscribe();
  }

  restorePetRecord(petRecord: PetRecord) {
    this.archiveOrRestorePetRecord(false, petRecord);
  }

  archivePetRecord(petRecord: PetRecord) {
    this.archiveOrRestorePetRecord(true, petRecord);
  }

  private archiveOrRestorePetRecord(archive: boolean, petRecord: PetRecord) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed && petRecord) {
        const action = archive ? 'archive' : 'restore';
        this.archiveOrRestorePetRecordSub = this.apiService.put(`/pet-record/${ petRecord.id }/${ action }`, petRecord).pipe(
          tap(() => {
            // TODO handle loading animation and pet record achive display
          }),
          catchError((error) => {
            this.toastService.showToast('error', this.translateService.instant(`commons.toast.error.${ action }`));
            console.error(`Unable to ${ action } pet record`, error);
            return throwError(() => error);
          }),
        ).subscribe();
      }
    });
  }

}

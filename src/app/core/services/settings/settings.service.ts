import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../api/api.service';
import { ToastService } from '../toast/toast.service';

import { UserSettings } from '../../models/user-settings/user-settings.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    readonly apiService = inject(ApiService);
    readonly toastService = inject(ToastService);
    readonly translateService = inject(TranslateService);

    private settingsSubject = new BehaviorSubject<UserSettings>(new UserSettings());
    public settings$ = this.settingsSubject.asObservable();

    get currentSettings(): UserSettings {
        return this.settingsSubject.value;
    }

    set currentSettings(userSettings: UserSettings) {
        this.settingsSubject.next(userSettings);
    }

    updateSettings(userId: string, settings: Partial<UserSettings>) {
        let settingsToUpdate = Object.assign(this.settingsSubject.value, settings);
        this.saveSettings(userId, settingsToUpdate);
    }

    private saveSettings(userId: string, settingsToUpdate: UserSettings) {
        if (userId) {
            this.apiService.put<UserSettings>(`/user/${ userId }/settings`, settingsToUpdate.serializeForSave()).pipe(
                tap((updatedSettings: UserSettings) => {
                    this.settingsSubject.next(updatedSettings);
                }),
                catchError((error) => {
                    this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
                    console.error('Unable to update user settings', error);
                    return throwError(() => error);
                }),
            ).subscribe();
        } else {
        // Not logged flow
            this.settingsSubject.next(settingsToUpdate);
        }
    }
    
}
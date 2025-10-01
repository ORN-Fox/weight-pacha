import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { LocalStorageService } from '../local-storage/local-storage.service';

import { Settings, ISettings } from '../../models/settings/settings.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private readonly STORAGE_KEY = 'weight-pacha-settings';
    private settings: Settings;
    private settingsSubject: BehaviorSubject<Settings>;

    constructor(
        private localStorageService: LocalStorageService
    ) {
        this.settings = new Settings();
        this.settingsSubject = new BehaviorSubject<Settings>(this.settings);
        this.loadSettings();
    }

    get currentSettings(): Settings {
        return this.settings;
    }

    get settings$(): Observable<Settings> {
        return this.settingsSubject.asObservable();
    }

    updateSettings(settings: Partial<ISettings>) {
        this.settings = { ...this.settings, ...settings } as Settings; 
        this.saveSettings();
        this.settingsSubject.next(this.settings);
    }

    private loadSettings() {
        if (this.localStorageService.isItemExist(this.STORAGE_KEY)) {
            const savedSettings = this.localStorageService.getItem(this.STORAGE_KEY);
            this.settings = new Settings();
            this.settings.deserilizeFromSave(savedSettings);
            this.settingsSubject.next(this.settings);
        } else {
            this.saveSettings();
        }
    }

    private saveSettings() {
        this.localStorageService.setItem(this.STORAGE_KEY, this.settings);
    }
    
}
import { HttpErrorResponse, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxAuthService } from 'ngx-auth';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from "jwt-decode";

import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';
import { ToastService } from '../toast/toast.service';
import { TokenStorageService } from '../token-storage/token-storage.service';

import { PetRecord } from '../../models/pet-record/pet-record.model';
import { ISerializedUser, User } from '../../models/user/user.model';
import { UserSettings } from '../../models/user-settings/user-settings.model';

interface AuthUserAccessData {
    accessToken: string;
    refreshToken: string;
    user: ISerializedUser;
}

export interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService implements NgxAuthService {

    private router = inject(Router);
    private apiService = inject(ApiService);
    private settingsService = inject(SettingsService);
    private toastService = inject(ToastService);
    private tokenStorageService = inject(TokenStorageService);
    private translateService = inject(TranslateService);

    private userSubject = new BehaviorSubject<any>(null);
    public user$ = this.userSubject.asObservable();

    private petRecordsSubject = new BehaviorSubject<any>(null);
    public petRecords$ = this.petRecordsSubject.asObservable();

    private selectedPetRecordSubject = new BehaviorSubject<any>(null);
    public selectedPetRecord$ = this.selectedPetRecordSubject.asObservable();

    get userValue(): User {
        return this.userSubject.value;
    }

    get petRecordsValue(): PetRecord[] {
        return this.petRecordsSubject.value;
    }

    get selectedPetRecordValue(): PetRecord {
        return this.selectedPetRecordSubject.value;
    }

    set selectedPetRecordValue(petRecord: PetRecord) {
        this.selectedPetRecordSubject.next(petRecord);
    }

    getAccessToken() {
        const token = this.tokenStorageService.getAccessToken();
        return of(token);
    }

    getUserIdFromToken(): string | null {
        const token = this.tokenStorageService.getAccessToken();
        if (!token) {
            return null;
        }
        
        try {
            const decoded: any = jwtDecode(token);
            return decoded.payload.id || null;
        } catch {
            return null;
        }
    }

    isAuthenticated() {
        return this.getAccessToken().pipe(map(token => !!token));
    }

    login(user: LoginFormData) {
        return this.apiService.post<AuthUserAccessData>('/login', { email: user.email, password: user.password, rememberMe: user.rememberMe }).pipe(
            tap(async (accessData: AuthUserAccessData) => {
                this.saveAccessTokens(accessData);

                let user = new User();
                user.deserilizeFromSave(accessData.user);
                this.saveUserAndPetRecordsData(user)

                await this.router.navigateByUrl('/home');
            }),
            catchError((error) => {
                console.error('Unable to login', error);
                return throwError(() => error);
            })
        );
    }

    logout() {
        return this.apiService.get('/logout').pipe(
            tap(async () => {
                this.tokenStorageService.clear();
                this.clearUserandPetRecordsData();

                await this.router.navigateByUrl('/login');
            })
        );
    }

    refreshShouldHappen(response: HttpErrorResponse) {
        return response.status === HttpStatusCode.Unauthorized;
    }

    refreshToken() {
        const refreshToken = this.tokenStorageService.getRefreshToken();

        return this.apiService.post<AuthUserAccessData>('/refresh', { refreshToken }).pipe(
            tap((tokens: AuthUserAccessData) => this.saveAccessTokens(tokens)),
            catchError((err) => {
                this.logout().subscribe();
                return throwError(() => err);
            })
        );
    }

    skipRequest(req: HttpRequest<any>) {
        return req.url.endsWith('/refresh') || req.url.startsWith('/assets');
    }

    loadCurrentUser() {
        const userId = this.getUserIdFromToken();
        
        if (!userId) {
            this.clearUserandPetRecordsData();
            return of(null);
        }

        return this.apiService.get<ISerializedUser>(`/user/${userId}`).pipe(
            tap((serializedUser: ISerializedUser) => {
                let user = new User();
                user.deserilizeFromSave(serializedUser);
                this.saveUserAndPetRecordsData(user);
            }),
            catchError(() => {
                this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));

                this.clearUserandPetRecordsData();
                return of(null);
            })
        );
    }

    private saveAccessTokens({ accessToken, refreshToken }: AuthUserAccessData) {
        this.tokenStorageService.setAccessToken(accessToken);
        this.tokenStorageService.setRefreshToken(refreshToken);
    }

    private saveUserAndPetRecordsData(user: User)
    {
        this.userSubject.next(user);
        this.settingsService.currentSettings = user.settings;
        this.petRecordsSubject.next(user.petRecords);

        if (this.petRecordsValue.length > 0) {
            let selectedPetRecord: PetRecord | null = this.petRecordsValue[0];

            if (user.settings.favoritePetRecordId) {
                const petRecords = this.petRecordsValue.filter(petRecord => petRecord.id == user.settings.favoritePetRecordId);
                selectedPetRecord = petRecords ? petRecords[0] : null;
            }

            this.selectedPetRecordSubject.next(selectedPetRecord);
        }
    }

    private clearUserandPetRecordsData() {
        this.userSubject.next(null);
        this.petRecordsSubject.next([]);
        this.selectedPetRecordSubject.next(null);
        
        let keepLocale = this.settingsService.currentSettings.locale;
        this.settingsService.currentSettings = { ...new UserSettings(), locale: keepLocale } as UserSettings;
    }
}
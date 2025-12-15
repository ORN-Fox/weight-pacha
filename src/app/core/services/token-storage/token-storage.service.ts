import { inject, Injectable } from '@angular/core';

import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {

    readonly localStorage = inject(LocalStorageService);

    private readonly ACCESS_TOKEN_KEY = 'accessToken';
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';

    getAccessToken() {
        return this.localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    getRefreshToken() {
        return this.localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    setAccessToken(token: string) {
        this.localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }

    setRefreshToken(token: string) {
        this.localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }

    clear() {
        this.localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        this.localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

}
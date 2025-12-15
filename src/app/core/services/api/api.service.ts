import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    
    private http = inject(HttpClient);

    private API_URL: string = environment.apiUrl;

    constructor() {}

    get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
        const options = { params, headers };
        return this.http.get<T>(this.appendApiUrl(url), options);
    }

    post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
        const options = { headers };
        return this.http.post<T>(this.appendApiUrl(url), body, options);
    }

    put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
        const options = { headers };
        return this.http.put<T>(this.appendApiUrl(url), body, options);
    }

    delete<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
        const options = { params, headers };
        return this.http.delete<T>(this.appendApiUrl(url), options);
    }

    private appendApiUrl(url: string): string {
        return `${this.API_URL}${url}`;
    }
}
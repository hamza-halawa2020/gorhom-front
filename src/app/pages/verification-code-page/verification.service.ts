import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
@Injectable({
    providedIn: 'root',
})
export class VerifyService {
    private apiUrl = environment.backEndUrl;
    private data = '/verify-code';
    constructor(private http: HttpClient) {}
    verify(item: any) {
        return this.http.post(`${this.apiUrl}${this.data}`, item);
    }
}

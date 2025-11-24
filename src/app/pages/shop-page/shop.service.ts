import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})
export class ShopService {
    private apiUrl = environment.backEndUrl;
    private data = '/categories';
    constructor(
        private http: HttpClient,
    ) {}
    index() {
        return this.http.get(`${this.apiUrl}${this.data}`);
    }

}

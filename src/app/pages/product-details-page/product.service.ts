import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private apiUrl = environment.backEndUrl;
    private data = '/products';
    constructor(
        private http: HttpClient,
        private cookieService: CookieService
    ) {}
    show(id: number) {
        return this.http.get(`${this.apiUrl}${this.data}/${id}`);
    }

    allSocial() {
        return this.http.get(`${this.apiUrl}/social-links`);
    }

    addReview(item: any) {
        return this.http.post(`${this.apiUrl}/product-reviews`, item);
    }
    addClientReview(item: any) {
        return this.http.post(`${this.apiUrl}/product-reviews-store`, item);
    }
}

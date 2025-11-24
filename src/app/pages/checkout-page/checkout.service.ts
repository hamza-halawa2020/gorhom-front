import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})
export class CheckoutService {
    private apiUrl = environment.backEndUrl;
    constructor(
        private http: HttpClient,
        private cookieService: CookieService
    ) {}

    private getHeaders() {
        const token = this.cookieService.get('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }
    allProducts() {
        return this.http.get(`${this.apiUrl}/products`);
    }
  

    storeOrder(item: any) {
        return this.http.post(`${this.apiUrl}/orders`, item, {
            headers: this.getHeaders(),
        });
    }
    storeClientOrder(item: any) {
        return this.http.post(`${this.apiUrl}/orders-store`, item, {
            headers: this.getHeaders(),
        });
    }

    getPaymentLink(orderID: any) {
        return this.http.post(`${this.apiUrl}/payment/credit`, orderID);
    }
}

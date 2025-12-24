import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class CheckoutService {
    private apiUrl = environment.backEndUrl;
    
    constructor(
        private http: HttpClient,
        private translateService: TranslateService
    ) {}

    allProducts() {
        const currentLang = this.translateService.currentLang || 'en';
        return this.http.get(`${this.apiUrl}/products?lang=${currentLang}`);
    }

    storeOrder(item: any) {
        return this.http.post(`${this.apiUrl}/orders`, item);
    }
    
    storeClientOrder(item: any) {
        return this.http.post(`${this.apiUrl}/orders-store`, item);
    }

    getPaymentLink(orderID: any) {
        return this.http.post(`${this.apiUrl}/payment/credit`, orderID);
    }
}

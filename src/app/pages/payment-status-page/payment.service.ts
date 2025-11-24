import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PaymentStatusService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) {}

    // Fetch order details by order number
    trackOrder(orderNumber: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/orders-track/${orderNumber}`);
    }

    // Fetch payment details by payment ID
    getPaymentById(paymentId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/payments/${paymentId}`);
    }
}

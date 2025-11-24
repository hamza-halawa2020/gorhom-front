import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export class CartService {
    private apiUrl = environment.backEndUrl;
    private data = '/carts';

    private cartSubject = new BehaviorSubject<any[]>([]);

    cart$ = this.cartSubject.asObservable();

    constructor(
        private http: HttpClient,
        private cookieService: CookieService
    ) {
        this.loadInitialCartData();
    }

    allCountries() {
        return this.http.get(`${this.apiUrl}/countries`);
    }
    allShipments() {
        return this.http.get(`${this.apiUrl}/shipments`);
    }
    allCities() {
        return this.http.get(`${this.apiUrl}/cities`);
    }

    showCoupon(payload: { code: string }) {
        return this.http.post(`${this.apiUrl}/showCoupon`, payload);
    }

    private getHeaders() {
        const token = this.cookieService.get('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    updateQuantity(item: any) {
        return this.http.put(`${this.apiUrl}${this.data}/${item.id}`, item, {
            headers: this.getHeaders(),
        });
    }

    index() {
        return this.http.get(`${this.apiUrl}${this.data}`, {
            headers: this.getHeaders(),
        });
    }

    private loadInitialCartData() {
        const cart = localStorage.getItem('cart');
        if (cart) {
            this.cartSubject.next(JSON.parse(cart));
        } else {
            this.index().subscribe({
                next: (response: any) => {
                    this.cartSubject.next(response.data);
                    localStorage.setItem('cart', JSON.stringify(response.data));
                },
                error: (error) => {
                    console.error('Failed to load cart data:', error);
                },
            });
        }
    }

    addToCart(id: any) {
        return this.http.post(`${this.apiUrl}${this.data}`, id).pipe(
            tap((response: any) => {
                const currentCart = this.cartSubject.value;
                const updatedCart = [...currentCart, response.data];
                this.cartSubject.next(updatedCart);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
            })
        );
    }


    delete(id: any) {
        return this.http
            .delete(`${this.apiUrl}${this.data}/${id}`, {
                headers: this.getHeaders(),
            })
            .pipe(
                tap(() => {
                    const currentCart = this.cartSubject.value;
                    const updatedCart = currentCart.filter(
                        (item) => item.id !== id
                    );
                    this.cartSubject.next(updatedCart);
                    localStorage.setItem('cart', JSON.stringify(updatedCart));
                    this.refreshCart();
                })
            );
    }

    clearCart() {
        return this.http
            .delete(`${this.apiUrl}/cart_clear`, {
                headers: this.getHeaders(),
            })
            .pipe(
                tap(() => {
                    this.cartSubject.next([]);
                    localStorage.setItem('cart', JSON.stringify([]));
                    this.refreshCart();
                })
            );
    }

    refreshCart() {
        const cart = localStorage.getItem('cart');
        if (cart) {
            this.cartSubject.next(JSON.parse(cart));
        }
    }
}

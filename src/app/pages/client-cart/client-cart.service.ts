import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ClientCartService {
    private apiUrl = environment.backEndUrl;
    public cartSubject = new BehaviorSubject<any[]>(
        this.getCartFromLocalStorage()
    );
    client_cart$ = this.cartSubject.asObservable();

    cart$ = this.cartSubject.asObservable();

    constructor(private http: HttpClient) {}

    addToClientCart(product: any) {
        const currentCart = this.cartSubject.getValue();

        const existingItem = currentCart.find(
            (item) => item.product_id === product.id
        );

        if (existingItem) {
            this.updateQuantity(product.id, 1);
        } else {
            const newItem = {
                product_id: product.id,
                quantity: 1,
                product: product,
            };

            const updatedCart = [...currentCart, newItem];
            this.updateCart(updatedCart);
        }
        this.refreshCart();
    }

    updateCart(updatedCart: any[]) {
        this.cartSubject.next(updatedCart);
        localStorage.setItem('client_cart', JSON.stringify(updatedCart));
    }

    private getCartFromLocalStorage(): any[] {
        const client_cart = localStorage.getItem('client_cart');
        return client_cart ? JSON.parse(client_cart) : [];
    }

    getProductById(productId: number) {
        return this.http.get(`${this.apiUrl}/products/${productId}`);
    }

    updateQuantity(productId: number, change: number) {
        let cart = this.getCartFromLocalStorage();
        cart = cart.map((item) => {
            if (item.product_id === productId) {
                return {
                    ...item,
                    quantity: Math.max(1, item.quantity + change),
                };
            }
            return item;
        });

        this.updateCart(cart);
    }

    removeFromCart(productId: number) {
        let cart = this.getCartFromLocalStorage();
        cart = cart.filter((item) => item.product_id !== productId);
        this.updateCart(cart);
        this.refreshCart();
    }

    clearCart() {
        this.updateCart([]);
        this.refreshCart();
    }

  

    refreshCart() {
        const cart = localStorage.getItem('client_cart');
        if (cart) {
            this.cartSubject.next(JSON.parse(cart));
        }
    }

    
    showCoupon(payload: { code: string }) {
        return this.http.post(`${this.apiUrl}/showCoupon`, payload);
    }
    
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CartService {


    private apiUrl = environment.backEndUrl;

    private cartSubject = new BehaviorSubject<any[]>(this.getCartFromLocalStorage());
    cart$ = this.cartSubject.asObservable();

    constructor(private http: HttpClient) { }

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

    private getCartFromLocalStorage(): any[] {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    private updateCart(updatedCart: any[]) {
        this.cartSubject.next(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    }

    addToCart(product: any) {
        const currentCart = this.cartSubject.getValue();

        const existingItem = currentCart.find(
            (item) => item.product_id === product.id
        );

        if (existingItem) {
            this.updateQuantity(product.id, 1);
        } else {
            const price = product.price_after_discount || product.price || 0;
            const newItem = {
                id: Date.now(),
                product_id: product.id,
                quantity: 1,
                product: product,
                total_price: price * 1,
            };
            const updatedCart = [...currentCart, newItem];
            this.updateCart(updatedCart);
        }

        this.refreshCart();
        return of({ success: true, message: 'Product added to cart successfully.' });
    }

    updateQuantity(productId: number, change: number) {
        let cart = this.getCartFromLocalStorage();
        cart = cart.map((item) => {
            if (item.product_id === productId) {
                const newQuantity = Math.max(1, item.quantity + change);
                const price = item.product?.price_after_discount || item.product?.price || 0;
                return {
                    ...item,
                    quantity: newQuantity,
                    total_price: price * newQuantity,
                };
            }
            return item;
        });
        this.updateCart(cart);
        return of({ success: true });
    }

    setQuantity(productId: number, quantity: number) {
        let cart = this.getCartFromLocalStorage();
        cart = cart.map((item) => {
            if (item.product_id === productId) {
                const newQuantity = Math.max(1, quantity);
                const price = item.product?.price_after_discount || item.product?.price || 0;
                return {
                    ...item,
                    quantity: newQuantity,
                    total_price: price * newQuantity,
                };
            }
            return item;
        });
        this.updateCart(cart);
        return of({ success: true });
    }

    delete(id: any) {
        let cart = this.getCartFromLocalStorage();
        cart = cart.filter((item) => item.id !== id);
        this.updateCart(cart);
        this.refreshCart();
        return of({ success: true, message: 'Product removed from cart successfully.' });
    }

    clearCart() {
        this.updateCart([]);
        this.refreshCart();
        return of({ success: true, message: 'Cart cleared successfully.' });
    }

    refreshCart() {
        const cart = localStorage.getItem('cart');
        if (cart) {
            this.cartSubject.next(JSON.parse(cart));
        }
    }
}

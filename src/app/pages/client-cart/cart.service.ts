import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private apiUrl = environment.backEndUrl;
    private cartSubject = new BehaviorSubject<any[]>([]);
    public cart$ = this.cartSubject.asObservable();

    constructor(
        private http: HttpClient,
        private translateService: TranslateService
    ) {
        this.loadCartFromStorage();
    }

    allCountries() {
        const currentLang = this.translateService.currentLang || 'en';
        return this.http.get(`${this.apiUrl}/countries?lang=${currentLang}`);
    }
    
    allShipments() {
        const currentLang = this.translateService.currentLang || 'en';
        return this.http.get(`${this.apiUrl}/shipments?lang=${currentLang}`);
    }
    
    allCities() {
        const currentLang = this.translateService.currentLang || 'en';
        return this.http.get(`${this.apiUrl}/cities?lang=${currentLang}`);
    }
    showCoupon(payload: { code: string }) {
        return this.http.post(`${this.apiUrl}/showCoupon`, payload);
    }

    createOrder(orderData: any) {
        return this.http.post(`${this.apiUrl}/orders`, orderData);
    }

    // --- Core Cart Logic ---

    private loadCartFromStorage(): void {
        try {
            const cart = localStorage.getItem('cart');
            const cartArray = cart ? JSON.parse(cart) : [];
            this.cartSubject.next(cartArray);
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            this.cartSubject.next([]);
        }
    }

    private saveCartToStorage(cart: any[]): void {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            this.cartSubject.next(cart);
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }

    getCart(): any[] {
        return this.cartSubject.value;
    }

    addToCart(product: any): void {
        const currentCart = this.getCart();
        const existingItem = currentCart.find((item) => item.product_id === product.id);

        if (existingItem) {
            this.updateQuantity(product.id, 1);
        } else {
            const price = product.price_after_discount || product.price || 0;
            const newItem = {
                id: Date.now(), // Unique ID for the cart item (optional, but good for tracking)
                product_id: product.id,
                quantity: 1,
                product: product,
                total_price: price * 1,
            };
            const updatedCart = [...currentCart, newItem];
            this.saveCartToStorage(updatedCart);
        }
    }

    updateQuantity(productId: number, change: number): void {
        let cart = this.getCart();
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
        this.saveCartToStorage(cart);
    }

    setQuantity(productId: number, quantity: number): void {
        let cart = this.getCart();
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
        this.saveCartToStorage(cart);
    }

    removeFromCart(productId: number): void {
        let cart = this.getCart();
        cart = cart.filter((item) => item.product_id !== productId);
        this.saveCartToStorage(cart);
    }

    delete(id: any) { // Kept for compatibility if used elsewhere using the item.id
        let cart = this.getCart();
        cart = cart.filter((item) => item.id !== id);
        this.saveCartToStorage(cart);
        // Return observable for compatibility if needed, though void is preferred for local ops
        return of({ success: true, message: 'Product removed from cart successfully.' });
    }

    clearCart(): void {
        this.saveCartToStorage([]);
    }

    refreshCart(): void {
        this.loadCartFromStorage();
    }

    isInCart(productId: number): boolean {
        return this.getCart().some((item) => item.product_id === productId);
    }

    getCartCount(): number {
        return this.getCart().length;
    }
}

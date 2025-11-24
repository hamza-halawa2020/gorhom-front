import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class FavouriteClientService {
    private apiUrl = environment.backEndUrl;
    public favSubject = new BehaviorSubject<any[]>(
        this.getFavFromLocalStorage()
    );
    client_fav$ = this.favSubject.asObservable();

    fav$ = this.favSubject.asObservable();

    constructor(private http: HttpClient) {}

    addToClientFav(product: any) {
        const currentFav = this.favSubject.getValue();

        const existingItem = currentFav.find(
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

            const updatedFav = [...currentFav, newItem];
            this.updateFav(updatedFav);
        }
        this.refreshFav();
    }

    updateFav(updatedFav: any[]) {
        this.favSubject.next(updatedFav);
        localStorage.setItem('client_fav', JSON.stringify(updatedFav));
    }

    private getFavFromLocalStorage(): any[] {
        const client_fav = localStorage.getItem('client_fav');
        return client_fav ? JSON.parse(client_fav) : [];
    }

    updateQuantity(productId: number, change: number) {
        let fav = this.getFavFromLocalStorage();
        fav = fav.map((item) => {
            if (item.product_id === productId) {
                return {
                    ...item,
                    quantity: Math.max(1, item.quantity + change),
                };
            }
            return item;
        });

        this.updateFav(fav);
    }

    removeFromFav(productId: number) {
        let fav = this.getFavFromLocalStorage();
        fav = fav.filter((item) => item.product_id !== productId);
        this.updateFav(fav);
        this.refreshFav();
    }

    clearFav() {
        this.updateFav([]);
        this.refreshFav();
    }

    refreshFav() {
        const fav = localStorage.getItem('client_fav');
        if (fav) {
            this.favSubject.next(JSON.parse(fav));
        }
    }
}

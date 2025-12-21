import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<any[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    // Load favorites from localStorage on service initialization
    this.loadFavoritesFromStorage();
  }

  private loadFavoritesFromStorage(): void {
    try {
      const favorites = localStorage.getItem('favorites');
      const favoritesArray = favorites ? JSON.parse(favorites) : [];
      this.favoritesSubject.next(favoritesArray);
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      this.favoritesSubject.next([]);
    }
  }

  getFavorites(): any[] {
    return this.favoritesSubject.value;
  }

  addToFavorites(product: any): boolean {
    const currentFavorites = this.getFavorites();
    const exists = currentFavorites.some(fav => fav.id === product.id);
    
    if (!exists) {
      const favoriteProduct = {
        id: product.id,
        title: product.title,
        translatedName: product.translatedName || product.title,
        price_after_discount: product.price_after_discount,
        price_before_discount: product.price_before_discount,
        discount: product.discount,
        image: product.image,
        files: product.files,
        slug: product.slug,
        category: product.category,
        dateAdded: new Date().toISOString()
      };
      
      currentFavorites.push(favoriteProduct);
      this.saveFavoritesToStorage(currentFavorites);
      return true;
    }
    return false;
  }

  removeFromFavorites(productId: number): boolean {
    const currentFavorites = this.getFavorites();
    const index = currentFavorites.findIndex(fav => fav.id === productId);
    
    if (index > -1) {
      currentFavorites.splice(index, 1);
      this.saveFavoritesToStorage(currentFavorites);
      return true;
    }
    return false;
  }

  toggleFavorite(product: any): boolean {
    const isInFavorites = this.isInFavorites(product.id);
    
    if (isInFavorites) {
      return this.removeFromFavorites(product.id);
    } else {
      return this.addToFavorites(product);
    }
  }

  isInFavorites(productId: number): boolean {
    return this.getFavorites().some(fav => fav.id === productId);
  }

  getFavoritesCount(): number {
    return this.getFavorites().length;
  }

  clearFavorites(): void {
    this.saveFavoritesToStorage([]);
  }

  private saveFavoritesToStorage(favorites: any[]): void {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }
}
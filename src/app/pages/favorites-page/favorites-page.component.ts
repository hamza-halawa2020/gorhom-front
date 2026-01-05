import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FavoritesService } from './favorites.service';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { environment } from '../../../environments/environment.development';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    NavbarComponent,
    FooterComponent,
    BackToTopComponent
  ],
  templateUrl: './favorites-page.component.html',
  styleUrls: ['./favorites-page.component.scss']
})
export class FavoritesPageComponent implements OnInit, OnDestroy {
  favorites: any[] = [];
  image = environment.imgUrl;
  private favoritesSubscription?: Subscription;
  showClearConfirmModal: boolean = false;

  constructor(
    private favoritesService: FavoritesService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    
    // Subscribe to favorites changes
    this.favoritesSubscription = this.favoritesService.favorites$.subscribe(
      (favorites) => {
        this.favorites = favorites;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  }

  loadFavorites(): void {
    this.favorites = this.favoritesService.getFavorites();
  }

  removeFromFavorites(productId: number): void {
    this.favoritesService.removeFromFavorites(productId);
  }

  clearAllFavorites(): void {
    this.showClearConfirmModal = true;
  }

  confirmClearFavorites(): void {
    this.favoritesService.clearFavorites();
    this.showClearConfirmModal = false;
  }

  cancelClearFavorites(): void {
    this.showClearConfirmModal = false;
  }

  getProductImage(product: any): string {
    if (product.files && product.files.length > 0) {
      return this.image + product.files[0].path;
    } else if (product.image) {
      return this.image + product.image;
    }
    return 'assets/images/fallback-image.jpg';
  }

  getDefaultSize(product: any): any {
    // Find the first size with stock > 0
    if (product?.sizes && product.sizes.length > 0) {
      return product.sizes.find((size: any) => size.stock > 0);
    }
    return null;
  }

  getDefaultSizePrice(product: any): number {
    const defaultSize = this.getDefaultSize(product);
    return defaultSize ? (defaultSize.price_after_discount ?? defaultSize.price) : (product?.price_after_discount ?? product?.price ?? 0);
  }

  getDefaultSizePriceBeforeDiscount(product: any): number | null {
    const defaultSize = this.getDefaultSize(product);
    return defaultSize?.price_before_discount ?? null;
  }

  getDiscount(product: any): number {
    const priceAfter = this.getDefaultSizePrice(product);
    const priceBefore = this.getDefaultSizePriceBeforeDiscount(product);
    return priceBefore ? priceBefore - priceAfter : 0;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/fallback-image.jpg';
  }

  trackByProductId(index: number, product: any): number {
    return product.id;
  }
}
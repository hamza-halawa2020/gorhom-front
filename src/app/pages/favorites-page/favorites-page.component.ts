import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FavoritesService } from '../../services/favorites.service';
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
    if (confirm(this.translateService.instant('Are you sure you want to clear all favorites?'))) {
      this.favoritesService.clearFavorites();
    }
  }

  getProductImage(product: any): string {
    if (product.files && product.files.length > 0) {
      return this.image + product.files[0].path;
    } else if (product.image) {
      return this.image + product.image;
    }
    return 'assets/images/fallback-image.jpg';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/fallback-image.jpg';
  }

  trackByProductId(index: number, product: any): number {
    return product.id;
  }
}
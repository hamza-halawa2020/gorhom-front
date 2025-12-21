import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductSliderService } from './product-slider.service';
import { environment } from '../../../environments/environment.development';
import { CartService } from '../../pages/cart-page/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
    selector: 'app-products-section',
    standalone: true,
    imports: [RouterLink, TranslateModule, CommonModule],
    templateUrl: './products-section.component.html',
    styleUrls: ['./products-section.component.scss'],
})
export class ProductsSectionComponent implements OnInit {
    products: any[] = [];
    filteredProducts: any[] = [];
    activeFilter: string = 'all';
    image = environment.imgUrl;
    hoverImages: { [key: number]: string } = {};
    successMessage: string = '';
    errorMessage: string = '';
    isLoggedIn: boolean = false;
    readonly maxProductsToShow: number = 8;

    constructor(
        private productSliderService: ProductSliderService,
        public translate: TranslateService,
        private cartService: CartService,
        private cdr: ChangeDetectorRef,
        private favoritesService: FavoritesService
    ) { }

    ngOnInit(): void {
        this.fetchSliderData();
        this.translate.onLangChange.subscribe(() => {
            this.setFilter(this.activeFilter);
        });
    }

    fetchSliderData(): void {
        this.productSliderService.index().subscribe({
            next: (response) => {
                this.products = Object.values(response)[0];

                this.setFilter('all');
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching products:', error);
            },
        });
    }

    shuffleArray(array: any[]): any[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    setFilter(filter: string): void {
        this.activeFilter = filter;

        let filtered: any[] = [];

        if (filter === 'all') {
            filtered = this.shuffleArray([...this.products]).slice(
                0,
                this.maxProductsToShow
            );
        } else if (filter === 'offers') {
            filtered = this.shuffleArray(
                this.products.filter((product) => product.discount > 0)
            ).slice(0, this.maxProductsToShow);
        } else if (filter === 'BEST_PRICE') {
            filtered = [...this.products]
                .sort((a, b) => a.priceAfterDiscount - b.priceAfterDiscount)
                .slice(0, this.maxProductsToShow);
        }

        this.filteredProducts = filtered;
        this.cdr.detectChanges();
    }

    onImageError(event: Event): void {
        (event.target as HTMLImageElement).src = 'assets/images/logo.svg';
    }

    addToClientCart(product: any) {
        this.addToCart(product.id);
    }

    addToCart(product_id: any) {
        const product = this.products.find(p => p.id === product_id);

        if (!product) {
            this.errorMessage = this.translate.instant('PRODUCT_NOT_FOUND');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
            return;
        }

        const success = this.cartService.addToCart(product);

        if (this.cartService.isInCart(product.id)) {
            this.successMessage = this.translate.instant('PRODUCT_ADDED_TO_CART');
        } else {
            this.successMessage = this.translate.instant('PRODUCT_ADDED_TO_CART');
        }
        setTimeout(() => { this.successMessage = ''; }, 1000);
    }

    addToFavourite(product_id: any) {
        // Find the product in the products array
        const product = this.products.find(p => p.id === product_id);
        if (!product) {
            this.errorMessage = this.translate.instant('PRODUCT_NOT_FOUND');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
            return;
        }

        const success = this.favoritesService.toggleFavorite(product);
        if (success) {
            const isInFavorites = this.favoritesService.isInFavorites(product_id);
            if (isInFavorites) {
                this.successMessage = this.translate.instant('Product added to favorites!');
            } else {
                this.successMessage = this.translate.instant('Product removed from favorites!');
            }
            setTimeout(() => { this.successMessage = ''; }, 1000);
        } else {
            this.errorMessage = this.translate.instant('Error updating favorites');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
        }
    }

    addToClientFavourite(product: any) {
        const success = this.favoritesService.toggleFavorite(product);
        if (success) {
            const isInFavorites = this.favoritesService.isInFavorites(product.id);
            if (isInFavorites) {
                this.successMessage = this.translate.instant('Product added to favorites!');
            } else {
                this.successMessage = this.translate.instant('Product removed from favorites!');
            }
            setTimeout(() => { this.successMessage = ''; }, 1000);
        } else {
            this.errorMessage = this.translate.instant('Error updating favorites');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
        }
    }

    isProductInFavorites(productId: number): boolean {
        return this.favoritesService.isInFavorites(productId);
    }

    isProductInCart(productId: number): boolean {
        return this.cartService.isInCart(productId);
    }
}

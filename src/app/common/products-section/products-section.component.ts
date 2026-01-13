import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductSliderService } from './product-slider.service';
import { environment } from '../../../environments/environment.development';
import { CartService } from '../../pages/client-cart/cart.service';
import { FavoritesService } from '../../pages/favorites-page/favorites.service';

@Component({
    selector: 'app-products-section',
    standalone: true,
    imports: [RouterLink, TranslateModule, CommonModule, NgOptimizedImage],
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
            this.fetchSliderData(); // Re-fetch data with new language
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
            // Filter products that have a discount on their default size
            filtered = this.shuffleArray(
                this.products.filter((product) => {
                    const priceBefore = this.getDefaultSizePriceBeforeDiscount(product);
                    const priceAfter = this.getDefaultSizePrice(product);
                    return priceBefore && priceAfter && priceBefore > priceAfter;
                })
            ).slice(0, this.maxProductsToShow);
        } else if (filter === 'BEST_PRICE') {
            filtered = [...this.products]
                .sort((a, b) => this.getDefaultSizePrice(a) - this.getDefaultSizePrice(b))
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

        // Get default size with stock
        const defaultSize = this.getDefaultSize(product);
        if (!defaultSize) {
            this.errorMessage = this.translate.instant('OUT_OF_STOCK');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
            return;
        }

        // Add size info to product before adding to cart
        const productWithSize = {
            ...product,
            selected_size: defaultSize,
            selected_size_id: defaultSize.id,
            selected_size_name: defaultSize.size,
            selected_price: defaultSize.price_after_discount ?? defaultSize.price
        };

        const success = this.cartService.addToCart(productWithSize);

        if (this.cartService.isInCart(product.id)) {
            this.successMessage = this.translate.instant('PRODUCT_ADDED_TO_CART');
        } else {
            this.successMessage = this.translate.instant('PRODUCT_ADDED_TO_CART');
        }
        setTimeout(() => { this.successMessage = ''; }, 1000);
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

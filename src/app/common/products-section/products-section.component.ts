import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductSliderService } from './product-slider.service';
import { environment } from '../../../environments/environment.development';
import { CartService } from '../../pages/cart-page/cart.service';
import { ClientCartService } from '../../pages/client-cart/client-cart.service';
import { FavouriteClientService } from '../../pages/favourite-client-page/favourite-client.service';
import { LoginService } from '../../pages/login-page/login.service';

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
    image = environment.imgUrl + 'products/';
    hoverImages: { [key: number]: string } = {};
    successMessage: string = '';
    errorMessage: string = '';
    isLoggedIn: boolean = false;
    readonly maxProductsToShow: number = 8;

    constructor(
        private productSliderService: ProductSliderService,
        public translate: TranslateService,
        private cartService: CartService,
        private cartClientService: ClientCartService,
        private loginService: LoginService,
        private favClientService: FavouriteClientService,
        private cdr: ChangeDetectorRef
    ) {
        this.isLoggedIn = !!loginService.isLoggedIn();
    }

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

    getRandomImage(images: any[]): string {
        if (!images || images.length <= 1) {
            // If 0 or 1 image, no hover options
            return 'assets/images/logo.svg';
        }
        // Select from images excluding index 0
        const randomIndex = Math.floor(Math.random() * (images.length - 1)) + 1; // Start from 1 to length-1
        return `${this.image}${images[randomIndex]?.image || ''}`;
    }

    onImageError(event: Event): void {
        (event.target as HTMLImageElement).src = 'assets/images/logo.svg';
    }

    onMouseEnter(productId: number, images: any[]): void {
        this.hoverImages[productId] = this.getRandomImage(images);
        this.cdr.detectChanges();
    }

    onMouseLeave(productId: number): void {
        delete this.hoverImages[productId];
        this.cdr.detectChanges();
    }

    addToClientCart(product: any) {
        const client_cart = this.cartClientService.cartSubject.value;

        if (!client_cart || !Array.isArray(client_cart)) {
            this.errorMessage = this.translate.instant(
                'CART_DATA_NOT_AVAILABLE'
            );
            return;
        }

        const exists = client_cart.some(
            (item) => item && item.product_id === product.id
        );

        if (exists) {
            this.errorMessage = this.translate.instant(
                'PRODUCT_ALREADY_IN_CART'
            );
            setTimeout(() => {
                this.errorMessage = '';
            }, 1000);
        } else {
            const productToAdd = { ...product, quantity: 1 };
            this.cartClientService.addToClientCart(productToAdd);

            this.successMessage = this.translate.instant(
                'PRODUCT_ADDED_TO_CART'
            );
            setTimeout(() => {
                this.successMessage = '';
            }, 1000);
        }
    }

    addToCart(product_id: any) {
        const payload = {
            product_id: product_id,
        };

        this.cartService.addToCart(payload).subscribe({
            next: (response) => {
                this.successMessage = this.translate.instant(
                    'PRODUCT_ADDED_TO_CART'
                );
                setTimeout(() => {
                    this.successMessage = '';
                }, 1000);
            },
            error: (error) => {
                if (error.error?.errors) {
                    this.errorMessage = Object.values(error.error.errors)
                        .flat()
                        .join(' | ');
                } else {
                    this.errorMessage =
                        error.error?.message ||
                        this.translate.instant('UNEXPECTED_ERROR');
                }
                setTimeout(() => {
                    this.errorMessage = '';
                }, 3000);
            },
        });
    }

    addToFavourite(product_id: any) {
        const payload = {
            product_id: product_id,
        };

        // this.favouriteService.add(payload).subscribe({
        //     next: (response) => {
        //         this.successMessage = this.translate.instant(
        //             'PRODUCT_ADDED_TO_WISHLIST'
        //         );
        //         setTimeout(() => {
        //             this.successMessage = '';
        //         }, 1000);
        //     },
        //     error: (error) => {
        //         if (error.error?.errors) {
        //             this.errorMessage = Object.values(error.error.errors)
        //                 .flat()
        //                 .join(' | ');
        //         } else {
        //             this.errorMessage =
        //                 error.error?.message ||
        //                 this.translate.instant('UNEXPECTED_ERROR');
        //         }
        //         setTimeout(() => {
        //             this.errorMessage = '';
        //         }, 3000);
        //     },
        // });
    }

    addToClientFavourite(product: any) {
        const client_fav = this.favClientService.favSubject.value;

        if (!client_fav || !Array.isArray(client_fav)) {
            this.errorMessage = this.translate.instant(
                'FAV_DATA_NOT_AVAILABLE'
            );
            return;
        }

        const exists = client_fav.some(
            (item) => item && item.product_id === product.id
        );

        if (exists) {
            this.errorMessage = this.translate.instant(
                'PRODUCT_ALREADY_IN_FAV'
            );
            setTimeout(() => {
                this.errorMessage = '';
            }, 1000);
        } else {
            const productToAdd = { ...product, quantity: 1 };
            this.favClientService.addToClientFav(productToAdd);

            this.successMessage = this.translate.instant(
                'PRODUCT_ADDED_TO_FAV'
            );
            setTimeout(() => {
                this.successMessage = '';
            }, 1000);
        }
    }
}

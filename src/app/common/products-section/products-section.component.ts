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
        private cdr: ChangeDetectorRef
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
                console.log(this.products, 'dsfdsfds');

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

    }

    addToCart(product_id: any) {
        const product = this.products.find(p => p.id === product_id);

        if (!product) {
            this.errorMessage = this.translate.instant('PRODUCT_NOT_FOUND');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const exists = cart.some((item: any) => item && item.product_id === product.id);

        if (exists) {
            this.errorMessage = this.translate.instant('PRODUCT_ALREADY_IN_CART');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
        } else {
            this.cartService.addToCart(product).subscribe({
                next: (response) => {
                    this.successMessage = this.translate.instant(
                        'PRODUCT_ADDED_TO_CART'
                    );
                    setTimeout(() => {
                        this.successMessage = '';
                    }, 1000);
                },
            });
        }
    }

    addToFavourite(product_id: any) {
        const payload = {
            product_id: product_id,
        };
    }

    addToClientFavourite(product: any) {

    }
}

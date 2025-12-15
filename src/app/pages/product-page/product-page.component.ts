import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { FeedbackComponent } from '../../common/feedback/feedback.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { environment } from '../../../environments/environment.development';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ProductService } from './product.service';
import { ClientCartService } from '../client-cart/client-cart.service';
import { FavouriteClientService } from '../favourite-client-page/favourite-client.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-product-page',
    standalone: true,
    imports: [
        HttpClientModule,
        CommonModule,
        RouterLink,
        NavbarComponent,
        PageBannerComponent,
        FeedbackComponent,
        NgIf,
        NgClass,
        FooterComponent,
        BackToTopComponent,
        TranslateModule,
    ],
    templateUrl: './product-page.component.html',
    styleUrls: ['./product-page.component.scss'],
    providers: [ProductService],
})
export class ProductPageComponent implements OnInit {
    data: any[] = [];
    originalData: any[] = [];
    image = environment.imgUrl;
    isLoggedIn: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';
    gridColumns: number = 4; // Default number of columns
    gridClass: string = 'col-lg-3 col-md-4 col-sm-6'; // Default grid class
    isMobile: boolean = false;

    constructor(
        public router: Router,
        private productService: ProductService,
        private cartClientService: ClientCartService,
        private favClientService: FavouriteClientService,
        public translateService: TranslateService
    ) {
        this.checkMobile();
        window.addEventListener('resize', () => this.checkMobile());
    }

    ngOnInit(): void {
        this.fetchdata();
        this.translateService.onLangChange.subscribe(() => {
            this.translateData();
        });
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', () => this.checkMobile());
    }

    checkMobile(): void {
        this.isMobile = window.innerWidth < 768;
        if (this.isMobile && (this.gridColumns === 4 || this.gridColumns === 6)) {
            this.setGridColumns(2); // Default to 2 columns on mobile
        }
    }

    setGridColumns(columns: number): void {
        if (this.isMobile && columns > 3) {
            columns = 3; // Restrict to max 3 columns on mobile
        }
        this.gridColumns = columns;
        switch (columns) {
            case 1:
                this.gridClass = 'col-12';
                break;
            case 2:
                this.gridClass = 'col-lg-6 col-md-6 col-6';
                break;
            case 3:
                this.gridClass = 'col-lg-4 col-md-6 col-4';
                break;
            case 4:
                this.gridClass = 'col-lg-3 col-md-4 col-sm-6';
                break;
            case 6:
                this.gridClass = 'col-lg-2 col-md-4 col-sm-6';
                break;
            default:
                this.gridClass = 'col-lg-3 col-md-4 col-sm-6';
                break;
        }

        document.body.classList.remove('grid-columns-1', 'grid-columns-2', 'grid-columns-3', 
                                     'grid-columns-4', 'grid-columns-6');
        document.body.classList.add(`grid-columns-${columns}`);
    }

    sortProducts(sortOption: any): void {
        let sortedData = [...this.originalData];
        switch (sortOption) {
            case 'a_to_z':
                sortedData.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'z_to_a':
                sortedData.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                break;
            case 'price_low_to_high':
                sortedData.sort((a, b) => (a.price_after_discount || 0) - (b.price_after_discount || 0));
                break;
            case 'price_high_to_low':
                sortedData.sort((a, b) => (b.price_after_discount || 0) - (a.price_after_discount || 0));
                break;
            case 'date_old_to_new':
                sortedData.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
                break;
            case 'date_new_to_old':
                sortedData.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                break;
            default:
                sortedData = [...this.originalData];
                break;
        }
        this.data = sortedData;
        this.translateData();
    }

    addToClientCart(product: any) {
        const client_cart = this.cartClientService.cartSubject.value;
        if (!client_cart || !Array.isArray(client_cart)) {
            this.errorMessage = this.translateService.instant('CART_DATA_NOT_AVAILABLE');
            return;
        }
        const exists = client_cart.some((item) => item && item.product_id === product.id);
        if (exists) {
            this.errorMessage = this.translateService.instant('PRODUCT_ALREADY_IN_CART');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
        } else {
            const productToAdd = { ...product, quantity: 1 };
            this.cartClientService.addToClientCart(productToAdd);
            this.successMessage = this.translateService.instant('PRODUCT_ADDED_TO_CART');
            setTimeout(() => { this.successMessage = ''; }, 1000);
        }
    }

    addToCart(product_id: any) {
      
    }

    addToFavourite(product_id: any) {
        const payload = { product_id };
    }

    addToClientFavourite(product: any) {
        const client_fav = this.favClientService.favSubject.value;
        if (!client_fav || !Array.isArray(client_fav)) {
            this.errorMessage = this.translateService.instant('FAV_DATA_NOT_AVAILABLE');
            return;
        }
        const exists = client_fav.some((item) => item && item.product_id === product.id);
        if (exists) {
            this.errorMessage = this.translateService.instant('PRODUCT_ALREADY_IN_FAV');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
        } else {
            const productToAdd = { ...product, quantity: 1 };
            this.favClientService.addToClientFav(productToAdd);
            this.successMessage = this.translateService.instant('PRODUCT_ADDED_TO_FAV');
            setTimeout(() => { this.successMessage = ''; }, 1000);
        }
    }

    fetchdata() {
        this.productService.index().subscribe({
            next: (response) => {
                this.originalData = Object.values(response)[0] || [];               
                this.originalData = this.originalData.map(product => ({
                    ...product,
                    productImages: product.productImages || []
                }));
                this.data = [...this.originalData];

                this.translateData();
            },
            error: (error) => {
                this.errorMessage = this.translateService.instant('UNEXPECTED_ERROR');
                setTimeout(() => { this.errorMessage = ''; }, 3000);
            },
        });
    }

    translateData() {
        if (!this.data || !Array.isArray(this.data)) return;
        this.data.forEach((product: any) => {
            product.translatedName = this.translateService.instant(product.title) || product.title;
            product.translatedDescription = this.translateService.instant(product.description) || product.description;
        });
    }
}
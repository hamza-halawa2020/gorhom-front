import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { FeedbackComponent } from '../../common/feedback/feedback.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { environment } from '../../../environments/environment.development';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { CategoryService } from './category.service';
import { CartService } from '../cart-page/cart.service';
import { FavouriteClientService } from '../favorites-page/favourite-client.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FavoritesService } from '../favorites-page/favorites.service';

@Component({
    selector: 'app-category-page',
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
    templateUrl: './category-page.component.html',
    styleUrls: ['./category-page.component.scss'],
    providers: [CategoryService],
})
export class CategoryPageComponent implements OnInit {
    data: any[] = [];
    originalData: any[] = [];
    image = environment.imgUrl;
    isLoggedIn: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';
    gridColumns: number = 4;
    gridClass: string = 'col-lg-3 col-md-4 col-sm-6';
    categoryId: string | null = null;
    isMobile: boolean = false;

    constructor(
        public router: Router,
        private categoryService: CategoryService,
        private cartService: CartService,
        private route: ActivatedRoute,
        public translateService: TranslateService,
        private favoritesService: FavoritesService
    ) {
        this.checkMobile();
        window.addEventListener('resize', () => this.checkMobile());
    }

    ngOnInit(): void {
        this.categoryId = this.route.snapshot.paramMap.get('id');

        this.fetchdata();
        this.translateService.onLangChange.subscribe(() => {
            this.translateData();
        });
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', () => this.checkMobile());
    }

    checkMobile(): void {
        this.isMobile = window.innerWidth < 768 || window.matchMedia('(max-width: 767.98px)').matches;
        if (this.isMobile && (this.gridColumns === 4 || this.gridColumns === 6)) {
            this.setGridColumns(2);
        }
    }

    setGridColumns(columns: number): void {
        if (this.isMobile && columns > 3) {
            columns = 3;
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

        document.body.classList.remove(
            'grid-columns-1',
            'grid-columns-2',
            'grid-columns-3',
            'grid-columns-4',
            'grid-columns-6'
        );
        document.body.classList.add(`grid-columns-${columns}`);
    }

    sortCategorys(sortOption: any): void {
        let sortedData = [...this.data];
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
                sortedData.sort(
                    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                );
                break;
            case 'date_new_to_old':
                sortedData.sort(
                    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                );
                break;
            default:
                sortedData = [...this.data];
                break;
        }
        this.data = sortedData;
        this.translateData();
    }

    addToClientCart(category: any) {
        this.addToCart(category.id);
    }

    addToCart(product_id: any) {
        const product = this.data.find(p => p.id === product_id);

        if (!product) {
            this.errorMessage = this.translateService.instant('PRODUCT_NOT_FOUND');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
            return;
        }

        const success = this.cartService.addToCart(product);
        if (this.cartService.isInCart(product.id)) {
            this.successMessage = this.translateService.instant('PRODUCT_ADDED_TO_CART');
        } else {
            this.successMessage = this.translateService.instant('PRODUCT_ADDED_TO_CART');
        }
        setTimeout(() => { this.successMessage = ''; }, 1000);
    }

    addToFavourite(category_id: any) {
        // Find the product in the data array
        const product = this.data.find(p => p.id === category_id);
        if (!product) {
            this.errorMessage = this.translateService.instant('PRODUCT_NOT_FOUND');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
            return;
        }

        const success = this.favoritesService.toggleFavorite(product);
        if (success) {
            const isInFavorites = this.favoritesService.isInFavorites(category_id);
            if (isInFavorites) {
                this.successMessage = this.translateService.instant('Product added to favorites!');
            } else {
                this.successMessage = this.translateService.instant('Product removed from favorites!');
            }
            setTimeout(() => { this.successMessage = ''; }, 1000);
        } else {
            this.errorMessage = this.translateService.instant('Error updating favorites');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
        }
    }

    addToClientFavourite(category: any) {
        const success = this.favoritesService.toggleFavorite(category);
        if (success) {
            const isInFavorites = this.favoritesService.isInFavorites(category.id);
            if (isInFavorites) {
                this.successMessage = this.translateService.instant('Product added to favorites!');
            } else {
                this.successMessage = this.translateService.instant('Product removed from favorites!');
            }
            setTimeout(() => { this.successMessage = ''; }, 1000);
        } else {
            this.errorMessage = this.translateService.instant('Error updating favorites');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
        }
    }

    isProductInFavorites(productId: number): boolean {
        return this.favoritesService.isInFavorites(productId);
    }

    isProductInCart(productId: number): boolean {
        return this.cartService.isInCart(productId);
    }

    fetchdata() {
        this.categoryService.index().subscribe({
            next: (response) => {
                this.originalData = Object.values(response)[0] || [];
                this.originalData = this.originalData.map((product) => ({
                    ...product,
                    productImages: product.productImages || [],
                }));
                if (this.categoryId) {
                    this.data = this.originalData.filter(
                        (product) => product.category.id == `${this.categoryId}`
                    );
                } else {
                    this.data = [...this.originalData];
                }
                this.translateData();
            },
            error: (error) => {
                this.errorMessage = this.translateService.instant('UNEXPECTED_ERROR');
                setTimeout(() => (this.errorMessage = ''), 3000);
            },
        });
    }

    translateData() {
        if (!this.data || !Array.isArray(this.data)) return;
        this.data.forEach((category: any) => {
            category.translatedName = this.translateService.instant(category.title) || category.title;
            category.translatedDescription =
                this.translateService.instant(category.description) || category.description;
        });
    }
}
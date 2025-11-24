import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { environment } from '../../../environments/environment.development';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { FavouriteClientService } from './favourite-client.service';
import { ClientCartService } from '../client-cart/client-cart.service';
import { TranslateService,TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-favourite-client-page',
    standalone: true,
    imports: [
        NavbarComponent,
        PageBannerComponent,
        FooterComponent,
        BackToTopComponent,
        RouterLink,
        NgIf,
        NgClass,
        CommonModule,
        TranslateModule, // Added for translations
    ],
    templateUrl: './favourite-client-page.component.html',
    styleUrl: './favourite-client-page.component.scss',
    providers: [FavouriteClientService],
})
export class FavouriteClientPageComponent implements OnInit {
    favItems: any[] = [];
    image = environment.imgUrl + 'products/';
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        public router: Router,
        private clientFavService: FavouriteClientService,
        private clientCartService: ClientCartService,
        public translateService: TranslateService // Injected for translation
    ) {}

    ngOnInit(): void {
        this.fetchFavData();
        this.translateService.onLangChange.subscribe(() => {
            this.translateData(); // Re-translate data on language change
        });
    }

    fetchFavData() {
        this.clientFavService.client_fav$.subscribe((client_fav) => {
            this.favItems = client_fav || [];
            this.translateData();
        });
    }

    deleteItem(productId: number) {
        const areYouSure = this.translateService.instant('ARE_YOU_SURE');
        const removeItemConfirm = this.translateService.instant('REMOVE_ITEM_CONFIRM');
        const yesRemoveIt = this.translateService.instant('YES_REMOVE_IT');
        const cancel = this.translateService.instant('CANCEL');
        const removed = this.translateService.instant('REMOVED');
        const productRemovedSuccess = this.translateService.instant('PRODUCT_REMOVED_SUCCESS');

        Swal.fire({
            title: areYouSure,
            text: removeItemConfirm,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: yesRemoveIt,
            cancelButtonText: cancel,
            customClass: {
                popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr'
            }
        }).then((result: any) => {
            if (result.isConfirmed) {
                try {
                    this.clientFavService.removeFromFav(productId);
                    this.clientFavService.refreshFav();
                    Swal.fire({
                        title: removed,
                        text: productRemovedSuccess,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr'
                        }
                    });
                } catch (error) {
                    this.handleError(error);
                }
            }
        });
    }

    clearFav() {
        const areYouSure = this.translateService.instant('ARE_YOU_SURE');
        const clearWishlistConfirm = this.translateService.instant('CLEAR_WISHLIST_CONFIRM');
        const yesClearIt = this.translateService.instant('YES_CLEAR_IT');
        const cancel = this.translateService.instant('CANCEL');
        const cleared = this.translateService.instant('CLEAR');
        const wishlistClearedSuccess = this.translateService.instant('WISHLIST_CLEARED_SUCCESS');

        Swal.fire({
            title: areYouSure,
            text: clearWishlistConfirm,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: yesClearIt,
            cancelButtonText: cancel,
            customClass: {
                popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr'
            }
        }).then((result: any) => {
            if (result.isConfirmed) {
                try {
                    this.clientFavService.clearFav();
                    this.clientFavService.refreshFav();
                    localStorage.removeItem('checkoutData');
                    localStorage.removeItem('totalPriceData');
                    Swal.fire({
                        title: cleared,
                        text: wishlistClearedSuccess,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr'
                        }
                    });
                } catch (error) {
                    this.handleError(error);
                }
            }
        });
    }

    // addToCart(productId: number) {
    //     const payload = { product_id: productId };

    //     this.clientCartService.addToCart(payload).subscribe({
    //         next: (response:any) => {
    //             this.successMessage = this.translateService.instant('PRODUCT_ADDED_TO_CART');
    //             setTimeout(() => { this.successMessage = ''; }, 1000);

    //             const itemIndex = this.favItems.findIndex((item: any) => item.product_id === productId);
    //             if (itemIndex !== -1) {
    //                 this.clientFavService.removeFromFav(this.favItems[itemIndex].product_id);
    //                 this.clientFavService.refreshFav();
    //             }
    //         },
    //         error: (error:any) => {
    //             this.handleError(error);
    //         },
    //     });
    // }

    private handleError(error: any) {
        if (error.error?.errors) {
            this.errorMessage = Object.values(error.error.errors).flat().join(' | ');
        } else {
            this.errorMessage = error.error?.message || this.translateService.instant('UNEXPECTED_ERROR');
        }
        setTimeout(() => { this.errorMessage = ''; }, 3000);
    }

    private translateData() {
        // Translate product titles if needed (optional, based on your data structure)
        if (this.favItems) {
            this.favItems.forEach((item: any) => {
                item.product.translatedTitle = this.translateService.instant(item.product.title) || item.product.title;
            });
        }
    }
}
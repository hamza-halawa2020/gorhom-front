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
import { CheckoutService } from './checkout.service';
import { CartService } from '../cart-page/cart.service';
import { LoginService } from '../login-page/login.service';
import { ClientCartService } from '../client-cart/client-cart.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-checkout-page',
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
    templateUrl: './checkout-page.component.html',
    styleUrl: './checkout-page.component.scss',
    providers: [CheckoutService],
})
export class CheckoutPageComponent implements OnInit {
    products: any;
    image = environment.imgUrl + 'products/';
    checkoutData: any;
    totalPriceData: any;
    successMessage: string = '';
    errorMessage: string = '';
    isLoggedIn: boolean = false;
    isLoading: boolean = false; // Add loading state flag

    constructor(
        public router: Router,
        private checkoutService: CheckoutService,
        private cartService: CartService,
        private clientCartService: ClientCartService,
        private loginService: LoginService,
        public translateService: TranslateService
    ) {
        this.isLoggedIn = !!loginService.isLoggedIn();
    }

    ngOnInit(): void {
        this.fetchAllProducts();

        const storedData = localStorage.getItem('checkoutData');
        if (storedData) {
            this.checkoutData = JSON.parse(storedData);
        }

        const storedData2 = localStorage.getItem('totalPriceData');
        if (storedData2) {
            this.totalPriceData = JSON.parse(storedData2);
        }
    }

    fetchAllProducts() {
        this.checkoutService.allProducts().subscribe({
            next: (response) => {
                this.products = Object.values(response)[0];
            },
            error: (error) => {
                this.handleError(error);
            },
        });
    }

    getProductDetails(productId: number): { title: string; image: string } {
        const product = this.products?.find((p: any) => p.id === productId);
        return product
            ? { title: product.title, image: product.productImages[0].image }
            : {
                  title: this.translateService.instant('Unknown'),
                  image: 'default.png',
              };
    }

    updatePaymentMethod(method: string) {
        let storedData = localStorage.getItem('checkoutData');
        if (storedData) {
            let checkoutData = JSON.parse(storedData);
            checkoutData.payment_method = method;
            localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        }
    }

    proceedToCheckout() {
        const storedData = localStorage.getItem('checkoutData');
        if (storedData) {
            try {
                let checkoutData = JSON.parse(storedData);

                if (!checkoutData.payment_method) {
                    this.errorMessage = this.translateService.instant(
                        'PLEASE_SELECT_PAYMENT_METHOD'
                    );
                    setTimeout(() => {
                        this.errorMessage = '';
                    }, 3000);
                    return;
                }

                // Show loader
                this.isLoading = true;

                if (checkoutData.payment_method === 'cash_on_delivery') {
                    this.checkoutService.storeOrder(checkoutData).subscribe({
                        next: (orderResponse: any) => {
                            this.successMessage = this.translateService.instant(
                                'ORDER_PLACED_CASH_SUCCESS'
                            );
                            setTimeout(() => {
                                this.successMessage = '';
                            }, 3000);
                            localStorage.removeItem('checkoutData');
                            localStorage.removeItem('totalPriceData');
                            localStorage.removeItem('appliedCoupon');
                            this.checkoutData = null;
                            this.totalPriceData = null;
                            this.cartService.clearCart().subscribe();
                            this.isLoading = false; // Hide loader
                            this.router.navigate(['/payment-status'], {queryParams: {success: true,orderNumber: orderResponse.data.order_number},});
                        },
                        error: (error) => {
                            this.handleError(error);
                            this.isLoading = false; // Hide loader on error
                        },
                    });
                } else if (checkoutData.payment_method === 'visa') {
                    this.checkoutService.storeOrder(checkoutData).subscribe({
                        next: (orderResponse: any) => {
                            const payLoad = { orderID: orderResponse.data.id };
                            this.checkoutService
                                .getPaymentLink(payLoad)
                                .subscribe({
                                    next: (paymentResponse: any) => {
                                        // window.open(paymentResponse.iframe_url);
                                        window.location.href =
                                            paymentResponse.iframe_url;

                                        this.isLoading = false; // Hide loader after opening Visa page
                                    },
                                    error: (error) => {
                                        this.handleError(error);
                                        this.isLoading = false; // Hide loader on error
                                    },
                                });
                        },
                        error: (error) => {
                            this.handleError(error);
                            this.isLoading = false; // Hide loader on error
                        },
                    });
                }
            } catch (error: any) {
                this.handleError(error);
                this.isLoading = false; // Hide loader on error
            }
        } else {
            this.errorMessage =
                this.translateService.instant('NO_CHECKOUT_DATA');
            setTimeout(() => {
                this.errorMessage = '';
            }, 3000);
        }
    }

    proceedToClientCheckout() {
        const storedData = localStorage.getItem('checkoutData');
        if (storedData) {
            try {
                let checkoutData = JSON.parse(storedData);

                if (!checkoutData.payment_method) {
                    this.errorMessage = this.translateService.instant(
                        'PLEASE_SELECT_PAYMENT_METHOD'
                    );
                    setTimeout(() => {
                        this.errorMessage = '';
                    }, 3000);
                    return;
                }

                // Show loader
                this.isLoading = true;

                if (checkoutData.payment_method === 'cash_on_delivery') {
                    this.checkoutService
                        .storeClientOrder(checkoutData)
                        .subscribe({
                            next: (orderResponse: any) => {
                                this.successMessage =
                                    this.translateService.instant(
                                        'ORDER_PLACED_CASH_SUCCESS'
                                    );
                                setTimeout(() => {
                                    this.successMessage = '';
                                }, 3000);
                                localStorage.removeItem('checkoutData');
                                localStorage.removeItem('totalPriceData');
                                localStorage.removeItem('appliedCoupon');
                                this.checkoutData = null;
                                this.totalPriceData = null;
                                this.clientCartService.clearCart();
                                this.isLoading = false; // Hide loader
                                this.router.navigate(['/payment-status'], {queryParams: {success: true,orderNumber: orderResponse.data.order_number},});
                            },
                            error: (error) => {
                                this.handleError(error);
                                this.isLoading = false; // Hide loader on error
                            },
                        });
                } else if (checkoutData.payment_method === 'visa') {
                    this.checkoutService
                        .storeClientOrder(checkoutData)
                        .subscribe({
                            next: (orderResponse: any) => {
                                const payLoad = {
                                    orderID: orderResponse.data.id,
                                };
                                this.checkoutService
                                    .getPaymentLink(payLoad)
                                    .subscribe({
                                        next: (paymentResponse: any) => {
                                            // window.open(paymentResponse.iframe_url);
                                            window.location.href =
                                                paymentResponse.iframe_url;

                                            this.isLoading = false; // Hide loader after opening Visa page
                                        },
                                        error: (error) => {
                                            this.handleError(error);
                                            this.isLoading = false; // Hide loader on error
                                        },
                                    });
                            },
                            error: (error) => {
                                this.handleError(error);
                                this.isLoading = false; // Hide loader on error
                            },
                        });
                }
            } catch (error: any) {
                this.handleError(error);
                this.isLoading = false; // Hide loader on error
            }
        } else {
            this.errorMessage =
                this.translateService.instant('NO_CHECKOUT_DATA');
            setTimeout(() => {
                this.errorMessage = '';
            }, 3000);
        }
    }

    private handleError(error: any) {
        if (error.error?.errors) {
            this.errorMessage = Object.values(error.error.errors)
                .flat()
                .join(' | ');
        } else {
            this.errorMessage =
                error.error?.message ||
                this.translateService.instant('UNEXPECTED_ERROR');
        }
        setTimeout(() => {
            this.errorMessage = '';
        }, 3000);
    }
}

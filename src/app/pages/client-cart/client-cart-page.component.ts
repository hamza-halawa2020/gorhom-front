import { Component, OnInit } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClientCartService } from './client-cart.service'; // Use ClientCartService
import { CartService } from '../cart-page/cart.service';

@Component({
    selector: 'app-client-cart-page',

    standalone: true,
    imports: [
        NavbarComponent,
        PageBannerComponent,
        FooterComponent,
        BackToTopComponent,
        RouterLink,
        CommonModule,
        FormsModule,
        TranslateModule,
    ],
    templateUrl: './client-cart-page.component.html',
    styleUrl: './client-cart-page.component.scss',
    providers: [ClientCartService, CartService], // Add both services
})
export class ClientCartPageComponent implements OnInit {
    data: any[] = []; // Array of cart items
    cartItems: any[] = []; // Array of cart items (from ClientCartService)
    countries: any[] = []; // Array of countries
    cities: any[] = []; // Array of cities
    shipments: any[] = []; // Array of shipments
    shipmentCost: number = 0;
    filteredCities: any[] = []; // Array of filtered cities
    selectedCountry: string = ''; // ID of selected country
    selectedCity: string = ''; // ID of selected city
    image = environment.imgUrl + 'products/';
    successMessage: string = '';
    errorMessage: string = '';
    totalPrice: number = 0; // Total price calculated client-side
    name: string = ''; // New field: Name
    email: string = ''; // New field: Email
    phone: string = ''; // New field: Phone
    address: string = ''; // Existing field: Address
    notes: string = ''; // Existing field: Notes
    couponCode: any;

    constructor(
        public router: Router,
        private clientCartService: ClientCartService, // Use ClientCartService
        private cartService: CartService, // Still needed for countries, cities, shipments
        private cdr: ChangeDetectorRef,
        public translateService: TranslateService // Injected as public for template access
    ) {}

    ngOnInit(): void {
        this.fetchCartData(); // Fetch cart items from ClientCartService
        this.fetchCountries();
        this.fetchCitiess();
        this.fetchShipment();
        const savedCheckoutData = localStorage.getItem('checkoutData');
        if (savedCheckoutData) {
            const checkoutData = JSON.parse(savedCheckoutData);
            this.selectedCountry = checkoutData.country_id || '';
            this.name = checkoutData.name || '';
            this.email = checkoutData.email || '';
            this.phone = checkoutData.phone || '';
            this.address = checkoutData.address || '';
            this.notes = checkoutData.notes || '';

            setTimeout(() => {
                this.onCountryChange();
                setTimeout(() => {
                    this.selectedCity = checkoutData.city_id || '';
                    this.onCityChange();
                }, 500);
            }, 500);
        }
        const savedCoupon = localStorage.getItem('appliedCoupon');
        if (savedCoupon) {
            this.showCoupon(savedCoupon);
        }
        this.translateService.onLangChange.subscribe(() => {
            this.translateData(); // Re-translate data on language change
        });
    }

    showCoupon(code: string) {
        const payload = { code: code };

        this.cartService.showCoupon(payload).subscribe({
            next: (response: any) => {
                this.couponCode = Object.values(response)[0];
                this.successMessage =
                    response.message ||
                    this.translateService.instant('SUCCESS');
                setTimeout(() => {
                    this.successMessage = '';
                }, 1000);
                localStorage.setItem('appliedCoupon', code);
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.handleError(error);
            },
        });
    }

    get totalAmount(): number {
        return (
            this.data?.reduce(
                (sum: number, cart: any) => sum + cart.total_price,
                0
            ) || 0
        );
    }
    fetchCartData() {
        this.clientCartService.client_cart$.subscribe((client_cart) => {
            this.cartItems = client_cart || [];
            this.calculateTotal();
            this.translateData();
        });
    }

    calculateTotal() {
        this.totalPrice = this.cartItems.reduce((acc, cart) => {
            return acc + cart.product.priceAfterDiscount * cart.quantity;
        }, 0);
    }

    fetchCountries() {
        this.cartService.allCountries().subscribe({
            next: (response: any) => {
                this.countries = Object.values(response)[0] as any[];
                this.translateData();
            },
            error: (error: any) => {
                this.handleError(error);
            },
        });
    }

    fetchCitiess() {
        this.cartService.allCities().subscribe({
            next: (response: any) => {
                this.cities = Object.values(response)[0] as any[];
                this.translateData();
            },
            error: (error: any) => {
                this.handleError(error);
            },
        });
    }

    fetchShipment() {
        this.cartService.allShipments().subscribe({
            next: (response: any) => {
                this.shipments = Object.values(response)[0] as any[];
            },
            error: (error: any) => {
                this.handleError(error);
            },
        });
    }

    onCountryChange() {
        this.filteredCities = this.cities.filter(
            (city) => city.country_id == this.selectedCountry
        );
        this.selectedCity = '';
        this.shipmentCost = 0;
    }

    onCityChange() {
        const shipment = this.shipments.find(
            (s) =>
                s.country_id == this.selectedCountry &&
                s.city_id == this.selectedCity
        );
        this.shipmentCost = shipment ? Number(shipment.cost) : 0;
        this.cdr.detectChanges();
    }

    changeQuantity(productId: number, change: number) {
        this.clientCartService.updateQuantity(productId, change);
        this.calculateTotal();
    }

    removeItem(productId: number) {
        const areYouSure = this.translateService.instant('ARE_YOU_SURE');
        const removeItemConfirm = this.translateService.instant(
            'REMOVE_ITEM_CONFIRM'
        );
        const yesRemoveIt = this.translateService.instant('YES_REMOVE_IT');
        const cancel = this.translateService.instant('CANCEL');
        const removed = this.translateService.instant('REMOVED');
        const productRemovedSuccess = this.translateService.instant(
            'PRODUCT_REMOVED_SUCCESS'
        );

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
                popup:
                    this.translateService.currentLang === 'ar'
                        ? 'swal-rtl'
                        : 'swal-ltr',
            },
        }).then((result: any) => {
            if (result.isConfirmed) {
                try {
                    this.clientCartService.removeFromCart(productId);
                    this.clientCartService.refreshCart();

                    Swal.fire({
                        title: removed,
                        text: productRemovedSuccess,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup:
                                this.translateService.currentLang === 'ar'
                                    ? 'swal-rtl'
                                    : 'swal-ltr',
                        },
                    });
                } catch (error) {
                    Swal.fire({
                        title: this.translateService.instant('ERROR'),
                        text: this.translateService.instant('UNEXPECTED_ERROR'),
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup:
                                this.translateService.currentLang === 'ar'
                                    ? 'swal-rtl'
                                    : 'swal-ltr',
                        },
                    });
                }
            }
        });
    }

    clearCart() {
        const areYouSure = this.translateService.instant('ARE_YOU_SURE');
        const clearCartConfirm =
            this.translateService.instant('CLEAR_CART_CONFIRM');
        const yesClearIt = this.translateService.instant('YES_CLEAR_IT');
        const cancel = this.translateService.instant('CANCEL');
        const cleared = this.translateService.instant('CLEAR');
        const cartClearedSuccess = this.translateService.instant(
            'CART_CLEARED_SUCCESS'
        );

        Swal.fire({
            title: areYouSure,
            text: clearCartConfirm,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: yesClearIt,
            cancelButtonText: cancel,
            customClass: {
                popup:
                    this.translateService.currentLang === 'ar'
                        ? 'swal-rtl'
                        : 'swal-ltr',
            },
        }).then((result: any) => {
            if (result.isConfirmed) {
                try {
                    this.clientCartService.clearCart();
                    this.clientCartService.refreshCart();

                    localStorage.removeItem('checkoutData');
                    localStorage.removeItem('totalPriceData');
                    localStorage.removeItem('appliedCoupon');
                    Swal.fire({
                        title: cleared,
                        text: cartClearedSuccess,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup:
                                this.translateService.currentLang === 'ar'
                                    ? 'swal-rtl'
                                    : 'swal-ltr',
                        },
                    });
                } catch (error) {
                    Swal.fire({
                        title: this.translateService.instant('ERROR'),
                        text: this.translateService.instant('UNEXPECTED_ERROR'),
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup:
                                this.translateService.currentLang === 'ar'
                                    ? 'swal-rtl'
                                    : 'swal-ltr',
                        },
                    });
                }
            }
        });
    }

    checkout() {
        const orderItems = {
            orderItems: this.cartItems.map((cart) => ({
                product_id: cart.product.id,
                quantity: cart.quantity,
            })),
            coupon_id: this.couponCode?.id || null,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            country_id: this.selectedCountry,
            city_id: this.selectedCity,
            notes: this.notes,
        };

        const selectedCountryObj = this.countries.find(
            (country) => country.id === +this.selectedCountry
        );
        const selectedCityObj = this.cities.find(
            (city) => city.id === +this.selectedCity
        );

        if (!this.selectedCountry || !this.selectedCity || !this.address) {
            this.errorMessage =
                this.translateService.instant('PLEASE_ADD_ADDRESS');
            setTimeout(() => {
                this.errorMessage = '';
            }, 3000);
            return;
        } else if (!this.name || !this.phone || !this.email) {
            this.errorMessage =
                this.translateService.instant('PLEASE_ADD_DATA');
            setTimeout(() => {
                this.errorMessage = '';
            }, 3000);
            return;
        }

        const totalPriceData = {
            country: selectedCountryObj
                ? selectedCountryObj.translatedName || selectedCountryObj.name
                : 'N/A',
            city: selectedCityObj
                ? selectedCityObj.translatedName || selectedCityObj.name
                : 'N/A',
            coupon: this.couponCode?.code || 'N/A',
            couponName: this.couponCode?.code || 'N/A',
            totalAmount: this.totalPrice,
            shipmentCost: this.shipmentCost,
            discount: this.couponCode?.discount || 0,
            finalPrice: this.finalPrice,
        };

        localStorage.setItem('checkoutData', JSON.stringify(orderItems));
        localStorage.setItem('totalPriceData', JSON.stringify(totalPriceData));

        this.router.navigate(['/checkout']);
    }

    // get finalPrice(): number {
    //     return (
    //         this.totalPrice +
    //         this.shipmentCost -
    //         (this.couponCode?.discount || 0)
    //     );
    // }

    get finalPrice(): number {
        const discountPercentage = this.couponCode?.discount || 0;
        const discountAmount = (this.totalPrice * discountPercentage) / 100;
        return this.totalPrice + this.shipmentCost - discountAmount;
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

    translateData() {
        // Translate countries
        this.countries.forEach((country) => {
            country.translatedName =
                this.translateService.instant(`${country.name}`) ||
                country.name;
        });

        // Translate cities
        this.cities.forEach((city) => {
            city.translatedName =
                this.translateService.instant(`${city.name}`) || city.name;
        });

        // Translate product titles in cart (if needed)
        this.cartItems.forEach((cart) => {
            cart.product.translatedTitle =
                this.translateService.instant(cart.product.title) ||
                cart.product.title;
        });
    }
}

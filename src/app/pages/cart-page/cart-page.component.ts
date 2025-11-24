import { Component, OnInit } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CheckoutService } from '../checkout-page/checkout.service';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-cart-page',
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
    templateUrl: './cart-page.component.html',
    styleUrl: './cart-page.component.scss',
    providers: [CartService],
})
export class CartPageComponent implements OnInit {
    data: any[] = []; // Array of cart items
    countries: any[] = []; // Array of countries
    cities: any[] = []; // Array of cities
    shipments: any[] = []; // Array of shipments
    shipmentCost: number = 0;
    couponCode: any;
    filteredCities: any[] = []; // Array of filtered cities
    selectedCountry: string = ''; // ID of selected country
    selectedCity: string = ''; // ID of selected city
    image = environment.imgUrl + 'products/';
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        public router: Router,
        private cartService: CartService,
        private checkoutService: CheckoutService,
        private cdr: ChangeDetectorRef,
        public translateService: TranslateService // Injected as public for template access
    ) {}

    ngOnInit(): void {
        this.fetchdata();
        this.fetchCountries();
        this.fetchCitiess();
        this.fetchShipment();
        const savedCheckoutData = localStorage.getItem('checkoutData');
        const savedTotalPriceData = localStorage.getItem('totalPriceData');
        if (savedCheckoutData) {
            const checkoutData = JSON.parse(savedCheckoutData);
            this.selectedCountry = checkoutData.country_id || '';

            setTimeout(() => {
                this.onCountryChange();
                setTimeout(() => {
                    this.selectedCity = checkoutData.city_id || '';
                    this.onCityChange();
                }, 500);
            }, 500);
            setTimeout(() => {
                (
                    document.getElementById('address') as HTMLTextAreaElement
                ).value = checkoutData.address || '';
                (
                    document.getElementById('notes') as HTMLTextAreaElement
                ).value = checkoutData.notes || '';
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

    preventNonNumeric(event: KeyboardEvent) {
        if (!/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    }

    fetchdata() {
        this.cartService.index().subscribe({
            next: (response) => {
                this.data = Object.values(response)[0] as any[];
                this.translateData();
            },
            error: (error) => {
                this.handleError(error);
            },
        });
    }

    fetchCountries() {
        this.cartService.allCountries().subscribe({
            next: (response) => {
                this.countries = Object.values(response)[0] as any[];
                this.translateData();
            },
            error: (error) => {
                this.handleError(error);
            },
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

    // get finalPrice(): number {
    //     return (
    //         this.totalAmount +
    //         this.shipmentCost -
    //         (this.couponCode?.discount || 0)
    //     );
    // }
    get finalPrice(): number {
        const discountPercentage = this.couponCode?.discount || 0;
        const discountAmount = (this.totalAmount * discountPercentage) / 100;
        return this.totalAmount + this.shipmentCost - discountAmount;
    }

    fetchCitiess() {
        this.cartService.allCities().subscribe({
            next: (response) => {
                this.cities = Object.values(response)[0] as any[];
                this.translateData();
            },
            error: (error) => {
                this.handleError(error);
            },
        });
    }

    fetchShipment() {
        this.cartService.allShipments().subscribe({
            next: (response) => {
                this.shipments = Object.values(response)[0] as any[];
                this.translateData();
            },
            error: (error) => {
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

    get totalAmount(): number {
        return (
            this.data?.reduce(
                (sum: number, cart: any) => sum + cart.total_price,
                0
            ) || 0
        );
    }

    updateQuantity(cart: any, quantity: number) {
        if (quantity < 1) return;

        const payload = { id: cart.id, quantity: quantity };

        this.cartService.updateQuantity(payload).subscribe({
            next: () => {
                this.fetchdata();
            },
            error: (error) => {
                this.handleError(error);
            },
        });
    }

    deleteCartItem(id: number) {
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
        }).then((result: any) => {
            if (result.isConfirmed) {
                this.cartService.delete(id).subscribe({
                    next: () => {
                        this.data = this.data.filter(
                            (item: any) => item.id !== id
                        );
                        Swal.fire({
                            title: removed,
                            text: productRemovedSuccess,
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        this.cdr.detectChanges();
                    },
                    error: (error) => {
                        this.handleError(error);
                    },
                });
            }
        });
        // }
    }

    checkout() {
        const orderItems = this.data.map((cart: any) => ({
            product_id: cart.product_id,
            quantity: cart.quantity,
        }));

        const selectedCountryObj = this.countries.find(
            (country) => country.id === +this.selectedCountry
        );
        const selectedCityObj = this.cities.find(
            (city) => city.id === +this.selectedCity
        );

        const address = (
            document.getElementById('address') as HTMLTextAreaElement
        )?.value.trim();
        const notes = (
            document.getElementById('notes') as HTMLTextAreaElement
        )?.value.trim();

        if (!this.selectedCountry || !this.selectedCity || !address) {
            this.errorMessage = this.translateService.instant(
                'Please add your address {country, city, address}'
            );
            setTimeout(() => {
                this.errorMessage = '';
            }, 3000);
            return;
        }

        const checkoutData = {
            orderItems: orderItems,
            coupon_id: this.couponCode?.id || null,
            city_id: this.selectedCity,
            country_id: this.selectedCountry,
            address: address,
            notes: notes,
        };

        const totalPriceData = {
            country: selectedCountryObj
                ? selectedCountryObj.translatedName || selectedCountryObj.name
                : 'N/A',
            city: selectedCityObj
                ? selectedCityObj.translatedName || selectedCityObj.name
                : 'N/A',
            coupon: this.couponCode?.code || 'N/A',
            couponName: this.couponCode?.code || 'N/A',
            totalAmount: this.totalAmount,
            shipmentCost: this.shipmentCost,
            discount: this.couponCode?.discount || 0,
            finalPrice: this.finalPrice,
        };

        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        localStorage.setItem('totalPriceData', JSON.stringify(totalPriceData));

        this.router.navigate(['/checkout']);
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
        }).then((result: any) => {
            if (result.isConfirmed) {
                this.cartService.clearCart().subscribe({
                    next: () => {
                        this.fetchdata();
                        localStorage.removeItem('checkoutData');
                        localStorage.removeItem('totalPriceData');
                        localStorage.removeItem('appliedCoupon');
                        localStorage.setItem('cart', JSON.stringify([]));
                        Swal.fire({
                            title: cleared,
                            text: cartClearedSuccess,
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        this.cdr.detectChanges();
                    },
                    error: (error) => {
                        this.handleError(error);
                    },
                });
            }
        });
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
        this.data.forEach((cart) => {
            cart.product.translatedTitle =
                this.translateService.instant(cart.product.title) ||
                cart.product.title;
        });
    }
}

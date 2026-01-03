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
import { CartService } from './cart.service';

@Component({
    selector: 'app-client-cart-page',

    standalone: true,
    imports: [NavbarComponent, PageBannerComponent, FooterComponent, BackToTopComponent, RouterLink, CommonModule, FormsModule, TranslateModule,],
    templateUrl: './client-cart-page.component.html',
    styleUrl: './client-cart-page.component.scss',
    providers: [CartService],
})
export class ClientCartPageComponent implements OnInit {
    cartItems: any[] = []; // Array of cart items (from ClientCartService)
    countries: any[] = []; // Array of countries
    filteredCities: any[] = []; // Array of filtered cities
    selectedCountry: string = ''; // ID of selected country
    selectedCity: string = ''; // ID of selected city
    selectedShipmentId: number = 0; // ID of selected shipment
    image = environment.imgUrl;
    successMessage: string = '';
    errorMessage: string = '';
    totalPrice: number = 0; // Total price calculated client-side
    name: string = ''; // Customer name
    email: string = ''; // Customer email
    phone: string = ''; // Customer phone
    address: string = ''; // Customer address
    paymentMethod: string = 'cash_on_delivery'; // Payment method - always cash
    couponCode: string = ''; // Coupon code
    shipmentCost: number = 0;
    isFirstOrder: boolean = false; // Track if it's a first order
    automaticCoupon: any = null; // Store automatic coupon for first order
    automaticDiscount: number = 0; // Store automatic discount amount

    constructor(
        public router: Router,
        private cartService: CartService,
        private cdr: ChangeDetectorRef,
        public translateService: TranslateService
    ) { }

    ngOnInit(): void {
        this.fetchCartData();
        this.fetchCountries();
        this.loadSavedData();
        this.translateService.onLangChange.subscribe(() => {
            this.fetchCountries(); // Re-fetch data with new language
        });
    }

    loadSavedData() {
        const savedData = localStorage.getItem('checkoutData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.name = data.name || '';
            this.email = data.email || '';
            this.phone = data.phone || '';
            this.address = data.address || '';
            this.selectedCountry = data.country_id || '';
            this.selectedCity = data.city_id || '';
            this.couponCode = data.coupon_code || '';

            if (this.selectedCountry) {
                setTimeout(() => {
                    this.onCountryChange();
                    if (this.selectedCity) {
                        setTimeout(() => {
                            this.onCityChange();
                        }, 300);
                    }
                }, 300);
            }
        }
    }

    fetchCartData() {
        this.cartService.cart$.subscribe((cart) => {
            this.cartItems = cart || [];
            this.calculateTotal();
            this.translateData();
        });
    }

    calculateTotal() {
        this.totalPrice = this.cartItems.reduce((acc, cart) => {
            return acc + cart.product.price_after_discount * cart.quantity;
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

    onCountryChange() {
        const country = this.countries.find(c => c.id == this.selectedCountry);
        this.filteredCities = country ? country.cities : [];
        this.selectedCity = '';
        this.shipmentCost = 0;
        this.selectedShipmentId = 0;
        this.saveFormData();
        this.cdr.detectChanges();
    }

    onCityChange() {
        if (!this.selectedCity || !this.selectedCountry) {
            this.shipmentCost = 0;
            this.selectedShipmentId = 0;
            return;
        }
        
        const selectedCityObj = this.filteredCities.find(city => city.id == this.selectedCity);
        
        if (selectedCityObj?.shipment) {
            this.shipmentCost = Number(selectedCityObj.shipment.cost) || 0;
            this.selectedShipmentId = selectedCityObj.shipment.id;
        } else {
            this.shipmentCost = 0;
            this.selectedShipmentId = 0;
        }
        
        this.saveFormData();
        this.cdr.detectChanges();
    }

    saveFormData() {
        const formData = {
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            country_id: this.selectedCountry,
            city_id: this.selectedCity,
            coupon_code: this.couponCode
        };
        localStorage.setItem('checkoutData', JSON.stringify(formData));
    }

    checkPhoneForFirstOrder() {
        if (!this.phone || this.phone.trim() === '') {
            this.errorMessage = this.translateService.instant('PHONE_REQUIRED');
            setTimeout(() => { this.errorMessage = ''; }, 2000);
            return;
        }

        this.cartService.checkFirstOrder(this.phone).subscribe({
            next: (response: any) => {
                const data = Object.values(response)[0] as any;
                this.isFirstOrder = data.is_first_order;
                
                if (this.isFirstOrder && data.coupon) {
                    this.automaticCoupon = data.coupon;
                    // Calculate discount based on coupon type
                    this.calculateAutomaticDiscount();
                    this.successMessage = this.translateService.instant('FIRST_ORDER_COUPON_AVAILABLE');
                    setTimeout(() => { this.successMessage = ''; }, 3000);
                } else if (this.isFirstOrder && !data.coupon) {
                    this.automaticCoupon = null;
                    this.automaticDiscount = 0;
                    this.successMessage = this.translateService.instant('FIRST_ORDER_NO_COUPON');
                    setTimeout(() => { this.successMessage = ''; }, 3000);
                } else {
                    this.automaticCoupon = null;
                    this.automaticDiscount = 0;
                    this.successMessage = this.translateService.instant('NOT_FIRST_ORDER');
                    setTimeout(() => { this.successMessage = ''; }, 3000);
                }
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.isFirstOrder = false;
                this.automaticCoupon = null;
                this.automaticDiscount = 0;
                this.errorMessage = this.translateService.instant('ERROR_CHECKING_PHONE');
                setTimeout(() => { this.errorMessage = ''; }, 2000);
            }
        });
    }

    calculateAutomaticDiscount() {
        if (!this.automaticCoupon) {
            this.automaticDiscount = 0;
            return;
        }

        const coupon = this.automaticCoupon;
        let discount = 0;

        if (coupon.type === 'percentage') {
            discount = (this.totalPrice * coupon.value) / 100;
            // Apply max discount limit if exists
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else if (coupon.type === 'fixed') {
            discount = coupon.value;
        }

        // Check minimum order amount
        if (coupon.min_order_amount && this.totalPrice < coupon.min_order_amount) {
            discount = 0;
        }

        this.automaticDiscount = discount;
    }

    onImageError(event: any) {
        event.target.src = 'assets/images/logo.svg';
    }

    changeQuantity(productId: number, change: number) {
        this.cartService.updateQuantity(productId, change);
        this.calculateTotal();
    }

    removeItem(productId: number) {
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
            customClass: { popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr', },
        }).then((result: any) => {
            if (result.isConfirmed) {
                try {
                    this.cartService.removeFromCart(productId);
                    this.cartService.refreshCart();

                    Swal.fire({
                        title: removed,
                        text: productRemovedSuccess,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: { popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr', },
                    });
                } catch (error) {
                    Swal.fire({
                        title: this.translateService.instant('ERROR'),
                        text: this.translateService.instant('UNEXPECTED_ERROR'),
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: { popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr', },
                    });
                }
            }
        });
    }

    clearCart() {
        const areYouSure = this.translateService.instant('ARE_YOU_SURE');
        const cancel = this.translateService.instant('CANCEL');
        const clearCartConfirm = this.translateService.instant('CLEAR_CART_CONFIRM');
        const yesClearIt = this.translateService.instant('YES_CLEAR_IT');
        const cleared = this.translateService.instant('CLEAR');
        const cartClearedSuccess = this.translateService.instant('CART_CLEARED_SUCCESS');
        Swal.fire({
            title: areYouSure,
            text: clearCartConfirm,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: yesClearIt,
            cancelButtonText: cancel,
            customClass: { popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr', },
        }).then((result: any) => {
            if (result.isConfirmed) {
                try {
                    this.cartService.clearCart();
                    this.cartService.refreshCart();

                    localStorage.removeItem('checkoutData');
                    Swal.fire({
                        title: cleared,
                        text: cartClearedSuccess,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: { popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr', },
                    });
                } catch (error) {
                    Swal.fire({
                        title: this.translateService.instant('ERROR'),
                        text: this.translateService.instant('UNEXPECTED_ERROR'),
                        icon: 'error',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: { popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr', },
                    });
                }
            }
        });
    }

    checkout() {
        // Validation
        if (!this.name || !this.phone || !this.address) {
            this.errorMessage = this.translateService.instant('PLEASE_ADD_DATA');
            setTimeout(() => { this.errorMessage = ''; }, 3000);
            return;
        }

        if (!this.selectedCountry || !this.selectedCity || !this.selectedShipmentId) {
            this.errorMessage = this.translateService.instant('PLEASE_SELECT_LOCATION');
            setTimeout(() => { this.errorMessage = ''; }, 3000);
            return;
        }

        if (this.cartItems.length === 0) {
            this.errorMessage = this.translateService.instant('CART_IS_EMPTY');
            setTimeout(() => { this.errorMessage = ''; }, 3000);
            return;
        }

        // Prepare order data according to backend API
        const orderData = {
            name: this.name,
            phone: this.phone,
            email: this.email || null,
            address: this.address,
            shipment_id: this.selectedShipmentId,
            coupon_code: this.couponCode || null,
            payment_method: this.paymentMethod,
            items: this.cartItems.map(cart => ({
                product_id: cart.product.id,
                quantity: cart.quantity
            }))
        };

        // Create order
        this.cartService.createOrder(orderData).subscribe({
            next: (response: any) => {
                this.successMessage = this.translateService.instant('ORDER_CREATED_SUCCESS');
                
                // Clear cart and saved data
                this.cartService.clearCart();
                localStorage.removeItem('checkoutData');
                
                // Show success message
                Swal.fire({
                    title: this.translateService.instant('SUCCESS'),
                    text: this.translateService.instant('ORDER_CREATED_SUCCESS'),
                    icon: 'success',
                    confirmButtonText: this.translateService.instant('OK'),
                    customClass: { 
                        popup: this.translateService.currentLang === 'ar' ? 'swal-rtl' : 'swal-ltr' 
                    },
                }).then(() => {
                    this.router.navigate(['/']);
                });
            },
            error: (error) => {
                this.handleError(error);
            }
        });
    }


    get finalPrice(): number {
        return this.totalPrice + this.shipmentCost;
    }

    private handleError(error: any) {
        if (error.error?.errors) {
            this.errorMessage = Object.values(error.error.errors).flat().join(' | ');
        } else {
            this.errorMessage = error.error?.message || this.translateService.instant('UNEXPECTED_ERROR');
        }
        setTimeout(() => { this.errorMessage = ''; }, 3000);
    }

    translateData() {
        // Translate countries
        this.countries.forEach((country) => {
            const countryName = country.title || country.name;
            country.translatedName = this.translateService.instant(`${countryName}`) || countryName;

            if (country.cities) {
                country.cities.forEach((city: any) => {
                    const cityName = city.title || city.name;
                    city.translatedName = this.translateService.instant(`${cityName}`) || cityName;
                });
            }
        });

        // Translate product titles in cart
        this.cartItems.forEach((cart) => {
            cart.product.translatedTitle = this.translateService.instant(cart.product.title) || cart.product.title;
        });
    }
}

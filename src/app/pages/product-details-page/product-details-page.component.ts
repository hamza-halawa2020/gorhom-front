import { RatingModule } from 'ngx-bootstrap/rating';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { ContactComponent } from '../../common/contact/contact.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { ProductService } from './product.service';
import { CartService } from '../cart-page/cart.service';
import { FavouriteClientService } from '../favorites-page/favourite-client.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { FavoritesService } from '../favorites-page/favorites.service';

declare var bootstrap: any;

@Component({
    selector: 'app-product-details-page',
    standalone: true,
    imports: [
        RouterLink,
        NavbarComponent,
        PageBannerComponent,
        ContactComponent,
        FooterComponent,
        BackToTopComponent,
        HttpClientModule,
        CommonModule,
        NgIf,
        NgClass,
        RatingModule,
        FormsModule,
        TranslateModule,
        CarouselModule, // Add CarouselModule
    ],
    templateUrl: './product-details-page.component.html',
    styleUrls: ['./product-details-page.component.scss'],
})
export class ProductDetailsPageComponent implements OnInit, OnDestroy {
    activeTab: string = 'overview';
    name: string = '';
    email: string = '';
    phone: string = '';
    newReview: string = '';
    newRate: number = 0;
    details: any = null;
    isLoggedIn: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';
    id: any;
    image = environment.imgUrl;
    instructorImage = environment.imgUrl;
    socialImage = environment.imgUrl;
    selectedImage: string = '';
    currentIndex: number = 0;
    modalSelectedImage: string = '';
    modalCurrentIndex: number = 0;
    peopleViewing: number = 22;
    private viewingInterval: any;
    private autoSlideInterval: any;
    allImages: { path: string; isMainImage: boolean }[] = []; // Array to hold all images including main image
    isFavorite: boolean = false; // Track if current product is in favorites

    get hasImages(): boolean {
        return this.allImages && this.allImages.length > 0;
    }

    get totalImages(): number {
        return this.allImages ? this.allImages.length : 0;
    }

    // Related products carousel options
    relatedProductsOptions: OwlOptions;
    relatedProductsOptionsAr: OwlOptions = {
        nav: true,
        loop: true,
        margin: 25,
        dots: false,
        autoplay: true,
        smartSpeed: 500,
        rtl: true,
        autoplayHoverPause: true,
        navText: [
            "<i class='fa-solid fa-chevron-left'></i>",
            "<i class='fa-solid fa-chevron-right'></i>",
        ],
        responsive: {
            0: {
                items: 1,
            },
            515: {
                items: 1,
            },
            695: {
                items: 2,
            },
            935: {
                items: 3,
            },
            1115: {
                items: 3,
            },
        },
    };
    relatedProductsOptionsEn: OwlOptions = {
        nav: true,
        loop: true,
        margin: 25,
        dots: false,
        autoplay: true,
        smartSpeed: 500,
        autoplayHoverPause: true,
        navText: [
            "<i class='fa-solid fa-chevron-left'></i>",
            "<i class='fa-solid fa-chevron-right'></i>",
        ],
        responsive: {
            0: {
                items: 1,
            },
            515: {
                items: 1,
            },
            695: {
                items: 2,
            },
            935: {
                items: 3,
            },
            1115: {
                items: 3,
            },
        },
    };

    // Zoom effect properties
    showZoom: boolean = false;
    zoomPosition: { x: number; y: number } = { x: 0, y: 0 };
    zoomBackgroundPosition: string = '0px 0px';

    productUrl: string = '';

    constructor(
        private activateRoute: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private favClientService: FavouriteClientService,
        private cdr: ChangeDetectorRef,
        public translateService: TranslateService,
        private favoritesService: FavoritesService
    ) {
        this.relatedProductsOptions =
            this.translateService.currentLang === 'ar'
                ? this.relatedProductsOptionsAr
                : this.relatedProductsOptionsEn;
    }

    ngOnInit(): void {
        this.getDetails();
        this.translateService.onLangChange.subscribe((event) => {
            this.relatedProductsOptions =
                event.lang === 'ar'
                    ? this.relatedProductsOptionsAr
                    : this.relatedProductsOptionsEn;
            this.getDetails(); // Re-fetch data with new language
        });
        this.startViewingUpdate();
        this.startAutoSlide();
        this.productUrl = window.location.href;
        this.setupKeyboardNavigation();
    }

    ngOnDestroy(): void {
        if (this.viewingInterval) clearTimeout(this.viewingInterval);
        if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    }

    startViewingUpdate(): void {
        // Define a function to update the number of people viewing and schedule the next update
        const updateViewing = () => {
            // Generate a random number between 30 and 49 (Math.random() * 20 generates 0-19, then add 30)
            this.peopleViewing = Math.floor(Math.random() * 20) + 30;

            // Generate a random interval between 50,000 and 59,999 milliseconds (50 to ~60 seconds)
            const randomInterval = Math.floor(Math.random() * 10000) + 50000;

            // Schedule the next update using setTimeout with the random interval
            this.viewingInterval = setTimeout(updateViewing, randomInterval);
        };

        // Start the first update immediately
        updateViewing();
    }

    startAutoSlide(): void {
        this.autoSlideInterval = setInterval(() => {
            this.nextImage();
        }, 5000);
    }

    stopAutoSlide(): void {
        if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    }

    restartAutoSlide(): void {
        this.stopAutoSlide();
        this.startAutoSlide();
    }

    getDetails(): void {
        this.activateRoute.params.subscribe((params) => {
            this.id = +params['id'];
            this.productService.show(this.id).subscribe((data) => {
                this.details = Object.values(data)[0];
                this.translateData();
                this.setupImageGallery();
                this.checkIfFavorite(); // Check if product is already in favorites
                this.cdr.detectChanges();
            });
        });
    }

    setupImageGallery(): void {
        this.allImages = [];

        // Add main product image first if it exists
        if (this.details?.image) {
            this.allImages.push({
                path: this.details.image,
                isMainImage: true
            });
        }

        // Add additional images from files array
        if (this.details?.files?.length > 0) {
            this.details.files.forEach((file: any) => {
                this.allImages.push({
                    path: file.path,
                    isMainImage: false
                });
            });
        }

        // Set the first image as selected
        if (this.allImages.length > 0) {
            this.selectedImage = this.image + this.allImages[0].path;
            this.modalSelectedImage = this.selectedImage;
            this.currentIndex = 0;
            this.modalCurrentIndex = 0;
        } else {
            // Ultimate fallback
            this.selectedImage = 'assets/images/fallback-image.jpg';
            this.modalSelectedImage = this.selectedImage;
        }


    }

    translateData(): void {
        if (!this.details) return;
        this.details.translatedName =
            this.translateService.instant(this.details.title) ||
            this.details.title;
        this.details.translatedDescription =
            this.translateService.instant(this.details.description) ||
            this.details.description;

        if (this.details.relatedProducts) {
            this.details.relatedProducts.forEach((product: any) => {
                product.translatedName =
                    this.translateService.instant(product.title) ||
                    product.title;
            });
        }
        this.cdr.detectChanges();
    }

    selectImage(imageUrl: string, index: number): void {
        this.selectedImage = imageUrl;
        this.currentIndex = index;
        this.stopAutoSlide();
        setTimeout(() => this.restartAutoSlide(), 10000);
    }

    prevImage(): void {
        if (this.hasImages && this.currentIndex > 0) {
            this.currentIndex--;
            this.selectedImage = this.image + this.allImages[this.currentIndex].path;
            this.stopAutoSlide();
            setTimeout(() => this.restartAutoSlide(), 10000);
        }
    }

    nextImage(): void {
        if (this.hasImages) {
            if (this.currentIndex < this.totalImages - 1) {
                this.currentIndex++;
            } else {
                this.currentIndex = 0;
            }
            this.selectedImage = this.image + this.allImages[this.currentIndex].path;
        }
    }

    prevModalImage(): void {
        if (this.hasImages && this.modalCurrentIndex > 0) {
            this.modalCurrentIndex--;
            this.modalSelectedImage = this.image + this.allImages[this.modalCurrentIndex].path;
        }
    }

    nextModalImage(): void {
        if (this.hasImages && this.modalCurrentIndex < this.totalImages - 1) {
            this.modalCurrentIndex++;
            this.modalSelectedImage = this.image + this.allImages[this.modalCurrentIndex].path;
        }
    }

    openModal(): void {
        this.modalSelectedImage = this.selectedImage;
        this.modalCurrentIndex = this.currentIndex;
        let modal = new bootstrap.Modal(document.getElementById('imageModal'));
        modal.show();
    }

    selectModalImage(index: number): void {
        this.modalCurrentIndex = index;
        this.modalSelectedImage = this.image + this.allImages[index].path;
    }

    setupKeyboardNavigation(): void {
        document.addEventListener('keydown', (event) => {
            const modal = document.getElementById('imageModal');
            if (modal && modal.classList.contains('show')) {
                switch (event.key) {
                    case 'ArrowLeft':
                        event.preventDefault();
                        this.prevModalImage();
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        this.nextModalImage();
                        break;
                    case 'Escape':
                        event.preventDefault();
                        const modalInstance = bootstrap.Modal.getInstance(modal);
                        if (modalInstance) {
                            modalInstance.hide();
                        }
                        break;
                }
            }
        });
    }



    checkIfFavorite(): void {
        if (this.details?.id) {
            this.isFavorite = this.favoritesService.isInFavorites(this.details.id);
        }
    }

    toggleFavorite(): void {
        if (!this.details) {
            this.errorMessage = this.translateService.instant('PRODUCT_NOT_FOUND');
            setTimeout(() => { this.errorMessage = ''; }, 2000);
            return;
        }

        const wasInFavorites = this.isFavorite;
        const success = this.favoritesService.toggleFavorite(this.details);

        if (success) {
            this.isFavorite = !wasInFavorites;

            if (this.isFavorite) {
                this.successMessage = this.translateService.instant('Product added to favorites!');
            } else {
                this.successMessage = this.translateService.instant('Product removed from favorites!');
            }

            setTimeout(() => { this.successMessage = ''; }, 2000);
        } else {
            this.errorMessage = this.translateService.instant('Error updating favorites');
            setTimeout(() => { this.errorMessage = ''; }, 2000);
        }
    }

    getFavoritesCount(): number {
        return this.favoritesService.getFavoritesCount();
    }

    onMouseMove(event: MouseEvent): void {
        const img = event.target as HTMLImageElement;
        const rect = img.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            this.showZoom = true;

            const lensSize = 150;
            const zoomLevel = 3;

            let lensX = x - lensSize / 2;
            let lensY = y - lensSize / 2;

            lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
            lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

            this.zoomPosition = { x: lensX, y: lensY };

            const zoomX = (x / rect.width) * 100;
            const zoomY = (y / rect.height) * 100;

            this.zoomBackgroundPosition = `${zoomX}% ${zoomY}%`;
        } else {
            this.showZoom = false;
        }
    }

    onMouseLeave(): void {
        this.showZoom = false;
    }

    shareOnFacebook(): void {
        const url = encodeURIComponent(this.productUrl);
        const title = encodeURIComponent(
            this.details?.translatedName ||
            this.details?.title ||
            'Check out this product!'
        );
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}&title=${title}`,
            '_blank'
        );
    }

    shareOnTwitter(): void {
        const url = encodeURIComponent(this.productUrl);
        const text = encodeURIComponent(
            `Check out this product: ${this.details?.translatedName || this.details?.title || ''
            }`
        );
        window.open(
            `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            '_blank'
        );
    }

    shareOnWhatsApp(): void {
        const url = encodeURIComponent(this.productUrl);
        const text = encodeURIComponent(
            `Check out this product: ${this.details?.translatedName || this.details?.title || ''
            } - ${this.details?.translatedDescription || ''}`
        );
        window.open(
            `https://api.whatsapp.com/send?text=${text}%20${url}`,
            '_blank'
        );
    }

    addToClientCart(product: any): void {
        this.addToCart(product.id, product);
    }

    addToCart(product_id: any, productObj?: any): void {
        const product = productObj || this.details;

        if (!product) {
            this.errorMessage = this.translateService.instant('PRODUCT_NOT_FOUND');
            setTimeout(() => { this.errorMessage = ''; }, 1000);
            return;
        }

        const success = this.cartService.addToCart(product);
        if (this.cartService.isInCart(product.id)) {
            this.successMessage = this.translateService.instant(
                'Product added to cart successfully!'
            );
        } else {
            this.successMessage = this.translateService.instant(
                'Product added to cart successfully!'
            );
        }
        setTimeout(() => (this.successMessage = ''), 1000);
    }

    addToFavourite(product_id: any): void {
        this.toggleFavorite();
    }

    addReview(reviewText: string, rating: number): void {
        if (!reviewText || reviewText.trim() === '') {
            this.errorMessage = this.translateService.instant(
                'Review cannot be empty!'
            );
            setTimeout(() => (this.errorMessage = ''), 1000);
            return;
        }

        const reviewData = {
            product_id: this.id,
            review: reviewText,
            rating: rating || 0,
        };

        this.productService.addReview(reviewData).subscribe({
            next: (response) => {
                this.getDetails();
                if (this.details.reviews) {
                    this.details.reviews.unshift(response);
                }
                this.successMessage = this.translateService.instant(
                    'Review added successfully but it is under review!'
                );
                setTimeout(() => (this.successMessage = ''), 3000);
                this.newReview = '';
                this.newRate = 0;
            },
            error: (error) => {
                this.errorMessage =
                    error.error?.message ||
                    this.translateService.instant('UNEXPECTED_ERROR');
                setTimeout(() => (this.errorMessage = ''), 1000);
            },
        });
    }

    addClientReview(
        reviewText: string,
        rating: number,
        nameText: string,
        emailText: string,
        phoneText: string
    ): void {
        if (!reviewText || reviewText.trim() === '') {
            this.errorMessage = this.translateService.instant(
                'Review cannot be empty!'
            );
            setTimeout(() => (this.errorMessage = ''), 1000);
            return;
        }

        const reviewData = {
            product_id: this.id,
            review: reviewText,
            rating: rating || 0,
            name: nameText,
            email: emailText,
            phone: phoneText,
        };

        this.productService.addClientReview(reviewData).subscribe({
            next: (response) => {
                this.getDetails();
                if (this.details.reviews) {
                    this.details.reviews.unshift(response);
                }
                this.successMessage = this.translateService.instant(
                    'Review added successfully but it is under review!'
                );
                setTimeout(() => (this.successMessage = ''), 3000);
                this.newReview = '';
                this.newRate = 0;
            },
            error: (error) => {
                this.errorMessage =
                    error.error?.message ||
                    this.translateService.instant('UNEXPECTED_ERROR');
                setTimeout(() => (this.errorMessage = ''), 1000);
            },
        });
    }

    addToClientFavourite(product: any): void {
        this.toggleFavorite();
    }

    onImageLoad(imageUrl: string): void {
    }

    onImageError(event: Event): void {
        console.error(
            'Image failed to load:',
            (event.target as HTMLImageElement).src
        );
        (event.target as HTMLImageElement).src =
            'assets/images/logo.svg';
    }

    addRelatedToCart(product: any, event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        this.cartService.addToCart(product);
        this.successMessage = this.translateService.instant('Product added to cart successfully!');
        setTimeout(() => { this.successMessage = ''; }, 1000);
    }

    isRelatedProductInCart(productId: number): boolean {
        return this.cartService.isInCart(productId);
    }

    isProductInCart(productId: number): boolean {
        return this.cartService.isInCart(productId);
    }

    addRelatedToFavorite(product: any, event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        const success = this.favoritesService.toggleFavorite(product);
        if (success) {
            const isInFavorites = this.favoritesService.isInFavorites(product.id);
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

    isRelatedProductInFavorites(productId: number): boolean {
        return this.favoritesService.isInFavorites(productId);
    }
}

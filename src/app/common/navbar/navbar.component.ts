import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LoginService } from '../../pages/login-page/login.service';
import { CartService } from '../../pages/cart-page/cart.service';
import { Subscription } from 'rxjs';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientCartService } from '../../pages/client-cart/client-cart.service';
import { FavouriteClientService } from '../../pages/favourite-client-page/favourite-client.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FavoritesService } from '../../services/favorites.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        NgIf,
        NgClass,
        NgbCollapseModule,
        TranslateModule,
    ],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
    isCollapsed = true;
    cartData: any[] = [];
    cartClientData: any[] = [];
    favClientData: any[] = [];
    favData: any[] = [];
    favoritesCount: number = 0; // New favorites count from FavoritesService
    EMAIL: string = 'info@gorhom.net';
    public cartSubscription!: Subscription;
    public cartClientSubscription!: Subscription;
    public favSubscription!: Subscription;
    public favClientSubscription!: Subscription;
    public favoritesSubscription!: Subscription; // New subscription for FavoritesService

    isLoggedIn: boolean = false;
    isSticky: boolean = false;
    currentLanguage: string = 'en'; // Track current language

    constructor(
        public router: Router,
        public loginService: LoginService,
        private cartService: CartService,
        private cartClientService: ClientCartService,
        private favouriteClientService: FavouriteClientService,
        private translate: TranslateService,
        private favoritesService: FavoritesService
    ) {
        this.isLoggedIn = !!loginService.isLoggedIn();

        // Initialize languages
        this.translate.addLangs(['en', 'ar']);
        this.translate.setDefaultLang('en');

        // Load saved language from localStorage or use browser language
        const savedLang = localStorage.getItem('language');
        const browserLang = this.translate.getBrowserLang();
        const initialLang =
            savedLang || (browserLang?.match(/en|ar/) ? browserLang : 'en');
        this.translate.use(initialLang);
        this.currentLanguage = initialLang;
        this.applyLanguageDirection(initialLang);
    }

    ngOnInit(): void {
        this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
            this.cartData = cart;
        });

        this.cartClientSubscription = this.cartClientService.cart$.subscribe(
            (cart) => {
                this.cartClientData = cart;
            }
        );

        // this.favSubscription = this.favouriteService.fav$.subscribe((fav) => {
        //     this.favData = fav;
        // });

        this.favClientSubscription = this.favouriteClientService.fav$.subscribe(
            (favClient) => {
                this.favClientData = favClient;
            }
        );

        // Subscribe to the new FavoritesService for favorites count
        this.favoritesSubscription = this.favoritesService.favorites$.subscribe(
            (favorites) => {
                this.favoritesCount = favorites.length;
            }
        );

        this.router.events.subscribe(() => {
            this.cartService.refreshCart();
            this.cartClientService.refreshCart();
        });

        this.router.events.subscribe(() => {
            // this.favouriteService.refreshFav();
            this.favouriteClientService.refreshFav();
        });

        // Update currentLanguage when language changes
        this.translate.onLangChange.subscribe((event) => {
            this.currentLanguage = event.lang;
            this.applyLanguageDirection(event.lang);
        });
    }

    ngOnDestroy() {
        if (this.cartSubscription) this.cartSubscription.unsubscribe();
        if (this.cartClientSubscription)
            this.cartClientSubscription.unsubscribe();
        if (this.favSubscription) this.favSubscription.unsubscribe();
        if (this.favClientSubscription)
            this.favClientSubscription.unsubscribe();
        if (this.favoritesSubscription)
            this.favoritesSubscription.unsubscribe();
    }

    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    logout() {
        this.loginService.logout();
        this.isLoggedIn = false; // Update isLoggedIn after logout
    }

    switchLanguage(lang: string) {
        this.translate.use(lang);
        this.currentLanguage = lang;
        this.applyLanguageDirection(lang);
        localStorage.setItem('language', lang); // Save to localStorage
    }

    getCurrentLanguage(): string {
        return this.currentLanguage || this.translate.getDefaultLang();
    }

    // Helper method to apply language direction
    private applyLanguageDirection(lang: string) {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }
}
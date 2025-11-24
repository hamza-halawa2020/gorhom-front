import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { FeedBackService } from './feed-back.service';
import { formatDistanceToNow } from 'date-fns';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ar } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-feedback',
    standalone: true,
    imports: [
        RouterLink,
        CarouselModule,
        CommonModule,
        NgIf,
        NgClass,
        TranslateModule,
        HttpClientModule,
    ],
    templateUrl: './feedback.component.html',
    styleUrl: './feedback.component.scss',
    providers: [FeedBackService],
})
export class FeedbackComponent implements OnInit, OnDestroy {
    sliderData: any[] = [];
    groupedSliderData: any[][] = [];
    productImage = environment.imgUrl + 'products/';
    currentOptions: OwlOptions;
    private destroy$ = new Subject<void>();
    private itemsPerSlide: number = 3; // Default: 3 items for large screens

    feedbackSlides: OwlOptions = {
        nav: false,
        loop: true,
        margin: 25,
        dots: false,
        autoplay: true,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1, // 1 item for small screens
                autoHeight: false,
            },
            // 768: {
            //     items: 2, // 2 items for medium screens
            //     autoHeight: false,
            // },
            // 992: {
            //     items: 3, // 3 items max for large screens
            //     autoHeight: false,
            // },
        },
        navText: [
            "<i class='fa-solid fa-chevron-left'></i>",
            "<i class='fa-solid fa-chevron-right'></i>",
        ],
    };
    feedbackSlides2: OwlOptions = {
        nav: false,
        loop: true,
        margin: 25,
        rtl: true,
        dots: false,
        autoplay: true,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
                autoHeight: false,
            },
            // 768: {
            //     items: 2,
            //     autoHeight: false,
            // },
            // 992: {
            //     items: 3, // 3 items max for large screens
            //     autoHeight: false,
            // },
        },
        navText: [
            "<i class='fa-solid fa-arrow-left'></i>",
            "<i class='fa-solid fa-arrow-right'></i>",
        ],
    };

    constructor(
        public router: Router,
        private feedBackService: FeedBackService,
        private translate: TranslateService,
        private breakpointObserver: BreakpointObserver
    ) {
        this.currentOptions =
            this.translate.currentLang === 'ar'
                ? this.feedbackSlides2
                : this.feedbackSlides;
        this.translate.onLangChange.subscribe((event) => {
            this.currentOptions =
                event.lang === 'ar'
                    ? this.feedbackSlides2
                    : this.feedbackSlides;
        });
    }

    ngOnInit(): void {
        this.fetchSliderData();
        this.observeBreakpoints();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    fetchSliderData() {
        this.feedBackService.index().subscribe({
            next: (response) => {
                this.sliderData = Object.values(response)[0];
                this.groupSliderData();
            },
            error: (error) => {},
        });
    }

    observeBreakpoints() {
        this.breakpointObserver
            .observe([
                Breakpoints.XSmall,
                Breakpoints.Small,
                Breakpoints.Medium,
                Breakpoints.Large,
                Breakpoints.XLarge,
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                if (
                    result.breakpoints[Breakpoints.XSmall] ||
                    result.breakpoints[Breakpoints.Small]
                ) {
                    this.itemsPerSlide = 1; // 1 item for <768px
                } else if (result.breakpoints[Breakpoints.Medium]) {
                    this.itemsPerSlide = 2; // 2 items for 768px-991px
                } else {
                    this.itemsPerSlide = 3; // Max 3 items for ≥992px
                }
                this.groupSliderData();
            });
    }

    groupSliderData() {
        this.groupedSliderData = [];
        for (let i = 0; i < this.sliderData.length; i += this.itemsPerSlide) {
            this.groupedSliderData.push(
                this.sliderData.slice(i, i + this.itemsPerSlide)
            );
        }
    }

    getStars(rating: number): boolean[] {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating);
        }
        return stars;
    }

    getRelativeTime(dateString: string): string {
        const date = new Date(dateString);
        const locale = this.translate.currentLang === 'ar' ? ar : enUS;
        return formatDistanceToNow(date, { addSuffix: true, locale });
    }
}

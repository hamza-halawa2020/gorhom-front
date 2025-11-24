import { RouterLink, Router } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FaqsService } from './faqs.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-faqs',
    standalone: true,
    imports: [
        RouterLink,
        CarouselModule,
        CommonModule,
        NgIf,
        NgClass,
        NgbModule,
        HttpClientModule,
        TranslateModule, // Added TranslateModule
    ],
    templateUrl: './faqs.component.html',
    styleUrl: './faqs.component.scss',
    providers: [FaqsService],
})
export class FaqsComponent implements OnInit {
    data: any[] = []; // Explicitly typed as an array
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private faqsService: FaqsService,
        public translateService: TranslateService // Injected TranslateService
    ) {}

    ngOnInit(): void {
        this.fetchSliderData();
        this.translateService.onLangChange.subscribe(() => {
            this.translateData();
        });
    }

    fetchSliderData() {
        this.faqsService.index().subscribe({
            next: (response) => {
                this.data = Object.values(response)[0] as any[];
                this.translateData();
            },
            error: (error) => {
                this.errorMessage = this.translateService.instant('UNEXPECTED_ERROR');
                setTimeout(() => {
                    this.errorMessage = '';
                }, 3000);
            },
        });
    }

    translateData() {
        if (!this.data || !Array.isArray(this.data)) return;

        this.data.forEach((faq: any) => {
            faq.translatedQuestion = this.translateService.instant(faq.question) || faq.question;
            faq.translatedAnswer = this.translateService.instant(faq.answer) || faq.answer;
        });
    }
}
import { Component, OnInit } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { AboutComponent } from '../../common/about/about.component';
import { ContactComponent } from '../../common/contact/contact.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FaqsComponent } from '../../common/faqs/faqs.component';
import * as bootstrap from 'bootstrap';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-about-page',
    standalone: true,
    imports: [
        NavbarComponent,
        PageBannerComponent,
        AboutComponent,
        ContactComponent,
        FooterComponent,
        BackToTopComponent,
        FaqsComponent,
        TranslateModule,
    ],
    templateUrl: './about-page.component.html',
    styleUrls: ['./about-page.component.scss'],
})
export class AboutPageComponent implements OnInit {
    ngOnInit(): void {
        const carousel = document.querySelector('#partnerCarousel');
        if (carousel) {
            const carouselInstance = new bootstrap.Carousel(carousel, {
                interval: 2000,
                ride: 'carousel',
            });
        }
    }
}

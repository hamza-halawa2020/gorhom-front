import { Component } from '@angular/core';
import { AboutComponent } from '../../common/about/about.component';
import { WhyUsComponent } from '../../common/why-us/why-us.component';
import { ContactComponent } from '../../common/contact/contact.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { FeedbackComponent } from '../../common/feedback/feedback.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { MainSlider } from '../../common/main-slider/main-slider.component';
import { ProductSliderComponent } from '../../common/product-slider/product-slider.component';
import { CategorySectionComponent } from '../../common/category-section/category-section.component';
import { ProductsSectionComponent } from '../../common/products-section/products-section.component';
import { BrandsComponent } from '../../common/brands/brands.component';

@Component({
    selector: 'app-home-demo-one',
    standalone: true,
    imports: [
        NavbarComponent,
        FeedbackComponent,
        AboutComponent,
        WhyUsComponent,
        
        FeedbackComponent,
        CategorySectionComponent,
        ProductsSectionComponent,
        MainSlider,
        BrandsComponent,
        ContactComponent,
        FooterComponent,
        BackToTopComponent,
        ProductSliderComponent,
    ],
    templateUrl: './home-demo-one.component.html',
    styleUrl: './home-demo-one.component.scss',
})
export class HomeDemoOneComponent {}

import { Component } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from "../../common/navbar/navbar.component";

@Component({
    selector: 'app-terms-conditions-page',
    standalone: true,
    imports: [RouterLink, NavbarComponent, PageBannerComponent, FooterComponent, BackToTopComponent],
    templateUrl: './terms-conditions-page.component.html',
    styleUrl: './terms-conditions-page.component.scss'
})
export class TermsConditionsPageComponent {}
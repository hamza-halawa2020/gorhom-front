import { Component } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from "../../common/navbar/navbar.component";

@Component({
    selector: 'app-privacy-policy-page',
    standalone: true,
    imports: [RouterLink, NavbarComponent, PageBannerComponent, FooterComponent, BackToTopComponent],
    templateUrl: './privacy-policy-page.component.html',
    styleUrl: './privacy-policy-page.component.scss'
})
export class PrivacyPolicyPageComponent {}
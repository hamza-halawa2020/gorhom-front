import { Component } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NavbarComponent } from "../../common/navbar/navbar.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-shipping-delivery-page',
    standalone: true,
    imports: [RouterLink, NavbarComponent, PageBannerComponent, FooterComponent, BackToTopComponent, TranslateModule],
    templateUrl: './shipping-delivery-page.component.html',
    styleUrl: './shipping-delivery-page.component.scss'
})
export class ShippingDeliveryPageComponent {}
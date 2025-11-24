import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { ContactComponent } from '../../common/contact/contact.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactService } from './contact.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-contact-page',
    standalone: true,
    imports: [
        CommonModule,
        NgIf,
        NgClass,
        TranslateModule,
        ReactiveFormsModule,
        RouterLink,
        NavbarComponent,
        PageBannerComponent,
        ContactComponent,
        FooterComponent,
        BackToTopComponent,
        HttpClientModule,
    ],
    templateUrl: './contact-page.component.html',
    styleUrl: './contact-page.component.scss',
    providers: [ContactService],
})
export class ContactPageComponent {
    infoEmail = 'info@email.com';
    adminEmail = 'admin@email.com';
}

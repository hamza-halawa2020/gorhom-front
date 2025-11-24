import { Component, inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { ForgetpasswordService } from './forgetpassword.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-forgetpassword-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        NgClass,
        NgIf,
        NavbarComponent,
        PageBannerComponent,
        FooterComponent,
        BackToTopComponent,
        HttpClientModule,
        TranslateModule, // Add TranslateModule
    ],
    templateUrl: './forgetpassword-page.component.html',
    styleUrls: ['./forgetpassword-page.component.scss'],
    providers: [ForgetpasswordService],
})
export class ForgetpasswordPageComponent {
    verifyForm: FormGroup;
    passwordVisible = false;
    passwordConfirmationVisible = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private forgetService: ForgetpasswordService,
        public translate: TranslateService // Add TranslateService
    ) {
        this.verifyForm = this.fb.group({
            emailOrPhone: ['', [Validators.required]],
        });

        // Set default language
        this.translate.setDefaultLang('en');
        this.translate.use('en'); // Default to English, switchable to 'ar'
    }

    verify() {
        if (this.verifyForm.valid) {
            this.forgetService.verify(this.verifyForm.value).subscribe({
                next: (response: any) => {
                    this.successMessage =
                        this.translate.instant('CHECK_YOUR_EMAIL');
                    setTimeout(() => {
                        this.successMessage = '';
                    }, 4000);
                },
                error: (error) => {
                    this.errorMessage =
                        error.error?.message ||
                        this.translate.instant('UNEXPECTED_ERROR');
                    setTimeout(() => {
                        this.errorMessage = '';
                    }, 3000);
                },
            });
        } else {
            this.errorMessage = this.translate.instant('FORM_INVALID');
            setTimeout(() => (this.errorMessage = ''), 1000);
        }
    }

    // Optional: Method to switch language
    switchLanguage(lang: string) {
        this.translate.use(lang);
    }
}

import { Component, inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { ResetpasswordService } from './resetpassword.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-resetpassword-page',
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
    templateUrl: './resetpassword-page.component.html',
    styleUrls: ['./resetpassword-page.component.scss'],
    providers: [ResetpasswordService],
})
export class ResetpasswordPageComponent {
    verifyForm: FormGroup;
    passwordVisible = false;
    passwordConfirmationVisible = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private resetService: ResetpasswordService,
        private route: ActivatedRoute,
        public translate: TranslateService // Add TranslateService
    ) {
        const token = this.route.snapshot.queryParamMap.get('token') || '';
        this.verifyForm = this.fb.group({
            token: [token, [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            password_confirmation: [
                '',
                [Validators.required, this.passwordMatchValidator()],
            ],
        });

        // Set default language
        this.translate.setDefaultLang('en');
        this.translate.use('en'); // Default to English, switchable to 'ar'
    }

    passwordMatchValidator(): (
        control: AbstractControl
    ) => { [key: string]: boolean } | null {
        return (control: AbstractControl) => {
            if (this.verifyForm) {
                const password = this.verifyForm.get('password')?.value;
                const confirmPassword = control.value;
                return password === confirmPassword
                    ? null
                    : { passwordMismatch: true };
            }
            return null;
        };
    }

    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
    }

    togglePasswordConfirmationVisibility() {
        this.passwordConfirmationVisible = !this.passwordConfirmationVisible;
    }

    verify() {
        if (this.verifyForm.valid) {
            this.resetService.verify(this.verifyForm.value).subscribe({
                next: (response: any) => {
                    this.successMessage = this.translate.instant('DONE');
                    setTimeout(() => {
                        this.successMessage = '';
                    }, 3000);
                    this.router.navigate(['/login']);
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

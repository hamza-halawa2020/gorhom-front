import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { RegisterService } from './register.service';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NgClass, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-register-page',
    standalone: true,
    imports: [
        RouterLink,
        NavbarComponent,
        PageBannerComponent,
        FooterComponent,
        BackToTopComponent,
        HttpClientModule,
        ReactiveFormsModule,
        NgIf,
        NgClass,
        TranslateModule, // Add TranslateModule
    ],
    templateUrl: './register-page.component.html',
    styleUrl: './register-page.component.scss',
    providers: [RegisterService],
})
export class RegisterPageComponent {
    registerForm: FormGroup;
    passwordVisible = false;
    passwordConfirmationVisible = false;
    selectedFile: File | null = null;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        public router: Router,
        private fb: FormBuilder,
        private registerService: RegisterService,
        public translate: TranslateService // Add TranslateService
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: [
                '',
                [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)],
            ],
            image: [''],
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
            if (this.registerForm) {
                const password = this.registerForm.get('password')?.value;
                const confirmPassword = control.value;
                return password === confirmPassword
                    ? null
                    : { passwordMismatch: true };
            }
            return null;
        };
    }

    extractErrorMessage(error: any): string {
        let errorMessage = this.translate.instant('ERROR');
        if (error && error.error && error.error.errors) {
            errorMessage = Object.values(error.error.errors).flat().join(', ');
        }
        return errorMessage;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.registerForm.patchValue({ image: file });
        }
    }

    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
    }

    togglePasswordConfirmationVisibility() {
        this.passwordConfirmationVisible = !this.passwordConfirmationVisible;
    }

    register() {
        if (this.registerForm.invalid) {
            this.errorMessage = this.translate.instant('FORM_INVALID');
            setTimeout(() => (this.errorMessage = ''), 1000);
            return;
        }

        const formData = new FormData();
        formData.append('name', this.registerForm.get('name')?.value);
        formData.append('email', this.registerForm.get('email')?.value);
        formData.append('phone', this.registerForm.get('phone')?.value);
        formData.append('password', this.registerForm.get('password')?.value);
        formData.append(
            'password_confirmation',
            this.registerForm.get('password_confirmation')?.value
        );
        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        }

        this.registerService.register(formData).subscribe({
            next: (response: any) => {
                this.successMessage = this.translate.instant('REGISTER_SUCCESS');
                setTimeout(() => (this.successMessage = ''), 1000);
                this.registerForm.reset();
                this.router.navigate(['/verify']);
            },
            error: (err) => {
                this.errorMessage =
                    this.translate.instant('REGISTER_FAILED') +
                    ' ' +
                    this.extractErrorMessage(err);
                setTimeout(() => (this.errorMessage = ''), 2000);
            },
        });
    }

    // Optional: Method to switch language
    switchLanguage(lang: string) {
        this.translate.use(lang);
    }
}
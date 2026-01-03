import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ContactService } from './contact.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [RouterLink, CommonModule, NgIf, NgClass, ReactiveFormsModule,TranslateModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss',
    providers: [ContactService],
})
export class ContactComponent implements OnInit {
    contactForm: FormGroup;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        public router: Router,
        private contactService: ContactService,
        private fb: FormBuilder,
        private translate: TranslateService
    ) {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            title: ['', Validators.required],
            message: ['', Validators.required],
        });
    }

    ngOnInit(): void {}

    onSubmit() {
        if (this.contactForm.invalid) {
            this.translate.get('CONTACT_FORM_INVALID').subscribe((translation: string) => {
                this.errorMessage = translation;
            });
            return;
        }

        this.contactService.store(this.contactForm.value).subscribe({
            next: () => {
                this.translate.get('CONTACT_SUCCESS_MESSAGE').subscribe((translation: string) => {
                    this.successMessage = translation;
                });
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
                this.contactForm.reset();
            },

            error: (error) => {
                if (error.error?.errors) {
                    this.errorMessage = Object.values(error.error.errors)
                        .flat()
                        .join(' | ');
                } else {
                    const errorMsg = error.error?.message;
                    if (errorMsg) {
                        this.errorMessage = errorMsg;
                    } else {
                        this.translate.get('CONTACT_UNEXPECTED_ERROR').subscribe((translation: string) => {
                            this.errorMessage = translation;
                        });
                    }
                }
                setTimeout(() => {
                    this.errorMessage = '';
                }, 3000);
            },
        });
    }
}

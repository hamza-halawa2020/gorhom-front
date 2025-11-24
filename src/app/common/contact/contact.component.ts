import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ContactService } from './contact.service';
import { TranslateModule } from '@ngx-translate/core';
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
        private fb: FormBuilder
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
            this.errorMessage =
                'Please fill out all required fields correctly.';
            return;
        }

        this.contactService.store(this.contactForm.value).subscribe({
            next: (response) => {
                this.successMessage = 'Message sent successfully!';
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
                    this.errorMessage = error.error?.message || 'An unexpected error occurred.';
                }
                setTimeout(() => {
                    this.errorMessage = '';
                }, 3000);
            },
        });
    }
}

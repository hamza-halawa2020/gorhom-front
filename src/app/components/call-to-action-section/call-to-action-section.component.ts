import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { logInfo } from '../../helpers/dev-logger';
import { ContactService } from '../../services/contact';
@Component({
  selector: 'app-call-to-action-section',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './call-to-action-section.component.html',
  styleUrl: './call-to-action-section.component.css',
})
export class CallToActionSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('contactForm') contactFormRef!: ElementRef<HTMLFormElement>;
  @ViewChild('readyToInvestBtn')
  readyToInvestBtnRef!: ElementRef<HTMLButtonElement>;
  contact = environment.contactFormEmail;

  private presentationUrl: string = '';
  private languageSubscription?: Subscription;

  private toastr = inject(ToastrService);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  private languageService = inject(LanguageService);
  private analyticsService = inject(AnalyticsService);

  constructor(private contactService: ContactService) {
    this.updatePresentationUrl();

    // Subscribe to language changes
    this.languageSubscription = this.languageService
      .getCurrentLanguage()
      .subscribe(() => {
        this.updatePresentationUrl();
        // No need to re-initialize form on language changes
        // The form will work with the new translations automatically
      });
  }

  private updatePresentationUrl(): void {
    const currentLanguage = this.languageService.getCurrentLanguageValue();
    this.presentationUrl = `/${currentLanguage}/presentation`;
  }

  getPresentationUrl(): string {
    return this.presentationUrl;
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const form = this.contactFormRef.nativeElement;
    if (!form) return;

    const interestSelect = form.querySelector('#interest') as HTMLSelectElement;
    const investmentAmountField = form.querySelector(
      '#investment-amount-field'
    ) as HTMLDivElement;
    const addressField = form.querySelector('#address-field') as HTMLDivElement;
    const passportField = form.querySelector(
      '#passport-field'
    ) as HTMLDivElement;

    // Show/hide investment amount field based on interest selection
    interestSelect.addEventListener('change', () => {
      // Track select menu change
      // logInfo('Form select changed', {
      //   field: 'interest',
      //   value: interestSelect.value,
      // });
      this.analyticsService.trackFormInteraction(
        'contact_form',
        'change',
        'interest'
      );

      if (interestSelect.value === 'investment opportunities') {
        investmentAmountField.style.display = 'block';
        addressField.style.display = 'block';
        passportField.style.display = 'block';
      } else {
        investmentAmountField.style.display = 'none';
        addressField.style.display = 'none';
        passportField.style.display = 'none';

        // (form.querySelector('#investment-amount') as HTMLInputElement).value = '';
        // (form.querySelector('#address') as HTMLInputElement).value = '';
        // (form.querySelector('#passport') as HTMLInputElement).value = '';

        // Clear the investment amount field when hidden
        const investmentAmountInput = form.querySelector(
          '#investment-amount'
        ) as HTMLInputElement;
        const addressInput = form.querySelector('#address') as HTMLDivElement;
        const passportInput = form.querySelector('#passport') as HTMLDivElement;
        if (investmentAmountInput || addressInput || passportInput) {
          investmentAmountInput.value = '';
          // addressInput.value = '';
          // passportInput.value = '';
        }
      }
    });

    // Add blur tracking for form fields
    this.addFormFieldTracking(form);

    // Handle investor-form hash
    this.checkForInvestorFormHash();

    form.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      const interestElement = form.querySelector(
        '#interest'
      ) as HTMLSelectElement;
      const selectedInterest = interestElement?.value;

      const formData = {
        name: (form.querySelector('#name') as HTMLInputElement)?.value.trim(),
        email: (form.querySelector('#email') as HTMLInputElement)?.value.trim(),
        phone:
          (form.querySelector('#phone') as HTMLInputElement)?.value.trim() ||
          '',
        passport:
          (form.querySelector('#passport') as HTMLInputElement)?.value.trim() ||
          '',
        address:
          (form.querySelector('#address') as HTMLInputElement)?.value.trim() ||
          '',
        interest: selectedInterest,
        investment_amount:
          (
            form.querySelector('#investment-amount') as HTMLInputElement
          )?.value.trim() || '',
        message: (
          form.querySelector('#message') as HTMLTextAreaElement
        )?.value.trim(),
      };

      if (!formData.name ||!formData.email ||!formData.message ||!formData.interest) {
        this.toastr.error(
          this.translationService.translate('validation_missing_fields'),
          this.translationService.translate('error')
        );
        return;
      }

      if (formData.interest === 'investment opportunities') {
        if (!formData.investment_amount ||!formData.address ||!formData.passport) {
          this.toastr.error(this.translationService.translate('validation_investment_fields_required'),
            this.translationService.translate('error')
          );
          return;
        }
      }

      this.contactService.sendContactForm(formData).subscribe({
        next: () => {
          this.toastr.success(
            this.translationService.translate('validation_success'),
            this.translationService.translate('success')
          );
          form.reset();
        },
        error: (err) => {
          console.error('Error sending contact form:', err);
          this.toastr.error(
            this.translationService.translate('validation_send_failed'),
            this.translationService.translate('error')
          );
        },
      });
    });
  }

  onReadyToInvestClick(): void {
    // Update URL with hash fragment using Angular Location service
    try {
      this.location.go(this.location.path() + '#contact');
      window.location.hash = 'contact';
    } catch (error) {
      console.error('Error setting contact hash:', error);
    }

    // Scroll to connect section title with enhanced smooth scrolling
    const connectSection = document.querySelector('#contact');
    if (connectSection) {
      connectSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }

    // Use Angular's setTimeout equivalent for smooth UX
    setTimeout(() => {
      const form = this.contactFormRef.nativeElement;
      const interestSelect = form.querySelector(
        '#interest'
      ) as HTMLSelectElement;
      const investmentAmountField = form.querySelector(
        '#investment-amount-field'
      ) as HTMLDivElement;

      // Set investment opportunities as selected
      interestSelect.value = 'investment opportunities';

      // Show investment amount field
      if (investmentAmountField) {
        investmentAmountField.style.display = 'block';
      }

      // Focus on the name field to start filling the form
      const nameInput = form.querySelector('#name') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 800);
  }

  // Method to handle section navigation with URL updates
  navigateToSection(sectionId: string): void {
    // Update URL hash first
    try {
      // Use the Location service for better Angular integration
      this.location.go(this.location.path() + '#' + sectionId);

      // Also update window.location.hash as fallback
      window.location.hash = sectionId;
    } catch (error) {
      console.error('Error setting hash:', error);
    }

    // Wait a moment and check again
    setTimeout(() => {}, 100);

    // Scroll to section with smooth scrolling
    const section = document.querySelector('#' + sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    } else {
      console.warn('Section not found:', '#' + sectionId);
    }
  }

  // Method to check for investor-form hash and handle it
  private checkForInvestorFormHash(): void {
    const hash = window.location.hash;

    if (hash === '#investor-form') {
      // Scroll to contact section
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }

      // Set up the form for investment
      this.setupInvestorForm();
    }
  }

  // Method to configure the form for investment opportunities
  private setupInvestorForm(): void {
    const form = this.contactFormRef.nativeElement;
    const interestSelect = form.querySelector('#interest') as HTMLSelectElement;
    const investmentAmountField = form.querySelector(
      '#investment-amount-field'
    ) as HTMLDivElement;

    // Wait a bit for the scroll animation to complete, then set up the form
    setTimeout(() => {
      // Select "investment opportunities" in the dropdown
      interestSelect.value = 'investment opportunities';

      // Trigger the change event to show the investment amount field
      const changeEvent = new Event('change', { bubbles: true });
      interestSelect.dispatchEvent(changeEvent);

      // Show the investment amount field
      investmentAmountField.style.display = 'block';

      // Focus on the name field to indicate the form is ready
      const nameInput = form.querySelector('#name') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 800);
  }

  private addFormFieldTracking(form: HTMLFormElement): void {
    // Track field blur events
    const fields = ['name', 'email', 'phone', 'message', 'investment-amount'];

    fields.forEach((fieldId) => {
      const field = form.querySelector(`#${fieldId}`) as
        | HTMLInputElement
        | HTMLTextAreaElement;
      if (field) {
        field.addEventListener('blur', () => {
          if (field.value.trim()) {
            // logInfo('Form field blurred', { field: fieldId, hasValue: true });
            this.analyticsService.trackFormInteraction(
              'contact_form',
              'blur',
              fieldId
            );
          }
        });
      }
    });
  }
}

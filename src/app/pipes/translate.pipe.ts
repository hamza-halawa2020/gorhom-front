import {Pipe, PipeTransform, OnDestroy} from "@angular/core";
import {TranslationService} from "../services/translation.service";
import {TranslationKeys} from "../interfaces/translation-keys.interface";
import {Subscription} from "rxjs";

/**
 * Type-safe translate pipe that ensures all translation keys are valid at compile time.
 * Usage: {{ 'nav_vision' | translate }}
 */
@Pipe({
  name: "translate",
  standalone: true,
  pure: false, // Make it impure to react to language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription = new Subscription();
  private isLoading = true;

  constructor(private translationService: TranslationService) {
    this.subscription.add(
      this.translationService.isLoadingTranslations().subscribe((loading) => {
        this.isLoading = loading;
      })
    );
  }

  transform(key: TranslationKeys, ...args: any[]): string {
    // If still loading, return empty string to prevent showing keys
    if (this.isLoading) {
      return "";
    }

    const translation = this.translationService.translate(key, args);

    // If translation is the same as key (not found), return empty string to prevent showing keys
    if (translation === key) {
      console.warn(`Translation key "${key}" not found`);
      return "";
    }

    return translation;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

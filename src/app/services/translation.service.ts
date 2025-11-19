import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {TranslationKeys} from "../interfaces/translation-keys.interface";
import {SupportedLocale} from "../interfaces/translation.interface";
import {LanguageService} from "./language.service";
import {RTLService} from "./rtl.service";

/**
 * Type-safe translation service that ensures all translation keys are valid at compile time.
 * This is the ONLY translation service - no untyped alternatives exist.
 */
@Injectable({
  providedIn: "root",
})
export class TranslationService {
  private currentTranslations = new BehaviorSubject<Record<
    TranslationKeys,
    string
  > | null>(null);
  private isLoading = new BehaviorSubject<boolean>(true);

  constructor(
    private languageService: LanguageService,
    private rtlService: RTLService
  ) {
    // Listen to language changes and load translations
    this.languageService.getCurrentLanguage().subscribe((locale) => {
      this.loadTranslations(locale, false); // false = not initial load
      this.rtlService.setDirection(locale);
    });

    // Load initial translations
    this.initializeTranslations();
  }

  private async initializeTranslations(): Promise<void> {
    const currentLocale = this.languageService.getCurrentLanguageValue();
    await this.loadTranslations(currentLocale, true); // true = initial load
  }

  getTranslations(): Observable<Record<TranslationKeys, string> | null> {
    return this.currentTranslations.asObservable();
  }

  getCurrentLocale(): Observable<SupportedLocale> {
    return this.languageService.getCurrentLanguage();
  }

  isLoadingTranslations(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  async loadTranslations(
    locale: SupportedLocale,
    isInitialLoad: boolean = false
  ): Promise<void> {
    // Show loading state for both initial load and language changes
    // console.log(
    //   `[TranslationService] loadTranslations called: locale=${locale}, isInitialLoad=${isInitialLoad}, current loading state=${this.isLoading.value}`
    // );
    this.isLoading.next(true);
    // console.log(
    //   `[TranslationService] Set loading to true for locale: ${locale}`
    // );

    try {
      // console.log(
      //   `[TranslationService] Attempting to import translations for: ${locale}`
      // );
      const translations = await import(`../../assets/i18n/${locale}.json`);
      this.currentTranslations.next(translations.default.translations);
      // console.log(
      //   `[TranslationService] Successfully loaded translations for: ${locale}`
      // );

      // Always set loading to false after successful load
      this.isLoading.next(false);
      // console.log(`[TranslationService] Set loading to false for: ${locale}`);
    } catch (error) {
      // console.error(
      //   `[TranslationService] Failed to load translations for locale: ${locale}`,
      //   error
      // );
      // Fallback to English
      if (locale !== "en") {
        // console.log(
        //   `[TranslationService] Falling back to English for: ${locale}`
        // );
        await this.loadTranslations("en", isInitialLoad);
      } else {
        // If English also fails, create empty translations to prevent infinite loading
        // console.log(
        //   `[TranslationService] Creating empty translations as final fallback`
        // );
        this.currentTranslations.next({} as Record<TranslationKeys, string>);
        this.isLoading.next(false);
        // console.log(`[TranslationService] Set loading to false after fallback`);
      }
    }
  }

  getTranslation(key: TranslationKeys): string {
    const translations = this.currentTranslations.value;
    return translations?.[key] || key;
  }

  translate(key: TranslationKeys, args?: any[]): string {
    const translations = this.currentTranslations.value;
    let translation = translations?.[key] || key;

    // Handle interpolation if args are provided
    if (args && args.length > 0) {
      args.forEach((arg, index) => {
        const placeholder = `{{${index}}}`;
        translation = translation.replace(placeholder, String(arg));
      });
    }

    return translation;
  }

  switchLanguage(locale: SupportedLocale): void {
    this.languageService.setLanguage(locale);
  }

  setLanguage(locale: SupportedLocale): void {
    this.languageService.setLanguage(locale);
  }
}

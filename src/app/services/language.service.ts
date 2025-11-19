import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {SupportedLocale} from "../interfaces/translation.interface";
import {AnalyticsService} from "./analytics.service";
import {LoadingTrackingService} from "./loading-tracking.service";
import {logInfo, logWarn, logError} from "../helpers/dev-logger";

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  private readonly STORAGE_KEY = "hps-preferred-language";
  private currentLanguage = new BehaviorSubject<SupportedLocale>("en");

  constructor(
    private analyticsService: AnalyticsService,
    private loadingTrackingService: LoadingTrackingService
  ) {
    this.initializeLanguage();
  }

  getCurrentLanguage(): Observable<SupportedLocale> {
    return this.currentLanguage.asObservable();
  }

  getCurrentLanguageValue(): SupportedLocale {
    return this.currentLanguage.value;
  }

  setLanguage(
    language: SupportedLocale,
    source: "navbar" | "selector" | "url" | "auto" = "selector"
  ): void {
    const previousLanguage = this.currentLanguage.value;
    // console.log(
    //   `[LanguageService] setLanguage called: ${language}, source: ${source}, previous: ${previousLanguage}`
    // );

    // Only track if language actually changed
    if (previousLanguage !== language) {
      // console.log(
      //   `[LanguageService] Language actually changed from ${previousLanguage} to ${language}`
      // );
      this.currentLanguage.next(language);
      localStorage.setItem(this.STORAGE_KEY, language);

      // logInfo("Language switched", {
      //   from: previousLanguage,
      //   to: language,
      //   source: source,
      // });

      // Track language switch in analytics
      this.analyticsService.trackLanguageSwitch(
        language,
        previousLanguage,
        source
      );
    } else {
      // console.log(
      //   `[LanguageService] Language is the same (${language}), just updating localStorage`
      // );
      // Language is the same, just update localStorage without tracking
      localStorage.setItem(this.STORAGE_KEY, language);

      // logInfo("Language set (no change)", {
      //   language: language,
      //   source: source,
      // });
    }
  }

  /**
   * Set language without triggering analytics (for initialization)
   */
  setLanguageSilently(language: SupportedLocale): void {
    // console.log(`[LanguageService] setLanguageSilently called: ${language}`);
    this.currentLanguage.next(language);
    localStorage.setItem(this.STORAGE_KEY, language);
  }

  private initializeLanguage(): void {
    // Start tracking language loading
    this.loadingTrackingService.startLanguageLoading();

    // 1. Check for stored preference
    const storedLanguage = localStorage.getItem(
      this.STORAGE_KEY
    ) as SupportedLocale;

    if (storedLanguage && this.isValidLocale(storedLanguage)) {
      this.setLanguageSilently(storedLanguage);

      // Track language detection (not a switch, just detection)
      this.analyticsService.trackLanguageDetection("manual", storedLanguage);

      // Track language loaded
      this.loadingTrackingService.trackLanguageLoaded(storedLanguage);
      return;
    }

    // 2. Detect browser language
    const browserLanguage = this.detectBrowserLanguage();

    if (browserLanguage) {
      this.setLanguageSilently(browserLanguage);

      // Track language detection (not a switch, just detection)
      this.analyticsService.trackLanguageDetection("auto", browserLanguage);

      // Track language loaded
      this.loadingTrackingService.trackLanguageLoaded(browserLanguage);
      return;
    }

    // 3. Fallback to English
    this.setLanguageSilently("en");

    // Track language detection (not a switch, just detection)
    this.analyticsService.trackLanguageDetection("default", "en");

    // Track language loaded
    this.loadingTrackingService.trackLanguageLoaded("en");
  }

  private detectBrowserLanguage(): SupportedLocale | null {
    const browserLang = navigator.language;

    // Check for Arabic
    if (browserLang.startsWith("ar")) {
      return "ar";
    }

    // Check for English
    if (browserLang.startsWith("en")) {
      return "en";
    }

    // Check for Arabic in navigator.languages
    const languages = navigator.languages || [];
    for (const lang of languages) {
      if (lang.startsWith("ar")) {
        return "ar";
      }
      if (lang.startsWith("en")) {
        return "en";
      }
    }

    return null;
  }

  private isValidLocale(locale: string): locale is SupportedLocale {
    return locale === "en" || locale === "ar";
  }
}

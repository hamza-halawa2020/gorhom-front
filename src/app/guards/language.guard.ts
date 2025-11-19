import {Injectable} from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import {LanguageService} from "../services/language.service";
import {RTLService} from "../services/rtl.service";
import {TranslationService} from "../services/translation.service";
import {SupportedLocale} from "../interfaces/translation.interface";

@Injectable({
  providedIn: "root",
})
export class LanguageGuard implements CanActivate {
  private readonly supportedLanguages: SupportedLocale[] = ["en", "ar"];

  constructor(
    private languageService: LanguageService,
    private rtlService: RTLService,
    private translationService: TranslationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const language = route.params["lang"] as SupportedLocale;

    // Validate language parameter
    if (!this.isValidLanguage(language)) {
      // Redirect to default language (English)
      this.router.navigate(["/en"]);
      return false;
    }

    // Update services with the validated language
    this.languageService.setLanguage(language, "url");
    this.rtlService.setDirection(language);
    this.translationService.setLanguage(language);

    return true;
  }

  private isValidLanguage(language: string): language is SupportedLocale {
    return this.supportedLanguages.includes(language as SupportedLocale);
  }
}

import {Injectable} from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import {LanguageService} from "../services/language.service";

@Injectable({
  providedIn: "root",
})
export class AutoLanguageRedirectGuard implements CanActivate {
  constructor(
    private languageService: LanguageService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Get current language from the service
    const currentLanguage = this.languageService.getCurrentLanguageValue();

    // Get the current URL path
    const currentPath = state.url;

    // If the path doesn't start with a language prefix, redirect to current language
    if (!currentPath.startsWith("/en") && !currentPath.startsWith("/ar")) {
      const newUrl = `/${currentLanguage}${currentPath}`;
      this.router.navigateByUrl(newUrl);
      return false;
    }

    return true;
  }
}

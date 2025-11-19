import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {LanguageService} from "../../services/language.service";
import {RTLService} from "../../services/rtl.service";
import {TranslationService} from "../../services/translation.service";
import {SupportedLocale} from "../../interfaces/translation.interface";

@Component({
  selector: "app-language-selector",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./language-selector.component.html",
  styleUrl: "./language-selector.component.css",
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: SupportedLocale = "en";
  isDropdownOpen = false;

  languages: {code: SupportedLocale; name: string; flag: string}[] = [
    {code: "en", name: "English", flag: "assets/img/flag-en.svg"},
    {code: "ar", name: "العربية", flag: "assets/img/flag-ar.svg"},
  ];

  constructor(
    private languageService: LanguageService,
    private rtlService: RTLService,
    private translationService: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.languageService.getCurrentLanguage().subscribe((lang) => {
      this.currentLanguage = lang;
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLanguage(language: SupportedLocale): void {
    if (language === this.currentLanguage) {
      this.isDropdownOpen = false;
      return;
    }

    // Get current route and hash fragment
    const currentUrl = this.router.url;
    const [path, hash] = currentUrl.split("#");
    const urlSegments = path.split("/").filter((segment) => segment);

    // Remove language prefix if it exists
    if (
      urlSegments.length > 0 &&
      (urlSegments[0] === "en" || urlSegments[0] === "ar")
    ) {
      urlSegments.shift();
    }

    // Construct new URL with new language and preserve hash fragment
    const newUrl = `/${language}${
      urlSegments.length > 0 ? "/" + urlSegments.join("/") : ""
    }${hash ? "#" + hash : ""}`;

    // Update services
    this.languageService.setLanguage(language, "selector");
    this.rtlService.setDirection(language);
    this.translationService.setLanguage(language);

    // Navigate to new URL
    this.router.navigateByUrl(newUrl);
    this.isDropdownOpen = false;
  }

  getCurrentLanguageInfo() {
    return this.languages.find((lang) => lang.code === this.currentLanguage);
  }
}

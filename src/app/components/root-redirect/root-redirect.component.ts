import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {LanguageService} from "../../services/language.service";

@Component({
  selector: "app-root-redirect",
  template: "",
  standalone: true,
})
export class RootRedirectComponent implements OnInit {
  constructor(
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current language from the service
    const currentLanguage = this.languageService.getCurrentLanguageValue();

    // Redirect to the current language
    this.router.navigateByUrl(`/${currentLanguage}`);
  }
}

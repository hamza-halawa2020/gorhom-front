import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {TranslationKeys} from "../../interfaces/translation-keys.interface";
@Component({
  selector: "app-crow-aircraft-section",
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./crow-aircraft-section.component.html",
  styleUrl: "./crow-aircraft-section.component.css",
})
export class CrowAircraftSectionComponent {
  applications: {
    titleKey: TranslationKeys;
    descriptionKey: TranslationKeys;
    icon: SafeHtml;
  }[] = [];
  technicals: {titleKey: TranslationKeys; descriptionKey: TranslationKeys}[] =
    [];

  constructor(
    private sanitizer: DomSanitizer,
  ) {
    this.applications = [
      {
        titleKey: "crow_app_1_title",
        descriptionKey: "crow_app_1_desc",
        icon: this.sanitizer.bypassSecurityTrustHtml(` `),
      },
      {
        titleKey: "crow_app_2_title",
        descriptionKey: "crow_app_2_desc",
        icon: this.sanitizer.bypassSecurityTrustHtml(``),
      },
      {
        titleKey: "crow_app_3_title",
        descriptionKey: "crow_app_3_desc",
        icon: this.sanitizer.bypassSecurityTrustHtml(``),
      },
      {
        titleKey: "crow_app_4_title",
        descriptionKey: "crow_app_4_desc",
        icon: this.sanitizer.bypassSecurityTrustHtml(``),
      },
      {
        titleKey: "crow_app_5_title",
        descriptionKey: "crow_app_5_desc",
        icon: this.sanitizer.bypassSecurityTrustHtml(` `),
      },
      {
        titleKey: "crow_app_6_title",
        descriptionKey: "crow_app_6_desc",
        icon: this.sanitizer.bypassSecurityTrustHtml(` `),
      },
      {
        titleKey: "crow_app_7_title",
        descriptionKey: "crow_app_7_desc",
        icon: this.sanitizer.bypassSecurityTrustHtml(` `),
      },
    ];
    this.technicals = [
      {
        titleKey: "crow_spec_1_title",
        descriptionKey: "crow_spec_1_desc",
      },
      {
        titleKey: "crow_spec_2_title",
        descriptionKey: "crow_spec_2_desc",
      },
      {
        titleKey: "crow_spec_3_title",
        descriptionKey: "crow_spec_3_desc",
      },
      {
        titleKey: "crow_spec_4_title",
        descriptionKey: "crow_spec_4_desc",
      },
      {
        titleKey: "crow_spec_5_title",
        descriptionKey: "crow_spec_5_desc",
      },
      {
        titleKey: "crow_spec_6_title",
        descriptionKey: "crow_spec_6_desc",
      },
      {
        titleKey: "crow_spec_7_title",
        descriptionKey: "crow_spec_7_desc",
      },
      {
        titleKey: "crow_spec_8_title",
        descriptionKey: "crow_spec_8_desc",
      },
      {
        titleKey: "crow_spec_9_title",
        descriptionKey: "crow_spec_9_desc",
      },
      {
        titleKey: "crow_spec_10_title",
        descriptionKey: "crow_spec_10_desc",
      },
      {
        titleKey: "crow_spec_11_title",
        descriptionKey: "crow_spec_11_desc",
      },
      {
        titleKey: "crow_spec_12_title",
        descriptionKey: "crow_spec_12_desc",
      },
      {
        titleKey: "crow_spec_13_title",
        descriptionKey: "crow_spec_13_desc",
      },
      {
        titleKey: "crow_spec_14_title",
        descriptionKey: "crow_spec_14_desc",
      },
      {
        titleKey: "crow_spec_15_title",
        descriptionKey: "crow_spec_15_desc",
      },
    ];
  }
}

import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";
import {TranslationService} from "../../services/translation.service";
import {TranslatePipe} from "../../pipes/translate.pipe";

@Component({
  selector: "app-vision-section",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./vision-section.component.html",
  styleUrl: "./vision-section.component.css",
})
export class VisionSectionComponent {
  constructor(
    public translationService: TranslationService
  ) {}
}

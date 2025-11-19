import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";
import {SoundService} from "../../services/sound.service";
import {TranslationService} from "../../services/translation.service";
import {TranslatePipe} from "../../pipes/translate.pipe";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.css",
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(
    private soundService: SoundService,
    public translationService: TranslationService
  ) {}
}

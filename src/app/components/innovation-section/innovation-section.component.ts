import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";
import {SoundService} from "../../services/sound.service";
import {TranslationService} from "../../services/translation.service";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {TranslationKeys} from "../../interfaces/translation-keys.interface";

@Component({
  selector: "app-innovation-section",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./innovation-section.component.html",
  styleUrl: "./innovation-section.component.css",
})
export class InnovationSectionComponent {
  constructor(
    private soundService: SoundService,
    public translationService: TranslationService
  ) {}

  advantages: {
    id: number;
    titleKey: TranslationKeys;
    descriptionKey: TranslationKeys;
  }[] = [
    {
      id: 1,
      titleKey: "innovation_advantage_1_title",
      descriptionKey: "innovation_advantage_1_desc",
    },
    {
      id: 2,
      titleKey: "innovation_advantage_2_title",
      descriptionKey: "innovation_advantage_2_desc",
    },
    {
      id: 3,
      titleKey: "innovation_advantage_3_title",
      descriptionKey: "innovation_advantage_3_desc",
    },
    {
      id: 4,
      titleKey: "innovation_advantage_4_title",
      descriptionKey: "innovation_advantage_4_desc",
    },
    {
      id: 5,
      titleKey: "innovation_advantage_5_title",
      descriptionKey: "innovation_advantage_5_desc",
    },
    {
      id: 6,
      titleKey: "innovation_advantage_6_title",
      descriptionKey: "innovation_advantage_6_desc",
    },
    {
      id: 7,
      titleKey: "innovation_advantage_7_title",
      descriptionKey: "innovation_advantage_7_desc",
    },
    {
      id: 8,
      titleKey: "innovation_advantage_8_title",
      descriptionKey: "innovation_advantage_8_desc",
    },
    {
      id: 9,
      titleKey: "innovation_advantage_9_title",
      descriptionKey: "innovation_advantage_9_desc",
    },
  ];

  advantages2: {titleKey: TranslationKeys; descriptionKey: TranslationKeys}[] =
    [
      {
        titleKey: "innovation_key_1_title",
        descriptionKey: "innovation_key_1_desc",
      },
      {
        titleKey: "innovation_key_2_title",
        descriptionKey: "innovation_key_2_desc",
      },
      {
        titleKey: "innovation_key_3_title",
        descriptionKey: "innovation_key_3_desc",
      },
      {
        titleKey: "innovation_key_4_title",
        descriptionKey: "innovation_key_4_desc",
      },
      {
        titleKey: "innovation_key_5_title",
        descriptionKey: "innovation_key_5_desc",
      },
      {
        titleKey: "innovation_key_6_title",
        descriptionKey: "innovation_key_6_desc",
      },
      {
        titleKey: "innovation_key_7_title",
        descriptionKey: "innovation_key_7_desc",
      },
      {
        titleKey: "innovation_key_8_title",
        descriptionKey: "innovation_key_8_desc",
      },
    ];
}

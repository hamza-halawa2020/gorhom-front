// This interface is now replaced by the TranslationKeys type in translation-keys.interface.ts
import {TranslationKeys} from "./translation-keys.interface";

export interface TranslationFile {
  locale: string;
  translations: TranslationKeys;
}

export type SupportedLocale = "en" | "ar";

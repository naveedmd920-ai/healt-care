import { en, TranslationDict } from './en';
import { te } from './te';
import { hi } from './hi';

export type SupportedLanguage = 'en' | 'te' | 'hi';

export const translations: Record<SupportedLanguage, TranslationDict> = {
  en,
  te,
  hi,
};

export const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिन्दी',
};

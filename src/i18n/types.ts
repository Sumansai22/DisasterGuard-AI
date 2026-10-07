export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta' | 'ml' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flagEmoji: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flagEmoji: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flagEmoji: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flagEmoji: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flagEmoji: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flagEmoji: '🇮🇳' },
];

export type TranslationDictionary = Record<string, any>;

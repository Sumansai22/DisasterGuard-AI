import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, LanguageOption, TranslationDictionary } from './types';

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';
import kn from './locales/kn.json';

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  te,
  hi,
  ta,
  ml,
  kn,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyPath: string, fallback?: string) => string;
  formatNumber: (value: number) => string;
  formatDate: (value: string | Date | number, options?: Intl.DateTimeFormatOptions) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'disasterguard_language_preference';
const LEGACY_STORAGE_KEY = 'landslideguard_language_preference';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)) as SupportedLanguage | null;
      if (saved && ['en', 'te', 'hi', 'ta', 'ml', 'kn'].includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore local storage security exceptions
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  /**
   * Safe nested key translation resolver
   * e.g., t('dashboard.overallRisk') -> 'Overall Risk' or 'మొత్తం ప్రమాదం'
   */
  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    
    // 1. Try active language
    let activeResult: any = dictionaries[language];
    for (const k of keys) {
      if (activeResult && typeof activeResult === 'object' && k in activeResult) {
        activeResult = activeResult[k];
      } else {
        activeResult = undefined;
        break;
      }
    }

    if (typeof activeResult === 'string') {
      return activeResult;
    }

    // 2. Fallback to English
    let enResult: any = dictionaries.en;
    for (const k of keys) {
      if (enResult && typeof enResult === 'object' && k in enResult) {
        enResult = enResult[k];
      } else {
        enResult = undefined;
        break;
      }
    }

    if (typeof enResult === 'string') {
      return enResult;
    }

    // 3. Fallback to passed fallback or keyPath
    return fallback !== undefined ? fallback : keyPath;
  };

  const formatNumber = (value: number): string => {
    try {
      const localeCode = language === 'en' ? 'en-IN' : `${language}-IN`;
      return new Intl.NumberFormat(localeCode).format(value);
    } catch {
      return value.toLocaleString();
    }
  };

  const formatDate = (value: string | Date | number, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
      const localeCode = language === 'en' ? 'en-IN' : `${language}-IN`;
      return new Intl.DateTimeFormat(localeCode, options || {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return String(value);
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      formatNumber,
      formatDate,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageOption,
    }),
    [language, currentLanguageOption]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

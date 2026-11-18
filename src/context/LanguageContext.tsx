import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, translations } from '../translations';
import type { TranslationDict } from '../translations/en';
import { api, TOKEN_STORAGE_KEY } from '../services/api';

const LANG_STORAGE_KEY = 'rhc_language';

interface LanguageContextValue {
  lang: SupportedLanguage;
  t: TranslationDict;
  setLanguage: (next: SupportedLanguage, syncServer?: boolean) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'te' || saved === 'hi') return saved;
    return 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const setLanguage = async (next: SupportedLanguage, syncServer = true) => {
    setLang(next);
    localStorage.setItem(LANG_STORAGE_KEY, next);
    if (syncServer && localStorage.getItem(TOKEN_STORAGE_KEY)) {
      try {
        await api.put('/user/language', { language: next });
      } catch {
        // Non-blocking preference sync
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

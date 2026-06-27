"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../lib/storage";
import { STORAGE_KEYS, LANGUAGES } from "../lib/constants";
import { en } from "../locales/en";
import { ar } from "../locales/ar";

type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  [LANGUAGES.EN]: en,
  [LANGUAGES.AR]: ar,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(LANGUAGES.EN);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = storage.get(STORAGE_KEYS.LANGUAGE) as Language;
      if (stored === LANGUAGES.EN || stored === LANGUAGES.AR) {
        setLanguageState(stored);
      }
    }
  }, []);

  const dir = language === LANGUAGES.AR ? "rtl" : "ltr";

  // Force document dir and lang update on change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [dir, language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storage.set(STORAGE_KEYS.LANGUAGE, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      <div dir={dir} className="w-full">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

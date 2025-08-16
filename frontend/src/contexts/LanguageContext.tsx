// contexts/LanguageContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { translations, Language } from '@/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageSelected: boolean;
  t: (key: string, namespace: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'govconn_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(false);
  const router = useRouter();

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setIsLanguageSelected(true);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-language', lang);
  };

  // Translation function with proper typing
  const t = (key: string, namespace: string): string => {
    const currentTranslations = translations[language] || translations.en;
    
    // Type assertion to allow dynamic access
    const namespaceTranslations = (currentTranslations as any)[namespace];
    if (!namespaceTranslations) {
      console.warn(`Namespace "${namespace}" not found for language "${language}"`);
      return key;
    }
    
    const translation = namespaceTranslations[key];
    
    if (typeof translation === 'string') {
      return translation;
    }
    
    // Fallback to English
    if (language !== 'en') {
      const englishTranslations = (translations.en as any)[namespace];
      const englishTranslation = englishTranslations?.[key];
      
      if (typeof englishTranslation === 'string') {
        return englishTranslation;
      }
    }
    
    console.warn(`Translation not found for key: "${key}" in namespace: "${namespace}" for language: "${language}"`);
    return key;
  };

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (storedLanguage && ['en', 'si', 'ta'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
      setIsLanguageSelected(true);
      document.documentElement.lang = storedLanguage;
      document.documentElement.setAttribute('data-language', storedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      isLanguageSelected,
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

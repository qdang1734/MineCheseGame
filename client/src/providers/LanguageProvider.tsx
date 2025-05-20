import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { languages } from '@/components/ui/language-selector';

// Define the translations interface
interface Translations {
  [language: string]: {
    [key: string]: string;
  };
}

// Import translations from i18n.ts 
import { translations } from '@/lib/i18n';

// Create the context
interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get initial language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('app_language');
    return savedLang && languages.some(lang => lang.code === savedLang) 
      ? savedLang 
      : 'en';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
import { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getCurrentLanguage } from "@/lib/i18n";

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: "en", name: "English", flag: "gb" },
  { code: "ru", name: "Русский", flag: "ru" },
  { code: "cn", name: "简体中文", flag: "cn" },
  { code: "kr", name: "한국어", flag: "kr" },
  { code: "vn", name: "Tiếng Việt", flag: "vn" }
];

interface LanguageSelectorProps {
  selected?: string;
  onSelect?: (language: Language) => void;
}

const LanguageSelector = ({ 
  onSelect 
}: LanguageSelectorProps) => {
  // Temporarily use local state instead of context 
  const [selectedLang, setSelectedLang] = useState(() => {
    // Get from localStorage if available
    const saved = localStorage.getItem('app_language');
    return saved && languages.some(lang => lang.code === saved) ? saved : 'en';
  });
  
  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('app_language', selectedLang);
    // Trigger a custom event to notify other components about the language change
    window.dispatchEvent(new CustomEvent('languageChange', { detail: selectedLang }));
  }, [selectedLang]);
  
  const handleSelect = (language: Language) => {
    setSelectedLang(language.code);
    if (onSelect) onSelect(language);
  };
  
  const currentLanguage = languages.find(lang => lang.code === selectedLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-full">
        <img 
          src={`https://flagicons.lipis.dev/flags/4x3/${currentLanguage.flag}.svg`} 
          alt={currentLanguage.name} 
          className="w-5 h-5 rounded-full"
        />
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-700 w-36">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className="px-3 py-1.5 flex items-center space-x-2 hover:bg-gray-700 text-white cursor-pointer"
            onClick={() => handleSelect(language)}
          >
            <img 
              src={`https://flagicons.lipis.dev/flags/4x3/${language.flag}.svg`} 
              alt={language.name} 
              className="w-5 h-5 rounded-full"
            />
            <span className="text-sm">{language.name}</span>
            {selectedLang === language.code && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SupportedLanguage } from '../../i18n/types';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'modal';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { language, setLanguage, languages, currentLanguageOption, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('app.selectLanguage', 'Select language')}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="font-semibold text-slate-700 hidden sm:inline truncate max-w-[90px]">{currentLanguageOption.nativeName}</span>
        <span className="font-bold text-slate-700 sm:hidden uppercase font-mono text-[11px]">{currentLanguageOption.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              {t('app.selectLanguage', 'Select Language')}
            </div>
            <div className="py-1">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-orange-50 font-bold text-orange-950'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flagEmoji}</span>
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({lang.name})</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

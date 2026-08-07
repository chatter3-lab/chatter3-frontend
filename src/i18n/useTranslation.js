import { useState, useEffect, useCallback } from 'react';
import { getTranslations } from './detect';

export function useTranslation() {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('chatter3_lang') || 'en';
  });

  const [, forceUpdate] = useState(0);

  const setLang = useCallback((newLang) => {
    localStorage.setItem('chatter3_lang', newLang);
    setLangState(newLang);
    forceUpdate(n => n + 1);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('chatter3_lang') || 'en';
      setLangState(prev => {
        if (prev !== stored) {
          forceUpdate(n => n + 1);
          return stored;
        }
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const t = getTranslations(lang);

  return { t, lang, setLang };
}

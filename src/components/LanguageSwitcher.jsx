import { useState, useRef, useEffect } from 'react';
import { languages, setLanguage, getLocalizedPath } from '../i18n/detect';

export default function LanguageSwitcher({ currentLang }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentPath = window.location.pathname;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const newPath = getLocalizedPath(currentPath, lang);
    if (newPath !== currentPath) {
      window.location.href = newPath;
    } else {
      window.location.reload();
    }
  };

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setIsOpen(!isOpen)} className="lang-btn">
        <span>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
      </button>
      {isOpen && (
        <div className="lang-dropdown">
          {languages.map(({ code, flag }) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`lang-option${code === currentLang ? ' active' : ''}`}
            >
              <span>{flag}</span>
              <span>{code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

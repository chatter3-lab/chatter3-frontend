import { useRef, useEffect } from 'react';
import { languages, setLanguage, getLocalizedPath } from '../i18n/detect';

const LANG_COLORS = {
  en: '#1e40af', es: '#dc2626'
};

export default function LanguageSwitcher({ currentLang }) {
  const selectRef = useRef(null);
  const currentPath = window.location.pathname;

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.value = currentLang || 'en';
    }
  }, [currentLang]);

  const handleChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const newPath = getLocalizedPath(currentPath, lang);
    if (newPath !== currentPath) {
      window.location.href = newPath;
    } else {
      window.location.reload();
    }
  };

  return (
    <select
      ref={selectRef}
      onChange={handleChange}
      defaultValue={currentLang || 'en'}
      className="lang-select"
      aria-label="Select language"
      style={{
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 8px center`,
        paddingRight: '28px',
        border: '1px solid rgba(79,70,229,.25)',
        borderRadius: '8px',
        padding: '6px 30px 6px 10px',
        cursor: 'pointer',
        fontSize: '.85rem',
        fontWeight: '600',
        letterSpacing: '.04em',
        color: '#4f46e5',
        lineHeight: '1',
        backgroundColor: 'rgba(79,70,229,.05)',
        fontFamily: 'inherit'
      }}
    >
      {languages.map(({ code }) => (
        <option key={code} value={code}>
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

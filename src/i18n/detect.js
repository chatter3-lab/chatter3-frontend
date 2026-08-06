import en from './en.json';
import es from './es.json';
import ja from './ja.json';
import ar from './ar.json';
import zh from './zh.json';
import fr from './fr.json';
import ru from './ru.json';

export const translations = { en, es, ja, ar, zh, fr, ru };

export const languages = [
  { code: 'en' },
  { code: 'es' },
  { code: 'ja' },
  { code: 'ar' },
  { code: 'zh' },
  { code: 'fr' },
  { code: 'ru' },
];

export function detectLanguage() {
  const saved = localStorage.getItem('chatter3_lang');
  if (saved && translations[saved]) return saved;

  const browserLang = navigator.language.slice(0, 2);
  if (translations[browserLang]) {
    localStorage.setItem('chatter3_lang', browserLang);
    return browserLang;
  }

  return 'en';
}

export function getLangFromPath(path) {
  if (path.startsWith('/es/')) return 'es';
  if (path.startsWith('/ja/')) return 'ja';
  if (path.startsWith('/ar/')) return 'ar';
  if (path.startsWith('/zh/')) return 'zh';
  if (path.startsWith('/fr/')) return 'fr';
  if (path.startsWith('/ru/')) return 'ru';
  return 'en';
}

export function getPathWithoutLang(path) {
  return path.replace(/^\/(es|ja|ar|zh|fr|ru)/, '') || '/';
}

export function getLocalizedPath(path, lang) {
  const cleanPath = getPathWithoutLang(path);
  if (lang === 'en') return cleanPath;
  return `/${lang}${cleanPath}`;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('chatter3_lang', lang);
  }
}

export function getTranslations(lang) {
  return translations[lang] || translations.en;
}

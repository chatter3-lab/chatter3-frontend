import en from './en.json';
import es from './es.json';

export const languages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
];

export function detectLanguage() {
  const saved = localStorage.getItem('chatter3_lang');
  if (saved === 'en' || saved === 'es') return saved;

  const fullLang = navigator.language.toLowerCase();
  if (fullLang.startsWith('es')) return 'es';

  return 'en';
}

export function getLangFromPath(path) {
  if (path.startsWith('/es/')) return 'es';
  return 'en';
}

export function getPathWithoutLang(path) {
  if (path.startsWith('/es/')) return path.slice(3) || '/';
  return path;
}

export function getLocalizedPath(path, lang) {
  const cleanPath = getPathWithoutLang(path);
  if (lang === 'es') return '/es' + cleanPath;
  return cleanPath;
}

export function setLanguage(lang) {
  if (lang === 'en' || lang === 'es') {
    localStorage.setItem('chatter3_lang', lang);
  }
}

export function getTranslations(lang) {
  if (lang === 'es') return es;
  return en;
}

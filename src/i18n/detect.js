import en from './en.json';
import es from './es.json';
import ja from './ja.json';

const translations = { en, es, ja };

export const languages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'ja', flag: '🇯🇵' },
];

export function detectLanguage() {
  const saved = localStorage.getItem('chatter3_lang');
  if (translations[saved]) return saved;

  const fullLang = navigator.language.toLowerCase();
  if (fullLang.startsWith('es')) return 'es';
  if (fullLang.startsWith('ja')) return 'ja';

  return 'en';
}

export function getLangFromPath(path) {
  for (const { code } of languages) {
    if (code === 'en') continue;
    if (path.startsWith('/' + code + '/')) return code;
  }
  return 'en';
}

export function getPathWithoutLang(path) {
  for (const { code } of languages) {
    if (code === 'en') continue;
    if (path.startsWith('/' + code + '/')) return path.slice(code.length + 1) || '/';
  }
  return path;
}

export function getLocalizedPath(path, lang) {
  const cleanPath = getPathWithoutLang(path);
  if (lang === 'en') return cleanPath;
  return '/' + lang + cleanPath;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('chatter3_lang', lang);
  }
}

export function getTranslations(lang) {
  return translations[lang] || translations.en;
}

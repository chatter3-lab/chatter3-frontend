import en from './en.json';
import es from './es.json';
import ja from './ja.json';
import zh from './zh.json';
import bn from './bn.json';
import fr from './fr.json';
import ar from './ar.json';
import ru from './ru.json';

const translations = { en, ja, bn, zh, es, fr, ar, ru };

export const languages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'bn', flag: '🇧🇩' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'ru', flag: '🇷🇺' },
];

export function detectLanguage() {
  const saved = localStorage.getItem('chatter3_lang');
  if (translations[saved]) return saved;

  const fullLang = navigator.language.toLowerCase();
  if (fullLang.startsWith('es')) return 'es';
  if (fullLang.startsWith('ja')) return 'ja';
  if (fullLang.startsWith('zh')) return 'zh';
  if (fullLang.startsWith('bn')) return 'bn';
  if (fullLang.startsWith('fr')) return 'fr';
  if (fullLang.startsWith('ar')) return 'ar';
  if (fullLang.startsWith('ru')) return 'ru';

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

import en from './en.json';
import es from './es.json';
import ja from './ja.json';
import ar from './ar.json';
import zh from './zh.json';
import fr from './fr.json';
import ru from './ru.json';
import hi from './hi.json';
import bn from './bn.json';
import pt from './pt.json';
import ur from './ur.json';
import id from './id.json';
import de from './de.json';
import mr from './mr.json';
import te from './te.json';
import tr from './tr.json';
import ta from './ta.json';
import vi from './vi.json';
import pcm from './pcm.json';
import yue from './yue.json';

export const translations = { en, es, ja, ar, zh, fr, ru, hi, bn, pt, ur, id, de, mr, te, tr, ta, vi, pcm, yue };

export const languages = [
  { code: 'en' },
  { code: 'es' },
  { code: 'zh' },
  { code: 'hi' },
  { code: 'ar' },
  { code: 'bn' },
  { code: 'fr' },
  { code: 'pt' },
  { code: 'ru' },
  { code: 'ja' },
  { code: 'de' },
  { code: 'mr' },
  { code: 'te' },
  { code: 'tr' },
  { code: 'ta' },
  { code: 'vi' },
  { code: 'id' },
  { code: 'ur' },
  { code: 'pcm' },
  { code: 'yue' },
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
  for (const { code } of languages) {
    if (code === 'en') continue;
    if (path.startsWith(`/${code}/`)) return code;
  }
  return 'en';
}

export function getPathWithoutLang(path) {
  return path.replace(/^\/(es|ja|ar|zh|fr|ru|hi|bn|pt|ur|id|de|mr|te|tr|ta|vi|pcm|yue)/, '') || '/';
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

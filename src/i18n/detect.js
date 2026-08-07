import en from './en.json';

const translationCache = { en };

const translationModules = {
  es: () => import('./es.json'),
  ja: () => import('./ja.json'),
  ar: () => import('./ar.json'),
  zh: () => import('./zh.json'),
  fr: () => import('./fr.json'),
  ru: () => import('./ru.json'),
  hi: () => import('./hi.json'),
  bn: () => import('./bn.json'),
  pt: () => import('./pt.json'),
  ur: () => import('./ur.json'),
  id: () => import('./id.json'),
  de: () => import('./de.json'),
  mr: () => import('./mr.json'),
  te: () => import('./te.json'),
  tr: () => import('./tr.json'),
  ta: () => import('./ta.json'),
  vi: () => import('./vi.json'),
  pcm: () => import('./pcm.json'),
  yue: () => import('./yue.json'),
};

export const languages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'hi', flag: '🇮🇳' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'bn', flag: '🇧🇩' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'pt', flag: '🇧🇷' },
  { code: 'ru', flag: '🇷🇺' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'mr', flag: '🇮🇳' },
  { code: 'te', flag: '🇮🇳' },
  { code: 'tr', flag: '🇹🇷' },
  { code: 'ta', flag: '🇱🇰' },
  { code: 'vi', flag: '🇻🇳' },
  { code: 'id', flag: '🇮🇩' },
  { code: 'ur', flag: '🇵🇰' },
  { code: 'pcm', flag: '🇳🇬' },
  { code: 'yue', flag: '🇭🇰' },
];

export function detectLanguage() {
  const saved = localStorage.getItem('chatter3_lang');
  if (saved && (saved === 'en' || translationModules[saved])) return saved;

  const fullLang = navigator.language.toLowerCase();
  const shortLang = fullLang.slice(0, 2);

  if (fullLang.includes('zh-hk') || fullLang.includes('zh-hant')) {
    localStorage.setItem('chatter3_lang', 'yue');
    return 'yue';
  }
  if (fullLang.includes('en-ng') || fullLang === 'pcm') {
    localStorage.setItem('chatter3_lang', 'pcm');
    return 'pcm';
  }

  if (translationModules[shortLang]) {
    localStorage.setItem('chatter3_lang', shortLang);
    return shortLang;
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
  if (lang === 'en' || translationModules[lang]) {
    localStorage.setItem('chatter3_lang', lang);
    if (lang !== 'en') loadTranslation(lang);
  }
}

function loadTranslation(lang) {
  if (translationCache[lang]) return Promise.resolve(translationCache[lang]);
  const loader = translationModules[lang];
  if (!loader) return Promise.resolve(translationCache.en);
  return loader().then(m => {
    translationCache[lang] = m.default || m;
    return translationCache[lang];
  });
}

export function getTranslations(lang) {
  return translationCache[lang] || translationCache.en;
}

// Preload current language on module load
const currentLang = localStorage.getItem('chatter3_lang') || 'en';
if (currentLang !== 'en') {
  loadTranslation(currentLang);
}

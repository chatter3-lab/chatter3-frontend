import { useEffect } from 'react';
import { languages } from '../i18n/detect';

const BASE_URL = 'https://app.chatter3.com';

export default function SEOHead({ title, description, canonical, lang, pageKey }) {
  useEffect(() => {
    if (title) document.title = title;
    
    const updateMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    
    const updateProperty = (prop, content) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    
    const updateLink = (rel, href, attrs = {}) => {
      let selector = `link[rel="${rel}"]`;
      if (attrs.hreflang) selector += `[hreflang="${attrs.hreflang}"]`;
      else if (attrs.media) selector += `[media="${attrs.media}"]`;
      
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };
    
    if (description) updateMeta('description', description);
    if (canonical) updateLink('canonical', canonical);
    
    // Open Graph
    updateProperty('og:title', title || '');
    updateProperty('og:description', description || '');
    updateProperty('og:url', canonical || '');
    updateProperty('og:locale', lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : 'ja_JP');
    
    // hreflang alternates
    const pagePath = canonical ? new URL(canonical).pathname : '/';
    languages.forEach(({ code }) => {
      const href = code === 'en' 
        ? `${BASE_URL}${pagePath.replace(/^\/(es|ja)/, '') || '/'}`
        : `${BASE_URL}/${code}${pagePath.replace(/^\/(es|ja)/, '')}`;
      updateLink('alternate', href, { hreflang: code });
    });
    // x-default
    updateLink('alternate', `${BASE_URL}${pagePath.replace(/^\/(es|ja)/, '') || '/'}`, { hreflang: 'x-default' });
    
    // HTML lang attribute
    document.documentElement.setAttribute('lang', lang || 'en');
  }, [title, description, canonical, lang, pageKey]);
  
  return null;
}

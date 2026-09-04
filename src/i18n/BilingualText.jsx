import { useTranslation } from './useTranslation';

export function BilingualText({ children, englishOnly = false, style = {} }) {
  const { lang } = useTranslation();
  
  if (englishOnly || lang === 'en') {
    return <span style={style}>{children}</span>;
  }

  return (
    <div className="bilingual-text" style={style}>
      <div style={{ fontSize: '1em' }}>{children}</div>
    </div>
  );
}

export function useBilingualContent() {
  const { t, lang } = useTranslation();
  
  const isEnglish = lang === 'en';
  
  const getBilingual = (englishContent, otherContent) => {
    return isEnglish ? englishContent : otherContent || englishContent;
  };

  return { isEnglish, getBilingual };
}
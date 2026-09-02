import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function FreeEnglishPracticePage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/free-english-practice`;
  const faqSchema={
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":t.freeEnglishPractice.faq1Question,"acceptedAnswer":{"@type":"Answer","text":t.freeEnglishPractice.faq1Answer}},
      {"@type":"Question","name":t.freeEnglishPractice.faq2Question,"acceptedAnswer":{"@type":"Answer","text":t.freeEnglishPractice.faq2Answer}},
      {"@type":"Question","name":t.freeEnglishPractice.faq3Question,"acceptedAnswer":{"@type":"Answer","text":t.freeEnglishPractice.faq3Answer}},
      {"@type":"Question","name":t.freeEnglishPractice.faq4Question,"acceptedAnswer":{"@type":"Answer","text":t.freeEnglishPractice.faq4Answer}}
    ]
  };
  return(
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
      <SEOHead title={t.meta.freeEnglishPractice.title} description={t.meta.freeEnglishPractice.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.freeEnglishPractice.title}</h1>
        <p>{t.freeEnglishPractice.subtitle}</p>
        <a href="/" className="lp-cta">{t.freeEnglishPractice.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.freeEnglishPractice.whyTitle}</h2>
        <p>{t.freeEnglishPractice.whyP1}</p>
        <p>{t.freeEnglishPractice.whyP2}</p>
        <p>{t.freeEnglishPractice.whyP3}</p>
      </div>
      <div className="lp-section">
        <h2>{t.freeEnglishPractice.whatTitle}</h2>
        <p>{t.freeEnglishPractice.whatP1}</p>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">📹</div><h3>{t.freeEnglishPractice.feature1Title}</h3><p>{t.freeEnglishPractice.feature1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌍</div><h3>{t.freeEnglishPractice.feature2Title}</h3><p>{t.freeEnglishPractice.feature2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🏆</div><h3>{t.freeEnglishPractice.feature3Title}</h3><p>{t.freeEnglishPractice.feature3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">⚡</div><h3>{t.freeEnglishPractice.feature4Title}</h3><p>{t.freeEnglishPractice.feature4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.freeEnglishPractice.howTitle}</h2>
        <p>{t.freeEnglishPractice.howP1}</p>
        <div className="lp-steps">
          <div className="lp-step"><div className="lp-step-num">1</div><div><h3>{t.freeEnglishPractice.step1Title}</h3><p>{t.freeEnglishPractice.step1Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">2</div><div><h3>{t.freeEnglishPractice.step2Title}</h3><p>{t.freeEnglishPractice.step2Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">3</div><div><h3>{t.freeEnglishPractice.step3Title}</h3><p>{t.freeEnglishPractice.step3Desc}</p></div></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.freeEnglishPractice.benefitsTitle}</h2>
        <p>{t.freeEnglishPractice.benefitsP1}</p>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">💰</div><h3>{t.freeEnglishPractice.benefit1Title}</h3><p>{t.freeEnglishPractice.benefit1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌐</div><h3>{t.freeEnglishPractice.benefit2Title}</h3><p>{t.freeEnglishPractice.benefit2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🔄</div><h3>{t.freeEnglishPractice.benefit3Title}</h3><p>{t.freeEnglishPractice.benefit3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💪</div><h3>{t.freeEnglishPractice.benefit4Title}</h3><p>{t.freeEnglishPractice.benefit4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.freeEnglishPractice.faqTitle}</h2>
        <div className="lp-faq">
          <div className="lp-faq-item"><h3>{t.freeEnglishPractice.faq1Question}</h3><p>{t.freeEnglishPractice.faq1Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.freeEnglishPractice.faq2Question}</h3><p>{t.freeEnglishPractice.faq2Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.freeEnglishPractice.faq3Question}</h3><p>{t.freeEnglishPractice.faq3Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.freeEnglishPractice.faq4Question}</h3><p>{t.freeEnglishPractice.faq4Answer}</p></div>
        </div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.freeEnglishPractice.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.freeEnglishPractice.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.freeEnglishPractice.bottomCta}</a>
      </div>
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-links">
            <a href={`${prefix}/`}>{t.nav.home}</a>
            <a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a>
            <a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a>
            <a href={`${prefix}/free-english-practice`}>{t?.footer?.freePractice||'Free Practice'}</a>
            <a href={`${prefix}/english-conversation-app`}>{t?.footer?.conversationApp||'Conversation App'}</a>
            <a href={`${prefix}/blog`}>{t.nav.blog}</a>
            <a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a>
            <a href={`${prefix}/chatter3-vs-italki`}>{t?.footer?.vsItalki||'vs italki'}</a>
            <a href={`${prefix}/chatter3-vs-cambly`}>{t?.footer?.vsCambly||'vs Cambly'}</a>
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

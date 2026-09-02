import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function ForBeginnersPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/for-beginners`;
  const faqSchema={
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":t.forBeginners.faq1Question,"acceptedAnswer":{"@type":"Answer","text":t.forBeginners.faq1Answer}},
      {"@type":"Question","name":t.forBeginners.faq2Question,"acceptedAnswer":{"@type":"Answer","text":t.forBeginners.faq2Answer}},
      {"@type":"Question","name":t.forBeginners.faq3Question,"acceptedAnswer":{"@type":"Answer","text":t.forBeginners.faq3Answer}}
    ]
  };
  return(
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
      <SEOHead title={t.meta.forBeginners.title} description={t.meta.forBeginners.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`} className="active">{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.forBeginners.title}</h1>
        <p>{t.forBeginners.subtitle}</p>
        <a href="/" className="lp-cta">{t.forBeginners.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.forBeginners.whyTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">🌱</div><h3>{t.forBeginners.feature1Title}</h3><p>{t.forBeginners.feature1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">⏰</div><h3>{t.forBeginners.feature2Title}</h3><p>{t.forBeginners.feature2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🎯</div><h3>{t.forBeginners.feature3Title}</h3><p>{t.forBeginners.feature3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💪</div><h3>{t.forBeginners.feature4Title}</h3><p>{t.forBeginners.feature4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.forBeginners.stepsTitle}</h2>
        <div className="lp-steps">
          <div className="lp-step"><div className="lp-step-num">1</div><div><h3>{t.forBeginners.step1Title}</h3><p>{t.forBeginners.step1Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">2</div><div><h3>{t.forBeginners.step2Title}</h3><p>{t.forBeginners.step2Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">3</div><div><h3>{t.forBeginners.step3Title}</h3><p>{t.forBeginners.step3Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">4</div><div><h3>{t.forBeginners.step4Title}</h3><p>{t.forBeginners.step4Desc}</p></div></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.forBeginners.tipsTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><h3>{t.forBeginners.tip1Title}</h3><p>{t.forBeginners.tip1Desc}</p></div>
          <div className="lp-card"><h3>{t.forBeginners.tip2Title}</h3><p>{t.forBeginners.tip2Desc}</p></div>
          <div className="lp-card"><h3>{t.forBeginners.tip3Title}</h3><p>{t.forBeginners.tip3Desc}</p></div>
          <div className="lp-card"><h3>{t.forBeginners.tip4Title}</h3><p>{t.forBeginners.tip4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section lp-faq">
        <h2>{t.forBeginners.faqTitle}</h2>
        <div className="lp-faq-item"><h3>{t.forBeginners.faq1Question}</h3><p>{t.forBeginners.faq1Answer}</p></div>
        <div className="lp-faq-item"><h3>{t.forBeginners.faq2Question}</h3><p>{t.forBeginners.faq2Answer}</p></div>
        <div className="lp-faq-item"><h3>{t.forBeginners.faq3Question}</h3><p>{t.forBeginners.faq3Answer}</p></div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.forBeginners.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.forBeginners.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.forBeginners.bottomCta}</a>
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
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

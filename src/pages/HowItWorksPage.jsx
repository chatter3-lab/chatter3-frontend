import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function HowItWorksPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/how-it-works`;
  const howToSchema={
    "@context":"https://schema.org",
    "@type":"HowTo",
    "name":t.howItWorks.title,
    "description":t.howItWorks.subtitle,
    "step":[
      {"@type":"HowToStep","name":t.howItWorks.step1Title,"text":t.howItWorks.step1Desc},
      {"@type":"HowToStep","name":t.howItWorks.step2Title,"text":t.howItWorks.step2Desc},
      {"@type":"HowToStep","name":t.howItWorks.step3Title,"text":t.howItWorks.step3Desc}
    ]
  };
  const faqSchema={
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":t.howItWorks.faq1Question,"acceptedAnswer":{"@type":"Answer","text":t.howItWorks.faq1Answer}},
      {"@type":"Question","name":t.howItWorks.faq2Question,"acceptedAnswer":{"@type":"Answer","text":t.howItWorks.faq2Answer}},
      {"@type":"Question","name":t.howItWorks.faq3Question,"acceptedAnswer":{"@type":"Answer","text":t.howItWorks.faq3Answer}},
      {"@type":"Question","name":t.howItWorks.faq4Question,"acceptedAnswer":{"@type":"Answer","text":t.howItWorks.faq4Answer}}
    ]
  };
  return(
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(howToSchema)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
      <SEOHead title={t.meta.howItWorks.title} description={t.meta.howItWorks.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`} className="active">{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.howItWorks.title}</h1>
        <p>{t.howItWorks.subtitle}</p>
        <a href="/" className="lp-cta">{t.howItWorks.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.howItWorks.stepsTitle}</h2>
        <div className="lp-steps">
          <div className="lp-step"><div className="lp-step-num">1</div><div><h3>{t.howItWorks.step1Title}</h3><p>{t.howItWorks.step1Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">2</div><div><h3>{t.howItWorks.step2Title}</h3><p>{t.howItWorks.step2Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">3</div><div><h3>{t.howItWorks.step3Title}</h3><p>{t.howItWorks.step3Desc}</p></div></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.howItWorks.whyTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">🎯</div><h3>{t.howItWorks.feature1Title}</h3><p>{t.howItWorks.feature1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌍</div><h3>{t.howItWorks.feature2Title}</h3><p>{t.howItWorks.feature2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">⚡</div><h3>{t.howItWorks.feature3Title}</h3><p>{t.howItWorks.feature3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🏆</div><h3>{t.howItWorks.feature4Title}</h3><p>{t.howItWorks.feature4Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🔒</div><h3>{t.howItWorks.feature5Title}</h3><p>{t.howItWorks.feature5Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💰</div><h3>{t.howItWorks.feature6Title}</h3><p>{t.howItWorks.feature6Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.howItWorks.faqTitle}</h2>
        <div className="lp-faq">
          <div className="lp-faq-item"><h3>{t.howItWorks.faq1Question}</h3><p>{t.howItWorks.faq1Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.howItWorks.faq2Question}</h3><p>{t.howItWorks.faq2Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.howItWorks.faq3Question}</h3><p>{t.howItWorks.faq3Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.howItWorks.faq4Question}</h3><p>{t.howItWorks.faq4Answer}</p></div>
        </div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.howItWorks.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.howItWorks.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.howItWorks.bottomCta}</a>
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

import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function EnglishConversationAppPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/english-conversation-app`;
  const faqSchema={
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":t.englishConversationApp.faq1Question,"acceptedAnswer":{"@type":"Answer","text":t.englishConversationApp.faq1Answer}},
      {"@type":"Question","name":t.englishConversationApp.faq2Question,"acceptedAnswer":{"@type":"Answer","text":t.englishConversationApp.faq2Answer}},
      {"@type":"Question","name":t.englishConversationApp.faq3Question,"acceptedAnswer":{"@type":"Answer","text":t.englishConversationApp.faq3Answer}},
      {"@type":"Question","name":t.englishConversationApp.faq4Question,"acceptedAnswer":{"@type":"Answer","text":t.englishConversationApp.faq4Answer}}
    ]
  };
  return(
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
      <SEOHead title={t.meta.englishConversationApp.title} description={t.meta.englishConversationApp.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.englishConversationApp.title}</h1>
        <p>{t.englishConversationApp.subtitle}</p>
        <a href="/" className="lp-cta">{t.englishConversationApp.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.englishConversationApp.whatTitle}</h2>
        <p>{t.englishConversationApp.whatP1}</p>
        <p>{t.englishConversationApp.whatP2}</p>
        <p>{t.englishConversationApp.whatP3}</p>
      </div>
      <div className="lp-section">
        <h2>{t.englishConversationApp.videoTitle}</h2>
        <p>{t.englishConversationApp.videoP1}</p>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">🗣️</div><h3>{t.englishConversationApp.video1Title}</h3><p>{t.englishConversationApp.video1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">👀</div><h3>{t.englishConversationApp.video2Title}</h3><p>{t.englishConversationApp.video2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🔊</div><h3>{t.englishConversationApp.video3Title}</h3><p>{t.englishConversationApp.video3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🎯</div><h3>{t.englishConversationApp.video4Title}</h3><p>{t.englishConversationApp.video4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.englishConversationApp.featuresTitle}</h2>
        <p>{t.englishConversationApp.featuresP1}</p>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">⚡</div><h3>{t.englishConversationApp.feature1Title}</h3><p>{t.englishConversationApp.feature1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌱</div><h3>{t.englishConversationApp.feature2Title}</h3><p>{t.englishConversationApp.feature2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌍</div><h3>{t.englishConversationApp.feature3Title}</h3><p>{t.englishConversationApp.feature3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🏆</div><h3>{t.englishConversationApp.feature4Title}</h3><p>{t.englishConversationApp.feature4Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🔒</div><h3>{t.englishConversationApp.feature5Title}</h3><p>{t.englishConversationApp.feature5Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">📱</div><h3>{t.englishConversationApp.feature6Title}</h3><p>{t.englishConversationApp.feature6Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.englishConversationApp.startedTitle}</h2>
        <p>{t.englishConversationApp.startedP1}</p>
        <div className="lp-steps">
          <div className="lp-step"><div className="lp-step-num">1</div><div><h3>{t.englishConversationApp.step1Title}</h3><p>{t.englishConversationApp.step1Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">2</div><div><h3>{t.englishConversationApp.step2Title}</h3><p>{t.englishConversationApp.step2Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">3</div><div><h3>{t.englishConversationApp.step3Title}</h3><p>{t.englishConversationApp.step3Desc}</p></div></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.englishConversationApp.faqTitle}</h2>
        <div className="lp-faq">
          <div className="lp-faq-item"><h3>{t.englishConversationApp.faq1Question}</h3><p>{t.englishConversationApp.faq1Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.englishConversationApp.faq2Question}</h3><p>{t.englishConversationApp.faq2Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.englishConversationApp.faq3Question}</h3><p>{t.englishConversationApp.faq3Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.englishConversationApp.faq4Question}</h3><p>{t.englishConversationApp.faq4Answer}</p></div>
        </div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.englishConversationApp.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.englishConversationApp.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.englishConversationApp.bottomCta}</a>
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

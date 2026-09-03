import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function Chatter3VsItalkiPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/chatter3-vs-italki`;
  const faqSchema={
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":t.chatter3VsItalki.faq1Question,"acceptedAnswer":{"@type":"Answer","text":t.chatter3VsItalki.faq1Answer}},
      {"@type":"Question","name":t.chatter3VsItalki.faq2Question,"acceptedAnswer":{"@type":"Answer","text":t.chatter3VsItalki.faq2Answer}},
      {"@type":"Question","name":t.chatter3VsItalki.faq3Question,"acceptedAnswer":{"@type":"Answer","text":t.chatter3VsItalki.faq3Answer}},
      {"@type":"Question","name":t.chatter3VsItalki.faq4Question,"acceptedAnswer":{"@type":"Answer","text":t.chatter3VsItalki.faq4Answer}}
    ]
  };
  const breadcrumbSchema={
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":"https://app.chatter3.com"},
      {"@type":"ListItem","position":2,"name":"Chatter3 vs italki","item":"https://app.chatter3.com/chatter3-vs-italki"}
    ]
  };
  return(
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema)}}/>
      <SEOHead title={t.meta.chatter3VsItalki.title} description={t.meta.chatter3VsItalki.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.chatter3VsItalki.title}</h1>
        <p>{t.chatter3VsItalki.subtitle}</p>
        <a href="/" className="lp-cta">{t.chatter3VsItalki.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsItalki.overviewTitle}</h2>
        <p>{t.chatter3VsItalki.overviewP1}</p>
        <p>{t.chatter3VsItalki.overviewP2}</p>
        <p>{t.chatter3VsItalki.overviewP3}</p>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsItalki.compareTitle}</h2>
        <table style={{width:'100%',borderCollapse:'collapse',margin:'1.5rem 0',fontSize:'0.95rem'}}>
          <thead>
            <tr style={{background:'rgba(99,102,241,0.15)',textAlign:'left'}}>
              <th style={{padding:'12px 16px',borderBottom:'2px solid rgba(99,102,241,0.3)'}}>{t.chatter3VsItalki.priceFeature}</th>
              <th style={{padding:'12px 16px',borderBottom:'2px solid rgba(99,102,241,0.3)'}}>Chatter3</th>
              <th style={{padding:'12px 16px',borderBottom:'2px solid rgba(99,102,241,0.3)'}}>italki</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsItalki.priceFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.priceChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.priceItalki}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsItalki.videoFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.videoChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.videoItalki}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsItalki.nativeFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.nativeChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.nativeItalki}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsItalki.scheduleFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.scheduleChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.scheduleItalki}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsItalki.rewardFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.rewardChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.rewardItalki}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsItalki.levelFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.levelChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsItalki.levelItalki}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsItalki.whoTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">💰</div><h3>{t.chatter3VsItalki.who1Title}</h3><p>{t.chatter3VsItalki.who1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">📅</div><h3>{t.chatter3VsItalki.who2Title}</h3><p>{t.chatter3VsItalki.who2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌍</div><h3>{t.chatter3VsItalki.who3Title}</h3><p>{t.chatter3VsItalki.who3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💪</div><h3>{t.chatter3VsItalki.who4Title}</h3><p>{t.chatter3VsItalki.who4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsItalki.whoItalkiTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">📚</div><h3>{t.chatter3VsItalki.whoItalki1Title}</h3><p>{t.chatter3VsItalki.whoItalki1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🎓</div><h3>{t.chatter3VsItalki.whoItalki2Title}</h3><p>{t.chatter3VsItalki.whoItalki2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💼</div><h3>{t.chatter3VsItalki.whoItalki3Title}</h3><p>{t.chatter3VsItalki.whoItalki3Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsItalki.verdictTitle}</h2>
        <p>{t.chatter3VsItalki.verdictP1}</p>
        <p>{t.chatter3VsItalki.verdictP2}</p>
        <p>{t.chatter3VsItalki.verdictP3}</p>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsItalki.faqTitle}</h2>
        <div className="lp-faq">
          <div className="lp-faq-item"><h3>{t.chatter3VsItalki.faq1Question}</h3><p>{t.chatter3VsItalki.faq1Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.chatter3VsItalki.faq2Question}</h3><p>{t.chatter3VsItalki.faq2Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.chatter3VsItalki.faq3Question}</h3><p>{t.chatter3VsItalki.faq3Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.chatter3VsItalki.faq4Question}</h3><p>{t.chatter3VsItalki.faq4Answer}</p></div>
        </div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.chatter3VsItalki.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.chatter3VsItalki.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.chatter3VsItalki.bottomCta}</a>
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

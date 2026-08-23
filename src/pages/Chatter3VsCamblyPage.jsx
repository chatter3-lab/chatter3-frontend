import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function Chatter3VsCamblyPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/chatter3-vs-cambly`;
  return(
    <div className="lp">
      <SEOHead title={t.meta.chatter3VsCambly.title} description={t.meta.chatter3VsCambly.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.chatter3VsCambly.title}</h1>
        <p>{t.chatter3VsCambly.subtitle}</p>
        <a href="/" className="lp-cta">{t.chatter3VsCambly.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsCambly.overviewTitle}</h2>
        <p>{t.chatter3VsCambly.overviewP1}</p>
        <p>{t.chatter3VsCambly.overviewP2}</p>
        <p>{t.chatter3VsCambly.overviewP3}</p>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsCambly.compareTitle}</h2>
        <table style={{width:'100%',borderCollapse:'collapse',margin:'1.5rem 0',fontSize:'0.95rem'}}>
          <thead>
            <tr style={{background:'rgba(99,102,241,0.15)',textAlign:'left'}}>
              <th style={{padding:'12px 16px',borderBottom:'2px solid rgba(99,102,241,0.3)'}}>Feature</th>
              <th style={{padding:'12px 16px',borderBottom:'2px solid rgba(99,102,241,0.3)'}}>Chatter3</th>
              <th style={{padding:'12px 16px',borderBottom:'2px solid rgba(99,102,241,0.3)'}}>Cambly</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsCambly.priceFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.priceChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.priceCambly}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsCambly.videoFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.videoChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.videoCambly}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsCambly.speakersFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.speakersChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.speakersCambly}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsCambly.scheduleFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.scheduleChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.scheduleCambly}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsCambly.rewardFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.rewardChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.rewardCambly}</td>
            </tr>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <td style={{padding:'12px 16px',fontWeight:'600'}}>{t.chatter3VsCambly.contentFeature}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.contentChatter3}</td>
              <td style={{padding:'12px 16px'}}>{t.chatter3VsCambly.contentCambly}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsCambly.whoTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">💰</div><h3>{t.chatter3VsCambly.who1Title}</h3><p>{t.chatter3VsCambly.who1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">📅</div><h3>{t.chatter3VsCambly.who2Title}</h3><p>{t.chatter3VsCambly.who2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌍</div><h3>{t.chatter3VsCambly.who3Title}</h3><p>{t.chatter3VsCambly.who3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🎯</div><h3>{t.chatter3VsCambly.who4Title}</h3><p>{t.chatter3VsCambly.who4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsCambly.whoCamblyTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">✏️</div><h3>{t.chatter3VsCambly.whoCambly1Title}</h3><p>{t.chatter3VsCambly.whoCambly1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💼</div><h3>{t.chatter3VsCambly.whoCambly2Title}</h3><p>{t.chatter3VsCambly.whoCambly2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🗣️</div><h3>{t.chatter3VsCambly.whoCambly3Title}</h3><p>{t.chatter3VsCambly.whoCambly3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">📋</div><h3>{t.chatter3VsCambly.whoCambly4Title}</h3><p>{t.chatter3VsCambly.whoCambly4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsCambly.verdictTitle}</h2>
        <p>{t.chatter3VsCambly.verdictP1}</p>
        <p>{t.chatter3VsCambly.verdictP2}</p>
        <p>{t.chatter3VsCambly.verdictP3}</p>
      </div>
      <div className="lp-section">
        <h2>{t.chatter3VsCambly.faqTitle}</h2>
        <div className="lp-faq">
          <div className="lp-faq-item"><h3>{t.chatter3VsCambly.faq1Question}</h3><p>{t.chatter3VsCambly.faq1Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.chatter3VsCambly.faq2Question}</h3><p>{t.chatter3VsCambly.faq2Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.chatter3VsCambly.faq3Question}</h3><p>{t.chatter3VsCambly.faq3Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.chatter3VsCambly.faq4Question}</h3><p>{t.chatter3VsCambly.faq4Answer}</p></div>
        </div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.chatter3VsCambly.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.chatter3VsCambly.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.chatter3VsCambly.bottomCta}</a>
      </div>
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-links">
            <a href={`${prefix}/`}>{t.nav.home}</a>
            <a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a>
            <a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a>
            <a href={`${prefix}/free-english-practice`}>Free Practice</a>
            <a href={`${prefix}/english-conversation-app`}>Conversation App</a>
            <a href={`${prefix}/blog`}>{t.nav.blog}</a>
            <a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a>
            <a href={`${prefix}/chatter3-vs-italki`}>vs italki</a>
            <a href={`${prefix}/chatter3-vs-cambly`}>vs Cambly</a>
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

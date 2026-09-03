import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function RefundPolicyPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/refund`;
  return(
    <div className="lp">
      <SEOHead title="Refund Policy — Chatter3" description="Chatter3 Refund Policy. Learn about our refund and cancellation terms." canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/></div></nav>
      <div style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:'1.5rem'}}>Refund Policy</h1>
        <p style={{fontSize:'.85rem',color:'#6b7280',marginBottom:'2rem'}}>Last updated: September 3, 2026</p>

        <h2>1. Free Service</h2>
        <p>Chatter3 is a free service. No payment is required to use the core features of the platform, including video calls, vocabulary tracking, and daily goals.</p>

        <h2>2. Reward Points</h2>
        <p>Reward Points (RP) and Free Points (FP) are virtual currencies earned through platform activity. They have no monetary value, cannot be purchased, and cannot be exchanged for cash or refunded.</p>

        <h2>3. Future Purchases</h2>
        <p>If we introduce paid features in the future, this Refund Policy will be updated accordingly. Refund terms for any paid features will be clearly stated at the time of purchase.</p>

        <h2>4. Account Deletion</h2>
        <p>You may delete your account at any time through your profile settings. Deleting your account will permanently remove all your data, including any accumulated points. This action cannot be undone.</p>

        <h2>5. Contact</h2>
        <p>For refund inquiries, contact us at <a href="mailto:support@chatter3.com" style={{color:'#4f46e5'}}>support@chatter3.com</a>.</p>
      </div>
      <footer className="lp-footer"><div className="lp-footer-inner"><p>© 2026 Chatter3. All rights reserved.</p></div></footer>
    </div>
  );
}

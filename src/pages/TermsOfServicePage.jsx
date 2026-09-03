import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function TermsOfServicePage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/terms`;
  return(
    <div className="lp">
      <SEOHead title="Terms of Service — Chatter3" description="Chatter3 Terms of Service. Read the rules and guidelines for using our platform." canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/></div></nav>
      <div style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:'1.5rem'}}>Terms of Service</h1>
        <p style={{fontSize:'.85rem',color:'#6b7280',marginBottom:'2rem'}}>Last updated: September 3, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Chatter3 ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 13 years old to use Chatter3. By using the Service, you represent and warrant that you meet this age requirement.</p>

        <h2>3. Account Registration</h2>
        <p>You agree to provide accurate information during registration and to keep your account credentials secure. You are responsible for all activity under your account.</p>

        <h2>4. Acceptable Use</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use the Service for any illegal purpose</li>
          <li>Harass, bully, or intimidate other users</li>
          <li>Share inappropriate, offensive, or explicit content</li>
          <li>Attempt to exploit or manipulate the reward points system</li>
          <li>Create multiple accounts</li>
          <li>Use automated tools or bots</li>
          <li>Record video calls without the other party's consent</li>
        </ul>

        <h2>5. Video Calls</h2>
        <p>Video calls are peer-to-peer and not recorded by Chatter3. You are responsible for your behavior during calls. Recording calls without consent is prohibited and may result in account termination.</p>

        <h2>6. Reward Points</h2>
        <p>Reward Points (RP) and Free Points (FP) have no monetary value and cannot be exchanged for cash. We reserve the right to modify the points system at any time.</p>

        <h2>7. Intellectual Property</h2>
        <p>All content, trademarks, and intellectual property on Chatter3 are owned by Chatter3 or its licensors. You may not reproduce, distribute, or create derivative works without our written consent.</p>

        <h2>8. Termination</h2>
        <p>We reserve the right to suspend or terminate your account at our discretion, including for violations of these Terms. You may delete your account at any time through your profile settings.</p>

        <h2>9. Limitation of Liability</h2>
        <p>Chatter3 is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service.</p>

        <h2>10. Changes to Terms</h2>
        <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>

        <h2>11. Contact</h2>
        <p>Questions about these Terms? Contact us at <a href="mailto:legal@chatter3.com" style={{color:'#4f46e5'}}>legal@chatter3.com</a>.</p>
      </div>
      <footer className="lp-footer"><div className="lp-footer-inner"><p>© 2026 Chatter3. All rights reserved.</p></div></footer>
    </div>
  );
}

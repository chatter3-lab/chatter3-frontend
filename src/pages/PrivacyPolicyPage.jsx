import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export default function PrivacyPolicyPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/privacy`;
  return(
    <div className="lp">
      <SEOHead title="Privacy Policy — Chatter3" description="Chatter3 Privacy Policy. Learn how we collect, use, and protect your personal information." canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/></div></nav>
      <div style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem'}}>
        <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:'1.5rem'}}>Privacy Policy</h1>
        <p style={{fontSize:'.85rem',color:'#6b7280',marginBottom:'2rem'}}>Last updated: September 3, 2026</p>
        
        <h2>1. Information We Collect</h2>
        <p>When you use Chatter3, we collect:</p>
        <ul>
          <li><strong>Account Information:</strong> Email address, username, display name, native language, country, and English proficiency level.</li>
          <li><strong>Profile Data:</strong> Avatar image (if uploaded), bio, and learning preferences.</li>
          <li><strong>Usage Data:</strong> Conversation sessions, vocabulary entries, daily goals, achievement progress, and reputation scores.</li>
          <li><strong>Device Information:</strong> Browser type, device type, and operating system (for compatibility).</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve the Chatter3 service</li>
          <li>Match you with conversation partners</li>
          <li>Track your learning progress and achievements</li>
          <li>Send service-related notifications</li>
          <li>Ensure platform safety and prevent abuse</li>
        </ul>

        <h2>3. Video Calls</h2>
        <p>Chatter3 facilitates peer-to-peer video calls. We do not record, store, or monitor video or audio content. Video calls are end-to-end encrypted via WebRTC. Your camera and microphone are accessed only during active calls with your explicit permission.</p>

        <h2>4. Data Storage and Security</h2>
        <p>Your data is stored on Cloudflare's global network with industry-standard encryption. We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

        <h2>5. Data Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregate data for research or analytics purposes.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Export your data (available in your profile settings)</li>
          <li>Delete your account and all associated data</li>
          <li>Opt out of non-essential data collection</li>
        </ul>

        <h2>7. Data Retention</h2>
        <p>We retain your data for as long as your account is active. When you delete your account, all personal data is permanently anonymized within 30 days.</p>

        <h2>8. Children's Privacy</h2>
        <p>Chatter3 is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.</p>

        <h2>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.</p>

        <h2>10. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@chatter3.com" style={{color:'#4f46e5'}}>privacy@chatter3.com</a>.</p>
      </div>
      <footer className="lp-footer"><div className="lp-footer-inner"><p>© 2026 Chatter3. All rights reserved.</p></div></footer>
    </div>
  );
}

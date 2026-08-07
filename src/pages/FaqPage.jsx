import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

const LP_STYLES=`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{display:block!important;place-items:unset!important;background:#f5f5f5!important;color:#1a1a2e!important;min-height:100vh!important;width:100%!important;margin:0!important;padding:0!important;overflow-x:hidden!important;}
body{display:block!important;place-items:unset!important;}
#root{display:block!important;width:100%!important;max-width:100%!important;margin:0!important;padding:0!important;}
a{color:inherit;text-decoration:none;}
.lp{font-family:'DM Sans',-apple-system,sans-serif;color:#1a1a2e;background:#f5f5f5;min-height:100vh;width:100%;}
.lp-nav{background:white;padding:1rem 0;box-shadow:0 2px 10px rgba(0,0,0,.08);position:sticky;top:0;z-index:100;}
.lp-nav-inner{max-width:900px;margin:0 auto;padding:0 1.5rem;display:flex;justify-content:space-between;align-items:center;}
.lp-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;color:#1a1a2e;}
.lp-nav-logo img{height:36px;width:auto;}
.lp-nav-logo span{font-family:'Sora',sans-serif;font-weight:800;font-size:1.1rem;}
.lp-nav .lp-cta{background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;padding:8px 20px;border-radius:8px;font-size:.88rem;text-decoration:none;}
.lp-nav-links{display:flex;gap:1.25rem;align-items:center;}
.lp-nav-links a{color:#4f46e5;font-weight:500;font-size:.9rem;text-decoration:none;transition:opacity .15s;}
.lp-nav-links a:hover,.lp-nav-links a.active{opacity:.7;}
.lp-footer{background:#1e293b;padding:2rem 1.5rem;text-align:center;}
.lp-footer-inner{max-width:900px;margin:0 auto;}
.lp-footer-links{display:flex;justify-content:center;gap:1.5rem;margin-bottom:.75rem;}
.lp-footer-links a{color:#94a3b8;text-decoration:none;font-size:.88rem;transition:color .15s;}
.lp-footer-links a:hover{color:white;}
.lp-footer p{color:#64748b;font-size:.8rem;margin:0;}
.lp-hero{max-width:900px;margin:0 auto;padding:4rem 1.5rem 3rem;text-align:center;}
.lp-hero h1{font-family:'Sora',sans-serif;font-size:2.5rem;font-weight:800;line-height:1.2;margin:0 0 1rem;letter-spacing:-.02em;}
.lp-hero p{font-size:1.15rem;color:#6b7280;line-height:1.6;max-width:600px;margin:0 auto 2rem;}
.lp-hero .lp-cta{display:inline-block;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;padding:14px 32px;border-radius:10px;font-size:1.05rem;font-weight:700;text-decoration:none;transition:all .2s;}
.lp-hero .lp-cta:hover{opacity:.9;transform:translateY(-2px);}
.lp-section{max-width:900px;margin:0 auto;padding:3rem 1.5rem;}
.lp-section h2{font-family:'Sora',sans-serif;font-size:1.6rem;font-weight:800;margin:0 0 1.5rem;text-align:center;}
.lp-faq{max-width:700px;margin:0 auto;}
.lp-faq-category{margin-bottom:2rem;}
.lp-faq-category h3{font-family:'Sora',sans-serif;font-size:1.1rem;font-weight:700;color:#4f46e5;margin:0 0 1rem;padding-bottom:.5rem;border-bottom:2px solid #e5e7eb;}
.lp-faq-item{border-bottom:1px solid #e5e7eb;padding:1.25rem 0;text-align:left;}
.lp-faq-item h4{font-size:1rem;font-weight:600;margin:0 0 .4rem;cursor:pointer;color:#1a1a2e;}
.lp-faq-item p{color:#6b7280;font-size:.9rem;line-height:1.6;margin:0;}
.lp-cta-bottom{text-align:center;padding:4rem 1.5rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;margin-top:3rem;}
.lp-cta-bottom h2{color:white;margin:0 0 1rem;}
.lp-cta-bottom .lp-cta{background:white;color:#4f46e5;padding:14px 32px;border-radius:10px;font-size:1.05rem;font-weight:700;display:inline-block;text-decoration:none;transition:all .2s;}
.lp-cta-bottom .lp-cta:hover{opacity:.9;transform:translateY(-2px);}
@media(prefers-color-scheme:dark){
  .lp{background:#0f1117;color:#e2e8f0;}
  .lp-nav{background:#1a1d2e;}
  .lp-nav-logo{color:#e2e8f0!important;}
  .lp-nav-links a{color:#818cf8;}
  .lp-nav .lp-cta{color:white;}
  .lp-hero h1,.lp-section h2,.lp-faq-category h3,.lp-faq-item h4{color:#e2e8f0;}
  .lp-hero p,.lp-faq-item p{color:#94a3b8;}
  .lp-faq-item{border-color:#2d3a5c;}
  .lp-faq-category h3{border-color:#2d3a5c;}
  .lp-cta-bottom{background:#1a1d2e;}
  .lp-footer{background:#0f1117;}
}
@media(max-width:640px){
  .lp-nav-inner{flex-wrap:wrap;gap:.5rem;}
  .lp-nav-links{display:none;}
  .lp-hero h1{font-size:1.8rem;}
  .lp-hero p{font-size:1rem;}
}
`;

const faqOrder = ['general','practice','account','safety','technical'];
const faqKeys = [
  ['whatIs','isFree','howWork','whoCan'],
  ['beginner','sessionLength','languageDiff','choosePartner'],
  ['createAccount','rewardPoints','friendPoints','foundingMember'],
  ['isSafe','inappropriate','dataPrivate'],
  ['devices','internet','browsers','noAudio']
];

export default function FaqPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/faq`;
  const faq=t.faq;
  
  const faqSchema={
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":[]
  };
  
  faqKeys.forEach((keys) => {
    keys.forEach(key => {
      const item = faq.items[key];
      if(item) faqSchema.mainEntity.push({
        "@type":"Question",
        "name":item.q,
        "acceptedAnswer":{"@type":"Answer","text":item.a}
      });
    });
  });

  return(
    <div className="lp">
      <style>{LP_STYLES}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
      <SEOHead title={`${faq.title} | Chatter3`} description="Get answers to common questions about Chatter3 — the free English conversation practice platform with 1-on-1 video calls." canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>Home</a><a href={`${prefix}/how-it-works`}>How It Works</a><a href={`${prefix}/for-beginners`}>For Beginners</a><a href={`${prefix}/blog`}>Blog</a><a href={`${prefix}/faq`} className="active">FAQ</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{faq.ctaButton}</a></div></nav>
      <div className="lp-hero">
        <h1>{faq.title}</h1>
        <p>{faq.subtitle} <a href="/" style={{color:'#4f46e5',fontWeight:600}}>{faq.tryFree}</a>.</p>
      </div>
      <div className="lp-section">
        <div className="lp-faq">
          {faqOrder.map((category) => (
            <div key={category} className="lp-faq-category">
              <h3>{faq.categories[category]}</h3>
              {faqKeys[faqOrder.indexOf(category)].map((key) => (
                <div key={key} className="lp-faq-item">
                  <h4>{faq.items[key].q}</h4>
                  <p>{faq.items[key].a}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{faq.ctaTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{faq.ctaSubtitle}</p>
        <a href="/" className="lp-cta">{faq.ctaButton}</a>
      </div>
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-links">
            <a href={`${prefix}/`}>Home</a>
            <a href={`${prefix}/how-it-works`}>How It Works</a>
            <a href={`${prefix}/for-beginners`}>For Beginners</a>
            <a href={`${prefix}/blog`}>Blog</a>
            <a href={`${prefix}/faq`}>FAQ</a>
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>&copy; 2026 Chatter3. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

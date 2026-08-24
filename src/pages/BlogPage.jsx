import React, { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export function getBlogArticles(){return[];}

export default function BlogPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/blog`;
  const[articles,setArticles]=useState([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    fetch(`https://api.chatter3.com/api/blog/list?lang=${lang}`).then(r=>r.json()).then(d=>{
      if(d.success&&d.posts?.length){
        setArticles(d.posts.map(p=>({slug:p.slug,title:p.title,excerpt:p.excerpt,content:p.content,date:p.created_at?.slice(0,10),readTime:Math.max(1,Math.ceil((p.content||'').split(/\s+/).length/200))+' min'})));
      }
      setLoading(false);
    }).catch(e=>{console.error('[blog-fetch]',e);setLoading(false);});
  },[lang]);
  return(
    <div className="lp">
      <SEOHead title={t.meta.blog.title} description={t.meta.blog.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`} className="active">{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.blog.title}</h1>
        <p>{t.blog.subtitle}</p>
      </div>
      <div className="lp-section">
        <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:'1.5rem'}}>{t.blog.latestArticles}</h2>
        {articles.map((a,i)=>(
          <a key={i} href={`${prefix}/blog/${a.slug}`} style={{display:'block',background:'white',borderRadius:12,padding:'1.5rem',marginBottom:'1rem',cursor:'pointer',border:'1px solid #e5e7eb',transition:'box-shadow .2s',textDecoration:'none',color:'inherit'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <h3 style={{margin:'0 0 .5rem',fontSize:'1.2rem',fontWeight:700,color:'#1a1a2e'}}>{a.title}</h3>
            <p style={{margin:'0 0 .5rem',color:'#6b7280',fontSize:'.9rem'}}>{a.excerpt}</p>
            <span style={{color:'#6366f1',fontSize:'.85rem',fontWeight:600}}>{t.blog.readMore}</span>
          </a>
        ))}
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.blog.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.blog.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.blog.bottomCta}</a>
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

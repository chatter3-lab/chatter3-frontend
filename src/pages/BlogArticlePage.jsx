import React from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';
import BlogPage, { getBlogArticles } from './BlogPage';

export default function BlogArticlePage({slug,lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const articles=getBlogArticles(t);
  const article=articles.find(a=>a.slug===slug);
  if(!article)return<BlogPage lang={lang}/>;
  const canonical=`https://app.chatter3.com${prefix}/blog/${article.slug}`;
  const articleSchema={
    "@context":"https://schema.org",
    "@type":"Article",
    "headline":article.title,
    "description":article.excerpt,
    "datePublished":article.date,
    "dateModified":article.date,
    "author":{"@type":"Organization","name":"Chatter3","url":"https://app.chatter3.com"},
    "publisher":{"@type":"Organization","name":"Chatter3","logo":{"@type":"ImageObject","url":"https://app.chatter3.com/chatter3_logo.png"}},
    "mainEntityOfPage":{"@type":"WebPage","@id":canonical},
    "image":"https://app.chatter3.com/og-image.png"
  };
  return(
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema)}}/>
      <SEOHead title={`${article.title} | Chatter3`} description={article.excerpt} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`} className="active">{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero" style={{paddingBottom:'1rem'}}>
        <a href={`${prefix}/blog`} style={{color:'#6366f1',fontSize:'.9rem',textDecoration:'none',marginBottom:'1rem',display:'inline-block'}}>&larr; {t.blog.backToArticles}</a>
        <h1 style={{fontSize:'2rem'}}>{article.title}</h1>
        <p style={{color:'#6b7280',fontSize:'.9rem',marginBottom:0}}>{article.date} · {article.readTime} {t.blog.minRead}</p>
      </div>
      <div className="lp-section" style={{maxWidth:720}}>
        <div dangerouslySetInnerHTML={{__html:article.content}} style={{lineHeight:1.8,fontSize:'1.05rem'}}/>
        <div style={{marginTop:'2rem',padding:'1.5rem',background:'#f0fdf4',borderRadius:12,textAlign:'center'}}>
          <h3 style={{margin:'0 0 .5rem'}}>{t.blog.readyToPractice}</h3>
          <p style={{margin:'0 0 1rem',color:'#6b7280'}}>{t.blog.applyLearning}</p>
          <a href="/" style={{display:'inline-block',background:'#6366f1',color:'white',padding:'12px 24px',borderRadius:8,textDecoration:'none',fontWeight:700}}>{t.blog.startFree}</a>
        </div>
      </div>
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-links">
            <a href={`${prefix}/`}>{t.nav.home}</a>
            <a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a>
            <a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a>
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

import React, { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';
import BlogPage from './BlogPage';

export default function BlogArticlePage({slug,lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const[dynamicPost,setDynamicPost]=useState(null);
  const[checking,setChecking]=useState(true);
  const stripHtml=(s)=>(s||'').replace(/<[^>]+>/g,'');
  const processContent=(html)=>{
    if(!html)return'';
    if(html.includes('<p>')||html.includes('<br')||html.includes('<h')||html.includes('<ol')||html.includes('<ul'))return html;
    return html.split(/\n{2,}/).map(p=>'<p>'+p.replace(/\n/g,'<br>')+'</p>').join('');
  };
  useEffect(()=>{
    fetch(`https://api.chatter3.com/api/blog/post?slug=${slug}&lang=${lang}`).then(r=>r.json()).then(d=>{
      if(d.success&&d.post)setDynamicPost({slug:d.post.slug,title:d.post.title,excerpt:d.post.excerpt,content:d.post.content,date:d.post.created_at?.slice(0,10),readTime:Math.max(1,Math.ceil((d.post.content||'').split(/\s+/).length/200))});
      setChecking(false);
    }).catch(()=>setChecking(false));
  },[slug]);
  if(!checking&&!dynamicPost)return<BlogPage lang={lang}/>;
  if(checking)return null;
  const canonical=`https://app.chatter3.com${prefix}/blog/${dynamicPost.slug}`;
  const wordCount=(dynamicPost.content||'').replace(/<[^>]+>/g,'').split(/\s+/).length;
  const articleSchema={
    "@context":"https://schema.org",
    "@type":"Article",
    "headline":stripHtml(dynamicPost.title),
    "description":stripHtml(dynamicPost.excerpt),
    "datePublished":dynamicPost.date,
    "dateModified":dynamicPost.date,
    "author":{"@type":"Organization","name":"Chatter3","url":"https://app.chatter3.com"},
    "publisher":{"@type":"Organization","name":"Chatter3","logo":{"@type":"ImageObject","url":"https://app.chatter3.com/chatter3_logo.png"}},
    "mainEntityOfPage":{"@type":"WebPage","@id":canonical},
    "image":"https://app.chatter3.com/og-image.png",
    "wordCount":wordCount,
    "inLanguage":lang||'en'
  };
  return(
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema)}}/>
      <SEOHead title={`${stripHtml(dynamicPost.title)} | Chatter3`} description={stripHtml(dynamicPost.excerpt)} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`} className="active">{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero" style={{paddingBottom:'1rem'}}>
        <a href={`${prefix}/blog`} style={{color:'#6366f1',fontSize:'.9rem',textDecoration:'none',marginBottom:'1rem',display:'inline-block'}}>&larr; {t.blog.backToArticles}</a>
        <h1 style={{fontSize:'2rem'}} dangerouslySetInnerHTML={{__html:dynamicPost.title}}/>
        <p style={{color:'#6b7280',fontSize:'.9rem',marginBottom:0}}>{dynamicPost.date} · {dynamicPost.readTime} {t.blog.minRead}</p>
      </div>
      <div className="lp-section" style={{maxWidth:720}}>
        <div dangerouslySetInnerHTML={{__html:processContent(dynamicPost.content)}} style={{lineHeight:1.8,fontSize:'1.05rem'}}/>
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

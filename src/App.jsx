import React, { useState, useEffect, useRef, useCallback, Component, lazy, Suspense } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import SEOHead from './components/SEOHead';
import LanguageSwitcher from './components/LanguageSwitcher';
import { getTranslations, getLangFromPath, detectLanguage, getLocalizedPath, languages } from './i18n/detect';
import useInstallPrompt from './hooks/useInstallPrompt';
import { useTranslation } from './i18n/useTranslation';
import { ToastProvider, useToast } from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import Avatar from './components/Avatar';
import { SkeletonDashboard } from './components/Skeleton';
import OfflineBanner from './components/OfflineBanner';
import NotificationCenter from './components/NotificationCenter';

const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const ForBeginnersPage = lazy(() => import('./pages/ForBeginnersPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const FreeEnglishPracticePage = lazy(() => import('./pages/FreeEnglishPracticePage'));
const EnglishConversationAppPage = lazy(() => import('./pages/EnglishConversationAppPage'));
const Chatter3VsItalkiPage = lazy(() => import('./pages/Chatter3VsItalkiPage'));
const Chatter3VsCamblyPage = lazy(() => import('./pages/Chatter3VsCamblyPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: '#1a1a2e', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: 'red' }}>App Error</h2>
          <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{this.state.error.message}</pre>
          <pre style={{ color: '#aaa', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
          <button onClick={() => { localStorage.clear(); location.reload(); }} style={{ marginTop: '1rem', padding: '8px 16px', background: '#4f8ef7', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Clear Storage & Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const API_URL = 'https://api.chatter3.com';
const WS_URL = 'wss://api.chatter3.com';
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";
const RP_TO_FP = 3; // 3 RP → 1 FP
const MATCH_TIMEOUT = 60;
const TURNSTILE_SITEKEY = "0x4AAAAAAEDFDp7g8QNRwN79";

const getToken=()=>localStorage.getItem('chatter3_token')||'';
const authFetch=(url,opts={})=>{
  const token=getToken();
  const headers={...opts.headers,'Content-Type':'application/json'};
  if(token)headers['Authorization']=`Bearer ${token}`;
  else console.error('authFetch: NO TOKEN for',url);
  return fetch(url,{...opts,headers});
};

// ── Turnstile Widget ────────────────────────────────────────
function TurnstileWidget({onVerify,onExpire}){
  const ref=useRef(null);
  const widgetId=useRef(null);
  useEffect(()=>{
    if(!ref.current||!window.turnstile)return;
    widgetId.current=window.turnstile.render(ref.current,{
      sitekey:TURNSTILE_SITEKEY,
      callback:onVerify,
      'expired-callback':onExpire,
      theme:'light',
      size:'normal'
    });
    return()=>{if(widgetId.current&&window.turnstile)window.turnstile.remove(widgetId.current);};
  },[]);
  return <div ref={ref} style={{margin:'12px 0',textAlign:'center'}}/>;
}

// ── ISO 3166-1 Countries ─────────────────────────────────────
const COUNTRIES=[{code:'AF',name:'Afghanistan'},{code:'AL',name:'Albania'},{code:'DZ',name:'Algeria'},{code:'AD',name:'Andorra'},{code:'AO',name:'Angola'},{code:'AG',name:'Antigua and Barbuda'},{code:'AR',name:'Argentina'},{code:'AM',name:'Armenia'},{code:'AU',name:'Australia'},{code:'AT',name:'Austria'},{code:'AZ',name:'Azerbaijan'},{code:'BS',name:'Bahamas'},{code:'BH',name:'Bahrain'},{code:'BD',name:'Bangladesh'},{code:'BB',name:'Barbados'},{code:'BY',name:'Belarus'},{code:'BE',name:'Belgium'},{code:'BZ',name:'Belize'},{code:'BJ',name:'Benin'},{code:'BT',name:'Bhutan'},{code:'BO',name:'Bolivia'},{code:'BA',name:'Bosnia and Herzegovina'},{code:'BW',name:'Botswana'},{code:'BR',name:'Brazil'},{code:'BN',name:'Brunei'},{code:'BG',name:'Bulgaria'},{code:'BF',name:'Burkina Faso'},{code:'BI',name:'Burundi'},{code:'CV',name:'Cabo Verde'},{code:'KH',name:'Cambodia'},{code:'CM',name:'Cameroon'},{code:'CA',name:'Canada'},{code:'CF',name:'Central African Republic'},{code:'TD',name:'Chad'},{code:'CL',name:'Chile'},{code:'CN',name:'China'},{code:'CO',name:'Colombia'},{code:'KM',name:'Comoros'},{code:'CG',name:'Congo'},{code:'CD',name:'Congo (DRC)'},{code:'CR',name:'Costa Rica'},{code:'HR',name:'Croatia'},{code:'CU',name:'Cuba'},{code:'CY',name:'Cyprus'},{code:'CZ',name:'Czech Republic'},{code:'DK',name:'Denmark'},{code:'DJ',name:'Djibouti'},{code:'DM',name:'Dominica'},{code:'DO',name:'Dominican Republic'},{code:'EC',name:'Ecuador'},{code:'EG',name:'Egypt'},{code:'SV',name:'El Salvador'},{code:'GQ',name:'Equatorial Guinea'},{code:'ER',name:'Eritrea'},{code:'EE',name:'Estonia'},{code:'SZ',name:'Eswatini'},{code:'ET',name:'Ethiopia'},{code:'FJ',name:'Fiji'},{code:'FI',name:'Finland'},{code:'FR',name:'France'},{code:'GA',name:'Gabon'},{code:'GM',name:'Gambia'},{code:'GE',name:'Georgia'},{code:'DE',name:'Germany'},{code:'GH',name:'Ghana'},{code:'GR',name:'Greece'},{code:'GD',name:'Grenada'},{code:'GT',name:'Guatemala'},{code:'GN',name:'Guinea'},{code:'GW',name:'Guinea-Bissau'},{code:'GY',name:'Guyana'},{code:'HT',name:'Haiti'},{code:'HN',name:'Honduras'},{code:'HK',name:'Hong Kong'},{code:'HU',name:'Hungary'},{code:'IS',name:'Iceland'},{code:'IN',name:'India'},{code:'ID',name:'Indonesia'},{code:'IR',name:'Iran'},{code:'IQ',name:'Iraq'},{code:'IE',name:'Ireland'},{code:'IL',name:'Israel'},{code:'IT',name:'Italy'},{code:'JM',name:'Jamaica'},{code:'JP',name:'Japan'},{code:'JO',name:'Jordan'},{code:'KZ',name:'Kazakhstan'},{code:'KE',name:'Kenya'},{code:'KI',name:'Kiribati'},{code:'KW',name:'Kuwait'},{code:'KG',name:'Kyrgyzstan'},{code:'LA',name:'Laos'},{code:'LV',name:'Latvia'},{code:'LB',name:'Lebanon'},{code:'LS',name:'Lesotho'},{code:'LR',name:'Liberia'},{code:'LY',name:'Libya'},{code:'LI',name:'Liechtenstein'},{code:'LT',name:'Lithuania'},{code:'LU',name:'Luxembourg'},{code:'MG',name:'Madagascar'},{code:'MW',name:'Malawi'},{code:'MY',name:'Malaysia'},{code:'MV',name:'Maldives'},{code:'ML',name:'Mali'},{code:'MT',name:'Malta'},{code:'MH',name:'Marshall Islands'},{code:'MR',name:'Mauritania'},{code:'MU',name:'Mauritius'},{code:'MX',name:'Mexico'},{code:'FM',name:'Micronesia'},{code:'MD',name:'Moldova'},{code:'MC',name:'Monaco'},{code:'MN',name:'Mongolia'},{code:'ME',name:'Montenegro'},{code:'MA',name:'Morocco'},{code:'MZ',name:'Mozambique'},{code:'MM',name:'Myanmar'},{code:'NA',name:'Namibia'},{code:'NR',name:'Nauru'},{code:'NP',name:'Nepal'},{code:'NL',name:'Netherlands'},{code:'NZ',name:'New Zealand'},{code:'NI',name:'Nicaragua'},{code:'NE',name:'Niger'},{code:'NG',name:'Nigeria'},{code:'NO',name:'Norway'},{code:'OM',name:'Oman'},{code:'PK',name:'Pakistan'},{code:'PW',name:'Palau'},{code:'PA',name:'Panama'},{code:'PG',name:'Papua New Guinea'},{code:'PY',name:'Paraguay'},{code:'PE',name:'Peru'},{code:'PH',name:'Philippines'},{code:'PL',name:'Poland'},{code:'PT',name:'Portugal'},{code:'PR',name:'Puerto Rico'},{code:'QA',name:'Qatar'},{code:'RO',name:'Romania'},{code:'RU',name:'Russia'},{code:'RW',name:'Rwanda'},{code:'KN',name:'Saint Kitts and Nevis'},{code:'LC',name:'Saint Lucia'},{code:'VC',name:'Saint Vincent and the Grenadines'},{code:'WS',name:'Samoa'},{code:'SM',name:'San Marino'},{code:'SA',name:'Saudi Arabia'},{code:'SN',name:'Senegal'},{code:'RS',name:'Serbia'},{code:'SC',name:'Seychelles'},{code:'SL',name:'Sierra Leone'},{code:'SG',name:'Singapore'},{code:'SK',name:'Slovakia'},{code:'SI',name:'Slovenia'},{code:'SB',name:'Solomon Islands'},{code:'SO',name:'Somalia'},{code:'ZA',name:'South Africa'},{code:'KR',name:'South Korea'},{code:'SS',name:'South Sudan'},{code:'ES',name:'Spain'},{code:'LK',name:'Sri Lanka'},{code:'SD',name:'Sudan'},{code:'SR',name:'Suriname'},{code:'SE',name:'Sweden'},{code:'CH',name:'Switzerland'},{code:'SY',name:'Syria'},{code:'TW',name:'Taiwan'},{code:'TJ',name:'Tajikistan'},{code:'TZ',name:'Tanzania'},{code:'TH',name:'Thailand'},{code:'TL',name:'Timor-Leste'},{code:'TG',name:'Togo'},{code:'TO',name:'Tonga'},{code:'TT',name:'Trinidad and Tobago'},{code:'TN',name:'Tunisia'},{code:'TR',name:'Turkey'},{code:'TM',name:'Turkmenistan'},{code:'UG',name:'Uganda'},{code:'UA',name:'Ukraine'},{code:'AE',name:'United Arab Emirates'},{code:'GB',name:'United Kingdom'},{code:'US',name:'United States'},{code:'UY',name:'Uruguay'},{code:'UZ',name:'Uzbekistan'},{code:'VU',name:'Vanuatu'},{code:'VE',name:'Venezuela'},{code:'VN',name:'Vietnam'},{code:'YE',name:'Yemen'},{code:'ZM',name:'Zambia'},{code:'ZW',name:'Zimbabwe'}];

const getFlag=code=>{
  if(!code)return'🌍';
  const c=COUNTRIES.find(x=>x.code===code);
  if(!c)return'🌍';
  return String.fromCodePoint(...c.code.toUpperCase().split('').map(ch=>0x1F1E6+ch.charCodeAt(0)-65));
};
const countryName=code=>{
  if(!code)return'';
  const c=COUNTRIES.find(x=>x.code===code);
  return c?c.name:code;
};
function CountrySelect({value,onChange,required,placeholder='Select your country'}){
  return(
    <select value={value||''} onChange={e=>onChange(e.target.value)} required={required}
      className="admin-select" style={{width:'100%',padding:'9px 12px',borderRadius:6,fontSize:15,boxSizing:'border-box'}}>
      <option value="" disabled>{placeholder}</option>
      {COUNTRIES.map(c=><option key={c.code} value={c.code}>{getFlag(c.code)} {c.name}</option>)}
    </select>
  );
}

// ── Sounds ──────────────────────────────────────────────────
const SOUNDS = {
  match: '/sounds/match.mp3',
  start: '/sounds/start.mp3',
  end:   '/sounds/end.mp3',
  points:'/sounds/points.mp3',
  ring:  '/sounds/ring.mp3',
};
const playSound = (k) => { try { const a = new Audio(SOUNDS[k]); a.volume=0.5; a.play().catch(()=>{}); } catch{} };
const startRinging = () => {
  let stopped=false, audio=null;
  const play = () => {
    if(stopped) return;
    try { audio=new Audio(SOUNDS.ring); audio.volume=0.4; audio.onended=()=>{if(!stopped)setTimeout(play,500);}; audio.play().catch(()=>{}); } catch{}
  };
  play();
  return ()=>{ stopped=true; if(audio){try{audio.pause();audio.src='';}catch{}} };
};

// ── Conversation starters ────────────────────────────────────
const getStarters=(t)=>[
  (p)=>(t?.matching?.starter1||'Ask {partner} what the most popular food is in their country!').replace('{partner}',p),
  (p)=>(t?.matching?.starter2||'Ask {partner} what music or shows are trending where they live!').replace('{partner}',p),
  (p)=>(t?.matching?.starter3||'Ask {partner} what they enjoy doing on weekends!').replace('{partner}',p),
  (p)=>(t?.matching?.starter4||'Ask {partner} what made them want to practice English conversation!').replace('{partner}',p),
  (p)=>(t?.matching?.starter5||'Ask {partner} to describe something unique about their hometown!').replace('{partner}',p),
];

// ── Icon ───────────────────────────────────────────────────────
const Ico=({d,style})=><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',...style}}><path d={d}/></svg>;
const PhoneOff=({style})=><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',...style}}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>;
const UploadIcon=({style})=><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',...style}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

// ── Onboarding ──────────────────────────────────────────────────
function OnboardingSlider({onComplete,t}){
  const[cur,setCur]=useState(0);
  const stars=useRef(Array.from({length:36},(_,i)=>({id:i,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,delay:`${Math.random()*3}s`,sz:Math.random()>.7?3:2}))).current;
  const slides=[
    {id:0,tag:t?.onboarding?.connectTag||'CONNECT',emoji:'🌐',color:'#00b4d8',headline:t?.onboarding?.connectHeadline||'Connect with real people, instantly.',body:t?.onboarding?.connectBody||'Get matched 1-on-1 with another English learner for a live video conversation.'},
    {id:1,tag:t?.onboarding?.speakTag||'SPEAK',emoji:'🗣️',color:'#7b2ff7',headline:t?.onboarding?.speakHeadline||'Just speak. That is how you learn.',body:t?.onboarding?.speakBody||'Short, real conversations — no scripts, no pressure. Just two people practicing together.'},
    {id:2,tag:t?.onboarding?.earnTag||'EARN',emoji:'💰',color:'#f72585',headline:t?.onboarding?.earnHeadline||'Your conversations earn value.',body:t?.onboarding?.earnBody||'Complete conversations to earn Focus Points and Reward Points.',note:t?.onboarding?.earnNote||'RP may transition to future premium features. Early members benefit most.'}
  ];
  const s=slides[cur];
  const isLast=cur===slides.length-1;
  return(
    <div className="onboarding-overlay">
      <div className="ob-bg"/>
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        {stars.map(st=><div key={st.id} className="ob-star" style={{top:st.top,left:st.left,animationDelay:st.delay,width:st.sz,height:st.sz}}/>)}
      </div>
      <button className="ob-skip" onClick={onComplete}>{t?.onboarding?.skip||'Skip'}</button>
      <div className="ob-card">
        <div className="ob-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></div>
        <div className="slides-wrapper">
          <div className="slides-track" style={{transform:`translateX(-${cur*100}%)`}}>
            {slides.map(sl=>(
              <div key={sl.id} className="slide">
                <span className="slide-tag" style={{background:`${sl.color}22`,color:sl.color,border:`1px solid ${sl.color}44`}}>{sl.tag}</span>
                <div className="slide-icon" style={{background:`linear-gradient(135deg,${sl.color}33,${sl.color}11)`,boxShadow:`0 0 36px ${sl.color}33`}}><span>{sl.emoji}</span></div>
                <h2 className="slide-headline">{sl.headline}</h2>
                <p className="slide-body">{sl.body}</p>
                {sl.note&&<p className="slide-note">*{sl.note}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="ob-dots">
          {slides.map((sl,i)=><button key={sl.id} className={`ob-dot ${i===cur?'active':''}`} style={{width:i===cur?22:5}} onClick={()=>setCur(i)}/>)}
        </div>
        <button className="ob-cta" onClick={()=>cur<slides.length-1?setCur(cur+1):onComplete()} style={{background:`linear-gradient(135deg,${s.color},${s.color}cc)`,color:'white',boxShadow:`0 4px 18px ${s.color}55`}}>
          {isLast?(t?.onboarding?.startButton||'🚀 Start Talking'):(t?.onboarding?.nextButton||'Next →')}
        </button>
      </div>
    </div>
  );
}

// ── Profile Gate ────────────────────────────────────────────────
function ProfileGate({t,user,onComplete,onDismiss}){
  const[country,setCountry]=useState(user.country||'');
  const[lang,setLang]=useState(user.native_language||'');
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState('');
  const save=async()=>{
    if(!country.trim()||!lang.trim()){setErr(t?.modals?.profileGateError||'Both fields are required.');return;}
    setLoading(true);setErr('');
    try{
      const r=await authFetch(`${API_URL}/api/user/update`,{method:'POST',body:JSON.stringify({nickname:user.nickname,english_level:user.english_level,bio:user.bio,avatar_url:user.avatar_url,country:country.trim(),native_language:lang.trim()})});
      const d=await r.json();
      if(d.success){const u={...user,country:country.trim(),native_language:lang.trim()};localStorage.setItem('chatter3_user',JSON.stringify(u));onComplete(u);}
      else setErr(t?.modals?.profileGateFailed||'Failed to save.');
    }catch{setErr(t?.modals?.profileGateNetwork||'Network error.');}finally{setLoading(false);}
  };
  return(
    <div className="profile-gate-overlay">
      <div className="profile-gate-card">
        <div style={{fontSize:'2.75rem',marginBottom:'.75rem'}}>🌍</div>
        <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.25rem',fontWeight:800,margin:'0 0 .4rem'}}>{t?.modals?.profileGateTitle||'One quick thing…'}</h2>
        <p style={{color:'#6b7280',fontSize:'.88rem',marginBottom:'1.25rem',lineHeight:'1.5'}}>{t?.modals?.profileGateDesc||'Tell us where you\'re from and your native language — we use this to find you better conversation partners.'}</p>
        {err&&<div className="error-message">{err}</div>}
        <div style={{marginBottom:'.55rem'}}><CountrySelect value={country} onChange={setCountry} required/></div>
        <input className="profile-gate-input" placeholder={t?.modals?.profileGateLanguage||'Native language (e.g. Japanese)'} value={lang} onChange={e=>setLang(e.target.value)}/>
        <button className="profile-gate-submit" onClick={save} disabled={loading}>{loading?(t?.modals?.profileGateSaving||'Saving…'):(t?.modals?.profileGateSubmit||'Save & Find a Partner →')}</button>
        <button onClick={onDismiss} style={{marginTop:'.6rem',background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'.82rem'}}>{t?.modals?.profileGateLater||'Maybe later'}</button>
      </div>
    </div>
  );
}

// ── RP→FP Exchange Modal ────────────────────────────────────────
function ExchangeModal({t,user,onClose,onDone}){
  const[qty,setQty]=useState(1);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState('');
  const cost=qty*RP_TO_FP;
  const canAfford=(user.rp_balance||0)>=cost;
  useEffect(()=>{
    const h=(e)=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[onClose]);
  const exchange=async()=>{
    setLoading(true);setErr('');
    try{
      const r=await authFetch(`${API_URL}/api/user/exchange-rp`,{method:'POST',body:JSON.stringify({quantity:qty})});
      const d=await r.json();
      if(d.success)onDone(d.fp,d.rp);
      else setErr(d.error||t?.modals?.exchangeFailed||'Exchange failed.');
    }catch{setErr(t?.modals?.exchangeNetwork||'Network error.');}finally{setLoading(false);}
  };
  return(
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Exchange RP for FP">
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-icon">🔄</div>
        <h2>{t?.modals?.exchangeTitle||'Exchange RP for FP'}</h2>
        <p>{t?.modals?.exchangeDesc||'Use your Reward Points to get more call time.'}<br/><strong>{t?.modals?.exchangeRate||`${RP_TO_FP} RP = 1 FP`}</strong> ({t?.modals?.exchangeDuration||'5 minutes'})</p>
         <div className="bg-light" style={{borderRadius:10,padding:'1rem',marginBottom:'1rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',textAlign:'center'}}>
          <div><div style={{fontSize:'1.5rem',fontWeight:800,color:'#15803d',fontFamily:'Sora,sans-serif'}}>{(user.rp_balance||0).toFixed(1)}</div><div style={{fontSize:'.72rem',color:'#9ca3af'}}>{t?.modals?.exchangeRP||'RP Balance'}</div></div>
          <div><div style={{fontSize:'1.5rem',fontWeight:800,color:'#1d4ed8',fontFamily:'Sora,sans-serif'}}>{user.fp_balance||0}</div><div style={{fontSize:'.72rem',color:'#9ca3af'}}>{t?.modals?.exchangeFP||'FP Balance'}</div></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'.875rem',justifyContent:'center'}}>
           <button onClick={()=>setQty(Math.max(1,qty-1))} className="qty-btn">−</button>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:'Sora,sans-serif',fontSize:'1.4rem',fontWeight:800}}>{qty} FP</div>
            <div style={{fontSize:'.75rem',color:'#9ca3af'}}>{t?.modals?.exchangeCost?.replace('{cost}',cost)||`costs ${cost} RP`}</div>
          </div>
           <button onClick={()=>setQty(qty+1)} className="qty-btn">+</button>
        </div>
        {err&&<div className="error-message">{err}</div>}
        <button className="modal-btn-primary" onClick={exchange} disabled={loading||!canAfford}>
          {loading?(t?.modals?.exchangeProcessing||'Processing…'):canAfford?(t?.modals?.exchangeButton?.replace('{cost}',cost)?.replace('{qty}',qty)||`Exchange ${cost} RP → ${qty} FP`):(t?.modals?.exchangeInsufficient?.replace('{cost}',cost)||`Not enough RP (need ${cost})`)}
        </button>
        <button className="modal-btn-ghost" onClick={onClose}>{t?.modals?.exchangeCancel||'Cancel'}</button>
      </div>
    </div>
  );
}

// ── Report Modal ────────────────────────────────────────────────
const REPORT_REASONS=['Inappropriate or offensive language','Harassment or bullying','Spam or scam behavior','Explicit or adult content','Impersonation','Other'];
function ReportModal({targetUser,sessionId,onClose,t}){
  const[reason,setReason]=useState('');
  const[submitting,setSubmitting]=useState(false);
  const[done,setDone]=useState(null);
  const toast=useToast();
  useEffect(()=>{
    const h=(e)=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[onClose]);
  const submit=async(action)=>{
    if(action!=='block'&&!reason)return;
    setSubmitting(true);
    try{
      if(action==='report'||action==='both')await authFetch(`${API_URL}/api/report`,{method:'POST',body:JSON.stringify({reported_id:targetUser.id,session_id:sessionId,reason})});
      if(action==='block'||action==='both')await authFetch(`${API_URL}/api/block`,{method:'POST',body:JSON.stringify({blocked_id:targetUser.id})});
      setDone(action);
    }catch{setDone(action);toast.error('Report failed — please try again');}finally{setSubmitting(false);}
  };
  const name=targetUser?.nickname||targetUser?.username||t.modals.reportUnknown;
  const reasonKeys=[t.modals.reportReason1,t.modals.reportReason2,t.modals.reportReason3,t.modals.reportReason4,t.modals.reportReason5,t.modals.reportReason6];
  if(done)return(
    <div className="report-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Report">
      <div className="report-card" onClick={e=>e.stopPropagation()}>
        <div className="report-success"><div className="report-success-icon">✅</div>
          <h3 style={{fontFamily:'Sora,sans-serif'}}>{done==='block'?t.modals.reportBlocked.replace('{name}',name):done==='both'?t.modals.reportBlockedReport.replace('{name}',name):t.modals.reportSubmitted}</h3>
          <p style={{color:'#6b7280',fontSize:'.83rem',marginTop:'.4rem'}}>{done==='block'?t.modals.reportBlockedSuccess:t.modals.reportReviewed}</p>
          <button className="modal-btn-primary" style={{marginTop:'1rem'}} onClick={onClose}>{t.modals.reportDone}</button>
        </div>
      </div>
    </div>
  );
  return(
    <div className="report-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Report">
      <div className="report-card" onClick={e=>e.stopPropagation()}>
        <h3>{t.modals.reportTitle}</h3>
        <p>{t.modals.reportDesc.replace('{name}',name)}</p>
        {REPORT_REASONS.map((r,i)=><button key={r} className={`reason-btn ${reason===r?'sel':''}`} onClick={()=>setReason(r)}>{reasonKeys[i]}</button>)}
        <div className="report-actions">
          <button className="report-action-btn block" disabled={!reason||submitting} onClick={()=>submit('block')}>{t.modals.reportBlock}</button>
          <button className="report-action-btn report" disabled={!reason||submitting} onClick={()=>submit('both')}>{t.modals.reportBlockReport}</button>
        </div>
        <button className="report-cancel" onClick={onClose}>{t.modals.reportCancel}</button>
      </div>
    </div>
  );
}

// ── Friends + Invite Modal ─────────────────────────────────────
function FriendsModal({t,user,onClose}){
  const[tab,setTab]=useState('friends');
  const[friends,setFriends]=useState([]);
  const[pending,setPending]=useState([]);
  const[searchQ,setSearchQ]=useState('');
  const[searchRes,setSearchRes]=useState([]);
  const[inviteUrl,setInviteUrl]=useState('');
  const[copied,setCopied]=useState(false);
  const[inviteStats,setInviteStats]=useState({total:0,used:0});
  const[loading,setLoading]=useState(false);
  const toast=useToast();

  const post=(p,b)=>authFetch(`${API_URL}${p}`,{method:'POST',body:JSON.stringify(b||{})}).then(r=>r.json());

  useEffect(()=>{
    const h=(e)=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[onClose]);

  useEffect(()=>{
    post('/api/friends/list',{}).then(d=>{if(d.success){setFriends(d.friends||[]);setPending(d.pending_requests||[]);}});
    post('/api/invite/stats',{}).then(d=>{if(d.success)setInviteStats(d);});
    post('/api/invite/create',{}).then(d=>{if(d.success)setInviteUrl(d.invite_url);});
  },[]);

  const doSearch=async()=>{
    if(!searchQ.trim())return;
    setLoading(true);
    const d=await post('/api/friends/search',{query:searchQ});
    setSearchRes(d.users||[]);setLoading(false);
  };

  const sendRequest=async(rid)=>{
    await authFetch(`${API_URL}/api/friends/request`,{method:'POST',body:JSON.stringify({receiver_id:rid})});
    setSearchRes(sr=>sr.filter(u=>u.id!==rid));
    toast.success(t?.modals?.friendRequestSent||'Friend request sent!');
  };

  const respond=async(reqId,action)=>{
    await post('/api/friends/respond',{request_id:reqId,action});
    const d=await post('/api/friends/list',{});
    if(d.success){setFriends(d.friends||[]);setPending(d.pending_requests||[]);}
  };

  const removeFriend=async(fid)=>{
    await post('/api/friends/remove',{friend_id:fid}).catch(()=>toast.error('Failed to remove friend'));
    setFriends(f=>f.filter(fr=>fr.id!==fid));
  };

  const copyLink=()=>{navigator.clipboard.writeText(inviteUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  const shareLink=async(platform)=>{
    const msg=(t?.modals?.shareMessage||'Join me on Chatter3 — practice English conversation with real people!')+' '+inviteUrl;
    const shortMsg=t?.modals?.shareShort||'Join me on Chatter3 — practice English with real people!';
    if(platform==='native'&&navigator.share){await navigator.share({title:t?.modals?.shareTitle||'Join Chatter3',text:msg,url:inviteUrl});return;}
    if(platform==='copy'){navigator.clipboard.writeText(inviteUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});return;}
    if(platform==='email'){window.open(`mailto:?subject=${encodeURIComponent(t?.modals?.shareEmailSubject||'Join me on Chatter3!')}&body=${encodeURIComponent(msg)}`,'_blank');return;}
    if(platform==='sms'){window.open(`sms:?body=${encodeURIComponent(msg)}`,'_blank');return;}
    const urls={
      whatsapp:`https://wa.me/?text=${encodeURIComponent(msg)}`,
      facebook:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}&quote=${encodeURIComponent(shortMsg)}`,
      twitter:`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`,
      linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteUrl)}`,
      reddit:`https://reddit.com/submit?url=${encodeURIComponent(inviteUrl)}&title=${encodeURIComponent(shortMsg)}`,
      telegram:`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shortMsg)}`,
      pinterest:`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteUrl)}&description=${encodeURIComponent(shortMsg)}`,
      discord:`https://discord.com/channels/@me`,
      tumblr:`https://www.tumblr.com/share/link?url=${encodeURIComponent(inviteUrl)}&name=${encodeURIComponent('Chatter3')}&description=${encodeURIComponent(shortMsg)}`,
      line:`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(inviteUrl)}`,
    };
    if(urls[platform])window.open(urls[platform],'_blank');
  };

  const FriendRow=({f,actions})=>(
    <div className="friend-item">
      <div className="friend-avatar">
        {f.avatar_url?<Avatar src={f.avatar_url} name={f.nickname||f.username} size={40} style={{width:'100%',height:'100%'}}/>:(f.nickname||f.username||'?').charAt(0).toUpperCase()}
      </div>
      <div className="friend-info">
        <div className="friend-name">{f.nickname||f.username}{f.founding_member?<span style={{marginLeft:5,padding:'1px 6px',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',borderRadius:8,fontSize:'.6rem',fontWeight:700,verticalAlign:'middle'}}>{t?.modals?.fmBadge||'🏆 FM'}</span>:null}{f.is_new_member&&!f.founding_member?<span style={{marginLeft:5,padding:'1px 6px',background:'linear-gradient(135deg,#22c55e,#10b981)',color:'white',borderRadius:8,fontSize:'.6rem',fontWeight:700,verticalAlign:'middle'}}>{t?.modals?.newBadge||'🆕 NEW'}</span>:null}</div>
        <div className="friend-sub">{f.country?`${getFlag(f.country)} ${countryName(f.country)}`:''}{f.english_level?` · ${f.english_level}`:''}</div>
      </div>
      {actions}
    </div>
  );

  return(
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Friends">
      <div className="modal-card" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h2 style={{margin:0,textAlign:'left'}}>👥 {t?.modals?.friendsTitle||'Friends & Invite'}</h2>
          <button onClick={onClose} aria-label="Close" style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:'1.1rem'}}>✕</button>
        </div>
        <div className="modal-tab-row">
          {['friends','search','invite'].map(tabName=><button key={tabName} className={`modal-tab ${tab===tabName?'active':''}`} onClick={()=>setTab(tabName)}>{tabName==='friends'?(t?.modals?.friendsTab||'Friends')+(pending.length>0?` (${pending.length})`:''):tabName==='search'?(t?.modals?.searchTab||'Search'):(t?.modals?.inviteTab||'Invite')}</button>)}
        </div>

        {tab==='friends'&&(
          <>
            {pending.length>0&&(
              <>
                <p style={{fontSize:'.8rem',fontWeight:600,color:'#1e293b',margin:'0 0 .5rem'}}>{t?.modals?.pendingRequests||'Pending requests'}</p>
                {pending.map(r=>(
                  <FriendRow key={r.id} f={r} actions={
                    <div style={{display:'flex',gap:5}}>
                      <button className="friend-action-btn accept" onClick={()=>respond(r.id,'accept')}>{t?.modals?.accept||'Accept'}</button>
                      <button className="friend-action-btn decline" onClick={()=>respond(r.id,'decline')}>✕</button>
                    </div>
                  }/>
                ))}
                <hr style={{margin:'.75rem 0',border:'none',borderTop:'1px solid #f1f5f9'}}/>
              </>
            )}
            {friends.length===0&&pending.length===0&&<p style={{color:'#9ca3af',fontSize:'.85rem',textAlign:'center',padding:'1rem 0'}}>{t?.modals?.noFriends||'No friends yet. Use Search to add people!'}</p>}
            {friends.map(f=><FriendRow key={f.id} f={f} actions={<button className="friend-action-btn remove" onClick={()=>removeFriend(f.id)}>{t?.modals?.remove||'Remove'}</button>}/>)}
          </>
        )}

        {tab==='search'&&(
          <>
            <div className="search-row" style={{marginBottom:'.75rem'}}>
              <input className="search-input" placeholder={t?.modals?.searchPlaceholder||'Search by username or nickname…'} value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}/>
              <button className="search-btn" onClick={doSearch}>{t?.modals?.searchButton||'Search'}</button>
            </div>
            {loading&&<p style={{color:'#9ca3af',fontSize:'.85rem',textAlign:'center'}}>{t?.modals?.searching||'Searching…'}</p>}
            {searchRes.map(u=>(
              <FriendRow key={u.id} f={u} actions={<button className="modal-btn-primary" style={{width:'auto',padding:'5px 13px',margin:0,fontSize:'.78rem'}} onClick={()=>sendRequest(u.id)}>+ {t?.modals?.addButton||'Add'}</button>}/>
            ))}
            {!loading&&searchQ&&searchRes.length===0&&<p style={{color:'#9ca3af',fontSize:'.85rem',textAlign:'center'}}>{t?.modals?.noResults||'No users found.'}</p>}
          </>
        )}

        {tab==='invite'&&(
          <>
            <p style={{textAlign:'center',margin:'0 0 .75rem'}}>{t?.modals?.inviteText||'Invite friends to Chatter3 and help grow the community!'}</p>
             <div className="bg-green" style={{borderRadius:9,padding:'.75rem 1rem',textAlign:'center',marginBottom:'.875rem'}}>
              <div style={{fontSize:'1.5rem',fontWeight:800,color:'#15803d',fontFamily:'Sora,sans-serif'}}>{inviteStats.used}</div>
              <div style={{fontSize:'.75rem',color:'#6b7280'}}>{t?.modals?.inviteStats||'friends joined via your invite'}</div>
            </div>
            {inviteUrl&&(
              <>
                <div className="invite-url-box">{inviteUrl}</div>
                <button className="modal-btn-primary" onClick={copyLink}>{copied?(t?.modals?.copied||'✓ Copied!'):(t?.modals?.copyInvite||'📋 Copy Invite Link')}</button>
                <p style={{fontSize:'.78rem',color:'#9ca3af',margin:'.5rem 0 .65rem',textAlign:'center'}}>{t?.modals?.shareOn||'Share on:'}</p>
                <div className="invite-share-row">
                  {navigator.share&&<button className="invite-share-btn" onClick={()=>shareLink('native')}>📤<span>{t?.modals?.share||'Share'}</span></button>}
                  <button className="invite-share-btn" onClick={()=>shareLink('whatsapp')}>💬<span>WhatsApp</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('facebook')}>📘<span>Facebook</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('twitter')}>🐦<span>X/Twitter</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('linkedin')}>💼<span>LinkedIn</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('telegram')}>✈️<span>Telegram</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('reddit')}>🔴<span>Reddit</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('pinterest')}>📌<span>Pinterest</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('tumblr')}>📝<span>Tumblr</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('line')}>💚<span>LINE</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('discord')}>🎮<span>Discord</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('email')}>✉️<span>Email</span></button>
                  <button className="invite-share-btn" onClick={()=>shareLink('sms')}>💬<span>SMS</span></button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LANDING PAGES
// ─────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────
function App(){
  // Detect browser language on first visit (before useTranslation reads localStorage)
  if(!localStorage.getItem('chatter3_lang')) detectLanguage();

  const path=window.location.pathname;
  
  // Redirect common typos
  const typoRedirects={
    '/how-it-worksz':'/how-it-works',
    '/aree-english-practice':'/free-english-practice',
    '/esee-english-practice':'/free-english-practice',
    '/bnee-english-practice':'/free-english-practice',
    '/jnee-english-practice':'/free-english-practice',
    '/zee-english-practice':'/free-english-practice',
    '/free-english-practicez':'/free-english-practice',
    '/for-beginnersz':'/for-beginners',
    '/faqz':'/faq',
  };
  if(typoRedirects[path]){
    window.location.href=typoRedirects[path];
    return null;
  }
  // Also handle language-prefixed typos
  const langTypoMatch=path.match(/^\/(es|ja|zh|bn|fr|ar|ru)\/(.+)$/);
  if(langTypoMatch){
    const fixedPage=typoRedirects['/'+langTypoMatch[2]];
    if(fixedPage){
      window.location.href='/'+langTypoMatch[1]+fixedPage;
      return null;
    }
  }
  // Language root pages (/ar/, /bn/, etc.) — redirect to homepage
  const langRootMatch=path.match(/^\/(es|ja|zh|bn|fr|ar|ru)\/?$/);
  if(langRootMatch){
    window.location.href='/';
    return null;
  }
  
  // Language-prefixed landing pages
  const langMatch=path.match(/^\/(es|ja|zh|bn|fr|ar|ru)\/(how-it-works|for-beginners|faq|free-english-practice|english-conversation-app|chatter3-vs-italki|chatter3-vs-cambly|privacy|terms|refund|blog(?:\/[a-z0-9-]+)?)$/);
  if(langMatch){
    const lang=langMatch[1];
    const page=langMatch[2];
    const loading=<div className="loading-page"><SkeletonDashboard/></div>;
    if(page==='how-it-works')return<Suspense fallback={loading}><HowItWorksPage lang={lang}/></Suspense>;
    if(page==='for-beginners')return<Suspense fallback={loading}><ForBeginnersPage lang={lang}/></Suspense>;
    if(page==='faq')return<Suspense fallback={loading}><FaqPage lang={lang}/></Suspense>;
    if(page==='free-english-practice')return<Suspense fallback={loading}><FreeEnglishPracticePage lang={lang}/></Suspense>;
    if(page==='english-conversation-app')return<Suspense fallback={loading}><EnglishConversationAppPage lang={lang}/></Suspense>;
    if(page==='chatter3-vs-italki')return<Suspense fallback={loading}><Chatter3VsItalkiPage lang={lang}/></Suspense>;
    if(page==='chatter3-vs-cambly')return<Suspense fallback={loading}><Chatter3VsCamblyPage lang={lang}/></Suspense>;
    if(page==='blog')return<Suspense fallback={loading}><BlogPage lang={lang}/></Suspense>;
    if(page.startsWith('blog/')){const slug=page.replace('blog/','');return<Suspense fallback={loading}><BlogArticlePage slug={slug} lang={lang}/></Suspense>;}
  }
  
  // English landing pages — detect browser language and redirect if needed
  const blogArticleMatch=path.match(/^\/blog\/([a-z0-9-]+)$/);
  if(path==='/how-it-works'||path==='/for-beginners'||path==='/faq'||path==='/free-english-practice'||path==='/english-conversation-app'||path==='/chatter3-vs-italki'||path==='/chatter3-vs-cambly'||path=='/blog'||path==='/privacy'||path==='/terms'||path=='/refund'||blogArticleMatch){
    const saved=localStorage.getItem('chatter3_lang');
    const lang=saved||detectLanguage();
    if(lang&&lang!=='en'){
      const cleanPath=blogArticleMatch?'/blog':path;
      window.location.href=getLocalizedPath(cleanPath,lang);
      return null;
    }
    const loading=<div className="loading-page"><SkeletonDashboard/></div>;
    if(path==='/how-it-works')return<Suspense fallback={loading}><HowItWorksPage lang="en"/></Suspense>;
    if(path==='/for-beginners')return<Suspense fallback={loading}><ForBeginnersPage lang="en"/></Suspense>;
    if(path==='/faq')return<Suspense fallback={loading}><FaqPage lang="en"/></Suspense>;
    if(path==='/free-english-practice')return<Suspense fallback={loading}><FreeEnglishPracticePage lang="en"/></Suspense>;
    if(path==='/english-conversation-app')return<Suspense fallback={loading}><EnglishConversationAppPage lang="en"/></Suspense>;
    if(path==='/chatter3-vs-italki')return<Suspense fallback={loading}><Chatter3VsItalkiPage lang="en"/></Suspense>;
    if(path==='/chatter3-vs-cambly')return<Suspense fallback={loading}><Chatter3VsCamblyPage lang="en"/></Suspense>;
    if(path==='/blog')return<Suspense fallback={loading}><BlogPage lang="en"/></Suspense>;
    if(blogArticleMatch)return<Suspense fallback={loading}><BlogArticlePage slug={blogArticleMatch[1]} lang="en"/></Suspense>;
  }

  const[view,setView]=useState('auth');
  const[user,setUser]=useState(null);
  const[session,setSession]=useState(null);
  const[callStartedAt,setCallStartedAt]=useState(null);
  const[showOnboarding,setShowOnboarding]=useState(false);
  const[showProfileGate,setShowProfileGate]=useState(false);
  const[showExchange,setShowExchange]=useState(false);
  const[showFriends,setShowFriends]=useState(false);
  const[maintenance,setMaintenance]=useState(null);
  const[maintenanceMsg,setMaintenanceMsg]=useState('');
  const[appSettings,setAppSettings]=useState({matching_by_level:'false'});
  const[resetToken,setResetToken]=useState(null);
  const[showHelp,setShowHelp]=useState(false);
  const{t,lang}=useTranslation();
  const toast=useToast();

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const tokenParam=params.get('token');
    if(tokenParam){setResetToken(tokenParam);setView('reset');window.history.replaceState({},'',window.location.pathname);}
    fetch(`${API_URL}/api/status`).then(r=>r.json()).then(d=>{
      if(d.maintenance){setMaintenance(true);setMaintenanceMsg(d.maintenanceMessage||'We are currently performing maintenance. Please check back later.');}
      else{setMaintenance(false);}
      if(d.settings)setAppSettings(d.settings);
    }).catch(()=>setMaintenance(false));
  },[]);

  useEffect(()=>{
    const saved=localStorage.getItem('chatter3_user');
    const token=localStorage.getItem('chatter3_token');
    if(saved&&!token){localStorage.removeItem('chatter3_user');return;}
    if(saved){const u=JSON.parse(saved);setUser(u);setView('dashboard');checkSession(u.id);}
  },[]);

  // Refresh user presence every 30 seconds while dashboard is open
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => {
      fetch(`${API_URL}/api/user/${user.id}`).catch(()=>{});
    }, 30000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(()=>{
    if(!showHelp)return;
    const h=()=>setShowHelp(false);
    document.addEventListener('click',h);
    return()=>document.removeEventListener('click',h);
  },[showHelp]);

  const checkSession=async(uid)=>{
    try{const r=await authFetch(`${API_URL}/api/matching/session/${uid}`);const d=await r.json();
      if(d.active_session){
        const age=Date.now()-new Date(d.session.created_at).getTime();
        if(age<300000){setSession(d.session);setCallStartedAt(Date.now());setView('video');}
      }}catch{}
  };

  const refreshUser=async(uid)=>{
    try{const r=await authFetch(`${API_URL}/api/user/${uid}`);const d=await r.json();
      if(d.success){setUser(prev=>{const u={...prev,...d.user};localStorage.setItem('chatter3_user',JSON.stringify(u));return u;});}}catch{}
  };

  const setAndSaveUser=(u)=>{setUser(u);localStorage.setItem('chatter3_user',JSON.stringify(u));};

  const handleLogin=(u)=>{
    setAndSaveUser(u);setView('dashboard');
    if(!localStorage.getItem('chatter3_onboarding_seen'))setShowOnboarding(true);
    else if(u.auth_provider==='google'&&(!u.country||!u.native_language))setShowProfileGate(true);
  };

  const handleLogout=async()=>{
    if(user)try{await authFetch(`${API_URL}/api/matching/leave`,{method:'POST',body:JSON.stringify({})});}catch{}
    localStorage.removeItem('chatter3_user');localStorage.removeItem('chatter3_token');
    window.location.href='/';
  };

  const handleFindPartner=async()=>{
    if(!user)return;
    if(!user.country||!user.native_language){setShowProfileGate(true);return;}
    // Check FP balance
    try{
      const r=await authFetch(`${API_URL}/api/user/balances/${user.id}`);
      const d=await r.json();
      const fp=d.fp??0;const rp=d.rp??0;
      const isFM=!!d.founding_member;
      const inFP=!!d.in_free_period;
      setAndSaveUser({...user,fp_balance:fp,rp_balance:rp,founding_member:isFM,in_free_period:inFP});
      if(fp<1&&!isFM&&!inFP){setShowExchange(true);return;}
    }catch{}
    setView('matching');
  };

  return(
    <>
    <OfflineBanner />
    <ErrorBoundary>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-container">
        {maintenance===null?(
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#94a3b8'}}>Loading…</div>
        ):maintenance&&!user?.is_admin?(
           <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}} className="bg-light">
            <div style={{textAlign:'center',maxWidth:480,padding:'2rem'}}>
              <div style={{fontSize:'3rem',marginBottom:'.75rem'}}>🔧</div>
              <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.5rem',fontWeight:800,margin:'0 0 .5rem'}}>Under Maintenance</h1>
              <p style={{fontSize:'.95rem',color:'#64748b',margin:0,lineHeight:1.6}}>{maintenanceMsg}</p>
              <p style={{fontSize:'.8rem',color:'#94a3b8',marginTop:'1.5rem'}}>We'll be back soon. Thank you for your patience!</p>
            </div>
          </div>
        ):(
        <>
        {showOnboarding&&<OnboardingSlider t={t} onComplete={()=>{localStorage.setItem('chatter3_onboarding_seen','1');setShowOnboarding(false);}}/>}
        {showProfileGate&&user&&<ProfileGate t={t} user={user} onComplete={u=>{setAndSaveUser(u);setShowProfileGate(false);setView('matching');}} onDismiss={()=>setShowProfileGate(false)}/>}
        {showExchange&&user&&<ExchangeModal t={t} user={user} onClose={()=>setShowExchange(false)} onDone={(fp,rp)=>{setAndSaveUser({...user,fp_balance:fp,rp_balance:rp});setShowExchange(false);if(fp>=1)setView('matching');}}/>}
        {showFriends&&user&&<FriendsModal t={t} user={user} onClose={()=>setShowFriends(false)}/>}

        {view==='auth'&&<AuthView onLogin={handleLogin} setView={setView} t={t} lang={lang}/>}
        {view==='forgot'&&<ForgotPasswordView onBack={()=>setView('auth')} t={t} lang={lang}/>}
        {view==='reset'&&resetToken&&<ResetPasswordView token={resetToken} onBack={()=>setView('auth')} t={t} lang={lang}/>}

        {view!=='auth'&&view!=='video'&&view!=='precall'&&(
          <header className="app-header">
            <div className="app-header-content">
              <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                <img src="/chatter3_logo.png" alt="Chatter3" className="header-logo-img"/>
                {user&&<span style={{fontWeight:600,fontSize:'.85rem',color:'white',whiteSpace:'nowrap'}}>{user.nickname||user.username}</span>}
                {user&&user.founding_member?<span style={{padding:'1px 6px',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',borderRadius:8,fontSize:'.6rem',fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{t.profile.foundingMember}</span>:null}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                {user&&user.is_admin&&<button className="header-btn btn-admin" onClick={()=>setView('admin')} style={{background:'rgba(255,255,255,.15)',color:'white',border:'1px solid rgba(255,255,255,.2)',fontSize:'.82rem',padding:'4px 12px'}}>Admin</button>}
                <button className="header-btn btn-logout" onClick={handleLogout} style={{background:'rgba(255,255,255,.15)',color:'#fca5a5',border:'1px solid rgba(255,255,255,.15)',fontSize:'.82rem',padding:'4px 12px'}}>{t.nav.logout||'Logout'}</button>
              </div>
              {user&&(
                <div className="user-info" style={{width:'100%',justifyContent:'center',gap:6}}>
                  <div className="header-pts">🎫 {user.fp_balance??0} FP · ⭐ {(user.rp_balance||0).toFixed(1)} RP</div>
                  <button className="header-btn btn-friends" onClick={()=>setShowFriends(true)} style={{background:'rgba(255,255,255,.12)',color:'white',border:'1px solid rgba(255,255,255,.15)'}}>👥</button>
                  <NotificationCenter user={user} API_URL={API_URL} authFetch={authFetch}/>
                  <div className="help-menu-wrapper" style={{position:'relative'}}>
                    <button onClick={(e)=>{e.stopPropagation();setShowHelp(!showHelp)}} className="header-btn btn-help" style={{background:'rgba(255,255,255,.12)',color:'white',border:'1px solid rgba(255,255,255,.15)'}}>❓</button>
                    {showHelp&&<div className="help-dropdown" style={{position:'absolute',top:'100%',right:0,background:'white',borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,.15)',padding:8,minWidth:160,zIndex:100}}>
                      <a href="/how-it-works" target="_blank">📖 {t.nav.howItWorks}</a>
                      <a href="/for-beginners" target="_blank">🌱 {t.nav.forBeginners}</a>
                      <a href="/free-english-practice" target="_blank">🗣️ Free Practice</a>
                      <a href="/english-conversation-app" target="_blank">📱 Conversation App</a>
                      <a href="/blog" target="_blank">📝 {t.nav.blog}</a>
                      <a href="/faq" target="_blank">❓ {t.nav.faq||'FAQ'}</a>
                      <a href="/chatter3-vs-italki" target="_blank">⚔️ vs italki</a>
                      <a href="/chatter3-vs-cambly" target="_blank">⚔️ vs Cambly</a>
                    </div>}
                  </div>
                  <LanguageSwitcher currentLang={localStorage.getItem('chatter3_lang')||'en'}/>
                </div>
              )}
            </div>
          </header>
        )}

        <main className="app-content">
          {view==='dashboard'&&user&&<DashboardView user={user} settings={appSettings} onNavigate={setView} onFindPartner={handleFindPartner} onExchange={()=>setShowExchange(true)} onRefreshUser={()=>refreshUser(user.id)} t={t}/>}
           {view==='matching'&&user&&<MatchingView user={user} settings={appSettings} onCancel={()=>setView('dashboard')} onMatch={s=>{setSession(s);setView('precall');}} t={t}/>}
          {view==='precall'&&user&&session&&<PreCallView session={session} onStart={()=>{setCallStartedAt(Date.now());setView('video');}} onCancel={async()=>{try{await authFetch(`${API_URL}/api/matching/end`,{method:'POST',body:JSON.stringify({session_id:session.id,reason:'cancelled'})});}catch{}setSession(null);setView('matching');}} t={t}/>}
          {view==='video'&&user&&session&&<VideoRoomView user={user} session={session} callStartedAt={callStartedAt} onEnd={()=>{setSession(null);setCallStartedAt(null);refreshUser(user.id);setView('dashboard');}} t={t}/>}
          {view==='profile'&&user&&<ProfileView user={user} onBack={()=>setView('dashboard')} onUpdate={setAndSaveUser} onShowOnboarding={()=>setShowOnboarding(true)} t={t}/>}
          {view==='admin'&&user&&user.is_admin?<Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh',color:'#94a3b8'}}>Loading admin...</div>}><AdminDashboard user={user} onBack={()=>setView('dashboard')} t={getTranslations('en')}/></Suspense>:null}
        </main>
        {user&&view!=='video'&&view!=='precall'&&(
          <footer style={{background:'#f8fafc',borderTop:'1px solid #e5e7eb',padding:'1.5rem',textAlign:'center',fontSize:'.8rem',color:'#6b7280'}}>
            <div style={{maxWidth:600,margin:'0 auto',display:'flex',justifyContent:'center',gap:'1.5rem',flexWrap:'wrap',marginBottom:'.75rem'}}>
              <a href="/how-it-works" style={{color:'#4f46e5',textDecoration:'none',fontWeight:500}}>{t.nav.howItWorks}</a>
              <a href="/for-beginners" style={{color:'#4f46e5',textDecoration:'none',fontWeight:500}}>{t.nav.forBeginners}</a>
              <a href="/blog" style={{color:'#4f46e5',textDecoration:'none',fontWeight:500}}>{t.nav.blog}</a>
            </div>
            <p style={{margin:0}}>{t.footer.copyright}</p>
          </footer>
        )}
        </>
        )}
      </div>
    </GoogleOAuthProvider>
    </ErrorBoundary>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// FORGOT PASSWORD VIEW
// ─────────────────────────────────────────────────────────────────
function ForgotPasswordView({onBack,t,lang}){
  const[email,setEmail]=useState('');
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState('');
  const[sent,setSent]=useState(false);

  const submit=async(e)=>{
    e.preventDefault();
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${API_URL}/api/auth/forgot-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      const d=await r.json();
      if(d.success)setSent(true);else setErr(d.error||t.forgotPassword.error);
    }catch{setErr(t.forgotPassword.networkError);}finally{setLoading(false);}
  };

  return(
    <div className="auth-container">
      <div className="auth-box" style={{position:'relative'}}>
        <div style={{position:'absolute',top:12,right:12,zIndex:10}}>
          <LanguageSwitcher currentLang={lang}/>
        </div>
        <div className="auth-header">
          <img src="/chatter3_logo.png" alt="Chatter3" className="auth-logo"/>
          <p className="auth-subtitle">{t.forgotPassword.title}</p>
        </div>
        {err&&<div className="error-message">{err}</div>}
        {sent?(
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'.75rem'}}>📧</div>
             <p style={{fontSize:'.92rem',margin:'0 0 .5rem'}}>{t.forgotPassword.checkInbox}</p>
            <p style={{fontSize:'.82rem',color:'#6b7280',margin:0}}>{t.forgotPassword.emailSent.replace('{email}',email)}</p>
            <button className="auth-link" onClick={onBack} style={{marginTop:'1.25rem',background:'none',border:'none',color:'#4f46e5',fontSize:'.88rem',cursor:'pointer'}}>{t.forgotPassword.backToSignIn}</button>
          </div>
        ):(
          <form onSubmit={submit} className="register-form">
            <p style={{fontSize:'.85rem',color:'#6b7280',margin:'0 0 1rem'}}>{t.forgotPassword.instruction}</p>
            <div className="form-group"><label htmlFor="forgot-email">{t.auth.email}</label><input id="forgot-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <button type="submit" disabled={loading}>{loading?t.forgotPassword.sending:t.forgotPassword.sendResetLink}</button>
            <button type="button" className="auth-link" onClick={onBack} style={{marginTop:'.75rem',background:'none',border:'none',color:'#4f46e5',fontSize:'.85rem',cursor:'pointer',width:'100%'}}>{t.forgotPassword.backToSignIn}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// RESET PASSWORD VIEW
// ─────────────────────────────────────────────────────────────────
function ResetPasswordView({token,onBack,t,lang}){
  const[password,setPassword]=useState('');
  const[confirm,setConfirm]=useState('');
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState('');
  const[success,setSuccess]=useState(false);

  const submit=async(e)=>{
    e.preventDefault();
    if(password!==confirm){setErr(t.resetPassword.passwordsMismatch);return;}
    if(password.length<6){setErr(t.resetPassword.passwordTooShort);return;}
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${API_URL}/api/auth/reset-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,new_password:password})});
      const d=await r.json();
      if(d.success)setSuccess(true);else setErr(d.error||t.resetPassword.error);
    }catch{setErr(t.resetPassword.networkError);}finally{setLoading(false);}
  };

  return(
    <div className="auth-container">
      <div className="auth-box" style={{position:'relative'}}>
        <div style={{position:'absolute',top:12,right:12,zIndex:10}}>
          <LanguageSwitcher currentLang={lang}/>
        </div>
        <div className="auth-header">
          <img src="/chatter3_logo.png" alt="Chatter3" className="auth-logo"/>
          <p className="auth-subtitle">{t.resetPassword.title}</p>
        </div>
        {err&&<div className="error-message">{err}</div>}
        {success?(
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'.75rem'}}>✅</div>
             <p style={{fontSize:'.92rem',margin:'0 0 .5rem'}}>{t.resetPassword.successTitle}</p>
            <p style={{fontSize:'.82rem',color:'#6b7280',margin:0}}>{t.resetPassword.successBody}</p>
            <button className="auth-link" onClick={onBack} style={{marginTop:'1.25rem',background:'#4f46e5',color:'white',border:'none',borderRadius:8,padding:'10px 24px',fontSize:'.88rem',cursor:'pointer'}}>{t.resetPassword.signIn}</button>
          </div>
        ):(
          <form onSubmit={submit} className="register-form">
            <div className="form-group"><label htmlFor="reset-password">{t.resetPassword.newPassword}</label><input id="reset-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/></div>
            <div className="form-group"><label htmlFor="reset-confirm">{t.resetPassword.confirmPassword}</label><input id="reset-confirm" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={6}/></div>
            <button type="submit" disabled={loading}>{loading?t.resetPassword.updating:t.resetPassword.updatePassword}</button>
            <button type="button" className="auth-link" onClick={onBack} style={{marginTop:'.75rem',background:'none',border:'none',color:'#4f46e5',fontSize:'.85rem',cursor:'pointer',width:'100%'}}>{t.resetPassword.backToSignIn}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AUTH VIEW
// ─────────────────────────────────────────────────────────────────
function AuthView({onLogin,setView,t,lang}){
  const[reg,setReg]=useState(false);
  const[loading,setLoading]=useState(false);
  const[terms,setTerms]=useState(false);
  const[ageConfirm,setAgeConfirm]=useState(false);
  const[form,setForm]=useState({email:'',password:'',username:'',english_level:'beginner',country:'',native_language:''});
  const[err,setErr]=useState('');
  const[turnstileToken,setTurnstileToken]=useState('');
  const refParam=new URLSearchParams(window.location.search).get('ref')||'';
  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const submit=async(e)=>{
    e.preventDefault();
    if(reg&&!terms){setErr(t.auth.termsError);return;}
    if(reg&&!ageConfirm){setErr(t.auth?.ageRequired||'You must confirm you are at least 13 years old');return;}
    if(!turnstileToken){setErr(t.auth.captchaError);return;}
    setLoading(true);setErr('');
    try{
      const body={...form,turnstileToken,...(refParam?{ref:refParam}:{})};
      const r=await fetch(`${API_URL}${reg?'/api/auth/register':'/api/auth/login'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d=await r.json();
      if(d.success){if(d.token)localStorage.setItem('chatter3_token',d.token);onLogin(d.user);}else setErr(d.error||t.auth.authError);
    }catch{setErr(t.auth.networkError);}finally{setLoading(false);}
  };

  const googleSuccess=async(cr)=>{
    setLoading(true);setErr('');
    try{
      try{
        const r=await fetch(`${API_URL}/api/auth/google`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:cr.credential,...(refParam?{ref:refParam}:{})})});
        const d=await r.json();
        if(d.success){if(d.token)localStorage.setItem('chatter3_token',d.token);onLogin(d.user);}else setErr(d.detail||d.error||t.auth.googleError);
      }catch(innerErr){
        console.error('Google OAuth error:',innerErr);
        toast.error(t.auth?.googleUnavailable||'Google login unavailable — please use email');
      }
    }finally{setLoading(false);}
  };

  return(
    <div className="auth-container">
      <div className="auth-box" style={{position:'relative'}}>
        <div style={{position:'absolute',top:12,right:12,zIndex:10}}>
          <LanguageSwitcher currentLang={lang}/>
        </div>
        <div className="auth-header">
          <img src="/chatter3_logo.png" alt="Chatter3" className="auth-logo"/>
          <h1 style={{position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0,0,0,0)',whiteSpace:'nowrap',border:0}}>Chatter3 — Free English Conversation Practice with Real People</h1>
          <p className="auth-subtitle">{t.auth.subtitle}</p>
          <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:6,background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',padding:'5px 14px',borderRadius:20,fontSize:'.8rem',fontWeight:600,letterSpacing:'.02em'}}>
            <span style={{fontSize:'.95rem'}}>&#10003;</span> {t.auth.freeBadge}
          </div>
        </div>
        {err&&<div className="error-message">{err}</div>}
        <form onSubmit={submit} className="register-form">
          <div style={{background:'linear-gradient(135deg,#eef2ff,#e0e7ff)',border:'1px solid #c7d2fe',borderRadius:10,padding:'10px 16px',marginBottom:16,fontSize:'.88rem',fontWeight:500,color:'#4338ca',textAlign:'center'}}>
            {t.auth.freeBanner}
          </div>
          {reg&&<>
            <div className="form-group"><label htmlFor="reg-username">{t.auth.username}</label><input id="reg-username" value={form.username} onChange={upd('username')} required/></div>
            <div className="form-group"><label htmlFor="reg-country">{t.auth.country}</label><CountrySelect id="reg-country" value={form.country} onChange={v=>setForm(f=>({...f,country:v}))} required/></div>
            <div className="form-group"><label htmlFor="reg-native">{t.auth.nativeLanguage}</label><input id="reg-native" value={form.native_language} onChange={upd('native_language')} required placeholder={t.auth.nativeLanguagePlaceholder}/></div>
            <div className="form-group"><label htmlFor="reg-level">{t.auth.level}</label>
              <select id="reg-level" value={form.english_level} onChange={upd('english_level')}>
                <option value="beginner">{t.auth.beginner}</option><option value="intermediate">{t.auth.intermediate}</option><option value="advanced">{t.auth.advanced}</option>
              </select>
            </div>
          </>}
          <div className="form-group"><label htmlFor="auth-email">{t.auth.email}</label><input id="auth-email" type="email" value={form.email} onChange={upd('email')} required/></div>
          <div className="form-group"><label htmlFor="auth-password">{t.auth.password}</label><input id="auth-password" type="password" value={form.password} onChange={upd('password')} required minLength={6}/></div>
          {!reg&&<div style={{textAlign:'right',marginTop:'-8px',marginBottom:'8px'}}><button type="button" className="auth-link" onClick={()=>setView('forgot')} style={{background:'none',border:'none',color:'#4f46e5',fontSize:'.82rem',cursor:'pointer',padding:0}}>{t.auth.forgotPassword}</button></div>}
          {reg&&(
            <>
            <div className="terms-row">
              <input type="checkbox" id="terms" checked={terms} onChange={e=>setTerms(e.target.checked)}/>
              <label htmlFor="terms" style={{fontSize:'.82rem',color:'#6b7280',lineHeight:1.4}}>
                {t.auth?.termsPrefix||'I agree to the '}
                <a href="https://chatter3.com/terms-of-service" target="_blank" style={{color:'#4f46e5',textDecoration:'underline'}}>{t.auth?.termsOfService||'Terms of Service'}</a>
                {t.auth?.termsMiddle||', '}
                <a href="https://chatter3.com/privacy-policy" target="_blank" style={{color:'#4f46e5',textDecoration:'underline'}}>{t.auth?.privacyPolicy||'Privacy Policy'}</a>
                {t.auth?.termsMiddle2||', and '}
                <a href="https://chatter3.com/refund-policy" target="_blank" style={{color:'#4f46e5',textDecoration:'underline'}}>{t.auth?.refundPolicy||'Refund Policy'}</a>.
              </label>
            </div>
            <div className="terms-row" style={{marginTop:8}}>
              <input type="checkbox" id="age-confirm" checked={ageConfirm} onChange={e=>setAgeConfirm(e.target.checked)}/>
              <label htmlFor="age-confirm" style={{fontSize:'.82rem',color:'#6b7280',lineHeight:1.4}}>
                {t.auth?.ageConfirm||'I confirm I am at least 13 years old'}
              </label>
            </div>
            </>
          )}
          <TurnstileWidget onVerify={setTurnstileToken} onExpire={()=>setTurnstileToken('')}/>
          <button type="submit" disabled={loading||(reg&&(!terms||!ageConfirm))} style={{opacity:reg&&(!terms||!ageConfirm)?0.55:1,cursor:reg&&(!terms||!ageConfirm)?'not-allowed':'pointer'}}>
            {loading?t.auth.loading:reg?t.auth.createAccount:t.auth.signIn}
          </button>
        </form>
        <div className="auth-divider"><span>{t.auth.or}</span></div>
        <div className="google-button-container">
          <GoogleLogin onSuccess={googleSuccess} onError={()=>setErr(t.auth.googleError)} useOneTap={false} cancel_on_tap_outside={true}/>
        </div>
        <p style={{fontSize:'.72rem',color:'#9ca3af',marginTop:6,textAlign:'center'}}>{t.auth?.googleUnavailable||'Google login unavailable? Use email above.'}</p>
        <button className="auth-link" onClick={()=>{setReg(v=>!v);setErr('');setTerms(false);setAgeConfirm(false);}}>
          {reg?t.auth.hasAccount:t.auth.noAccount}
        </button>
      </div>
      <div className="auth-footer">
        <div className="auth-footer-links">
          <a href="/how-it-works">{t.nav.howItWorks}</a>
          <a href="/for-beginners">{t.nav.forBeginners}</a>
          <a href="/free-english-practice">Free Practice</a>
          <a href="/english-conversation-app">Conversation App</a>
          <a href="/blog">{t.nav.blog}</a>
          <a href="/faq">{t.nav.faq||'FAQ'}</a>
          <a href="/chatter3-vs-italki">vs italki</a>
          <a href="/chatter3-vs-cambly">vs Cambly</a>
          <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
        </div>
        <p>{t.footer.copyright}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LEADERBOARD CARD
// ─────────────────────────────────────────────────────────────────
function LeaderboardCard({userId,t}){
  const[leaderboard,setLeaderboard]=useState([]);
  const[mode,setMode]=useState('all-time');
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    setLoading(true);
    fetch(`${API_URL}/api/leaderboard?mode=${mode}`).then(r=>r.json()).then(d=>{
      setLeaderboard(d.leaderboard||[]);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[mode]);

  const medals=['🥇','🥈','🥉'];

  return(
    <div className="leaderboard-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
        <h3 style={{margin:0}}>🏆 {t?.leaderboard?.title||'Leaderboard'}</h3>
        <div className="lb-tabs">
          <button onClick={()=>setMode('all-time')} className={`lb-tab${mode==='all-time'?' active':''}`}>{t?.leaderboard?.allTime||'All-Time'}</button>
          <button onClick={()=>setMode('weekly')} className={`lb-tab${mode==='weekly'?' active':''}`}>{t?.leaderboard?.weekly||'Weekly'}</button>
        </div>
      </div>
      {loading?(
        <div style={{textAlign:'center',padding:'1rem',color:'#6b7280',fontSize:'.85rem'}}>{t?.leaderboard?.loading||'Loading...'}</div>
      ):leaderboard.length===0?(
        <div style={{textAlign:'center',padding:'1rem',color:'#6b7280',fontSize:'.85rem'}}>{t?.leaderboard?.empty||'No data yet. Complete calls to climb the leaderboard!'}</div>
      ):(
        <div>
          {leaderboard.map((entry,i)=>{
            const isMe=entry.id===userId;
            return(
              <div key={i} className={`lb-row${isMe?' me':''}`}>
                <span className="lb-rank">{i<3?medals[i]:entry.rank}</span>
                <span className="lb-name">{entry.nickname}</span>
                <span className="lb-sessions">{entry.totalSessions} {t?.leaderboard?.calls||'calls'}</span>
                <span className="lb-score">{entry.score} {t?.leaderboard?.pts||'pts'}</span>
                {entry.streak>0&&<span className="lb-streak" title={(t?.leaderboard?.streakTooltip||'{streak} day streak').replace('{streak}',entry.streak)}>🔥{entry.streak}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────────────────────────
function InstallBanner({t}){
  const{isInstallable,install,dismiss,wasDismissed}=useInstallPrompt();
  const[visible,setVisible]=useState(false);
  useEffect(()=>{
    if(isInstallable&&!wasDismissed()){
      const timer=setTimeout(()=>setVisible(true),3000);
      return()=>clearTimeout(timer);
    }
  },[isInstallable,wasDismissed]);
  if(!visible)return null;
  return(
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:1000,padding:'12px 16px',background:'linear-gradient(135deg,#4f46e5,#6366f1)',color:'white',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,boxShadow:'0 -4px 20px rgba(0,0,0,.2)',fontSize:'.85rem',fontWeight:500}}>
      <span>📲 {t?.dashboard?.installApp||'Install Chatter3 for faster access'}</span>
      <div style={{display:'flex',gap:8,flexShrink:0}}>
        <button onClick={async()=>{await install();setVisible(false);}} style={{background:'white',color:'#4f46e5',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,cursor:'pointer',fontSize:'.82rem'}}>{t?.dashboard?.install||'Install'}</button>
        <button onClick={()=>{dismiss();setVisible(false);}} style={{background:'transparent',color:'white',border:'1px solid rgba(255,255,255,.4)',borderRadius:8,padding:'8px 12px',cursor:'pointer',fontSize:'.82rem'}}>{t?.dashboard?.notNow||'Not now'}</button>
      </div>
    </div>
  );
}

// ── Vocabulary Review Component (Spaced Repetition) ──────────
function VocabularyReview({userId}){
  const[words,setWords]=useState([]);
  const[loading,setLoading]=useState(true);
  const[expanded,setExpanded]=useState(false);
  const[showAdd,setShowAdd]=useState(false);
  const[newWord,setNewWord]=useState('');
  const[newContext,setNewContext]=useState('');
  const[adding,setAdding]=useState(false);
  const toast=useToast();

  useEffect(()=>{
    fetch(`${API_URL}/api/vocabulary/review`,{headers:{'Authorization':`Bearer ${localStorage.getItem('chatter3_token')}`}}).then(r=>r.json()).then(d=>{
      if(d.success)setWords(d.words||[]);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[userId]);

  const addWord=()=>{
    if(!newWord.trim()||adding)return;
    setAdding(true);
    fetch(`${API_URL}/api/vocabulary/log`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('chatter3_token')}`},body:JSON.stringify({word:newWord.trim(),context:newContext.trim()})}).then(r=>r.json()).then(d=>{
      if(d.success){setNewWord('');setNewContext('');setShowAdd(false);setWords(prev=>[{id:'new',word:newWord.trim(),context:newContext.trim(),mastery_level:0,review_count:0},...prev]);}
      setAdding(false);
    }).catch(()=>{setAdding(false);toast.error('Failed to save word');});
  };

  const masteryColors=['#ef4444','#f59e0b','#eab308','#22c55e','#10b981','#059669'];
  const masteryLabels=[t?.dashboard?.masteryNew||'New',t?.dashboard?.masteryLearning||'Learning',t?.dashboard?.masteryFamiliar||'Familiar',t?.dashboard?.masteryKnown||'Known',t?.dashboard?.masteryMastered||'Mastered',t?.dashboard?.masteryFluent||'Fluent'];

  if(loading)return null;

  return(
    <div style={{marginTop:'.75rem',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
      {/* Collapsible Header */}
      <button onClick={()=>setExpanded(!expanded)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:expanded?'#f1f5f9':'#f8fafc',border:'none',cursor:'pointer',transition:'background .15s'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'1.1rem'}}>📚</span>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:'.85rem',fontWeight:600,color:'#1e293b'}}>{t?.dashboard?.vocabularyBank||'Vocabulary Bank'}</div>
            <div style={{fontSize:'.7rem',color:'#64748b'}}>{words.length===1?(t?.dashboard?.wordSaved||'{count} word saved').replace('{count}',words.length):(t?.dashboard?.wordsSaved||'{count} words saved').replace('{count}',words.length)}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          {!expanded&&words.length>0&&<span style={{fontSize:'.7rem',color:'#6366f1',fontWeight:500}}>{t?.dashboard?.tapToExpand||'Tap to expand'}</span>}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{transform:expanded?'rotate(180deg)':'rotate(0deg)',transition:'transform .2s'}}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded&&(
        <div style={{padding:'0 14px 14px',background:'#f8fafc'}}>
          {/* Add Word Button */}
          <div style={{display:'flex',gap:'6px',marginBottom:'10px'}}>
            <button onClick={()=>setShowAdd(!showAdd)} style={{flex:1,padding:'8px',background:showAdd?'#e2e8f0':'#6366f1',color:showAdd?'#374151':'white',border:'none',borderRadius:6,cursor:'pointer',fontSize:'.8rem',fontWeight:600,transition:'background .15s'}}>{showAdd?(t?.dashboard?.cancel||'Cancel'):(t?.dashboard?.addNewWord||'+ Add New Word')}</button>
          </div>

          {/* Add Word Form */}
          {showAdd&&(
            <div style={{marginBottom:'10px',padding:'10px',background:'white',radius:8,border:'1px solid #e2e8f0',borderRadius:8}}>
              <input value={newWord} onChange={e=>setNewWord(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addWord()} placeholder={t?.dashboard?.wordPlaceholder||"e.g., 'procrastinate'"} autoFocus style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,marginBottom:'6px',fontSize:'.85rem',boxSizing:'border-box'}}/>
              <input value={newContext} onChange={e=>setNewContext(e.target.value)} placeholder={t?.dashboard?.contextPlaceholder||'Where you learned it (optional)'} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,marginBottom:'8px',fontSize:'.85rem',boxSizing:'border-box'}}/>
              <button onClick={addWord} disabled={!newWord.trim()||adding} style={{width:'100%',padding:'8px',background:newWord.trim()&&!adding?'#22c55e':'#e2e8f0',color:newWord.trim()&&!adding?'white':'#9ca3af',border:'none',borderRadius:6,cursor:newWord.trim()&&!adding?'pointer':'not-allowed',fontSize:'.85rem',fontWeight:600,transition:'background .15s'}}>{adding?(t?.dashboard?.saving||'Saving...'):(t?.dashboard?.saveWord||'Save Word')}</button>
            </div>
          )}

          {/* Words List */}
          {words.length===0?(
            <div style={{textAlign:'center',padding:'16px 0',color:'#94a3b8',fontSize:'.85rem'}}>
              <div style={{fontSize:'1.5rem',marginBottom:'6px'}}>✨</div>
              {t?.dashboard?.noWordsSaved||'No words saved yet. Add words from conversations!'}
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
              {words.slice(0,expanded?20:5).map(w=>(
                <div key={w.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:'white',borderRadius:6,fontSize:'.85rem',border:'1px solid #f1f5f9'}}>
                  <div style={{minWidth:0,flex:1}}>
                    <span style={{fontWeight:600,color:'#1e293b'}}>{w.word}</span>
                    {w.context&&<span style={{color:'#94a3b8',marginLeft:6,fontSize:'.75rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'inline-block',maxWidth:'120px'}}>{w.context}</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',flexShrink:0,marginLeft:'8px'}}>
                    <div style={{width:'36px',height:'4px',background:'#e2e8f0',borderRadius:2}}>
                      <div style={{width:`${((w.mastery_level||0)/5)*100}%`,height:'100%',background:masteryColors[w.mastery_level]||masteryColors[0],borderRadius:2,transition:'width .3s'}}/>
                    </div>
                    <span style={{fontSize:'.65rem',color:masteryColors[w.mastery_level]||masteryColors[0],fontWeight:600,minWidth:'48px',textAlign:'right'}}>{masteryLabels[w.mastery_level]||'New'}</span>
                  </div>
                </div>
              ))}
              {words.length>20&&<div style={{fontSize:'.75rem',color:'#64748b',textAlign:'center',padding:'6px 0'}}>+{words.length-20} more words</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AchievementsSection({t}){
  const[achievements,setAchievements]=useState([]);
  const[newUnlocked,setNewUnlocked]=useState([]);
  useEffect(()=>{
    authFetch(`${API_URL}/api/achievements`).then(r=>r.json()).then(d=>{if(d.success){setAchievements(d.achievements||[]);setNewUnlocked(d.newly_unlocked||[]);}}).catch(()=>{});
  },[]);
  const unlocked=achievements.filter(a=>a.unlocked);
  if(achievements.length===0)return null;
  return(
    <div style={{background:'white',borderRadius:12,padding:'1rem',marginBottom:'1rem',border:'1px solid #e5e7eb'}}>
      <h3 style={{fontFamily:'Sora,sans-serif',fontSize:'.95rem',margin:'0 0 .75rem',display:'flex',alignItems:'center',gap:6}}>🏆 {t?.dashboard?.achievements||'Achievements'}</h3>
      {newUnlocked.length>0&&<div style={{background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:8,padding:'.6rem .8rem',marginBottom:'.75rem',fontSize:'.82rem'}}>
        {newUnlocked.map(a=><div key={a.type} style={{marginBottom:2}}>🎉 <b>{a.name}</b> — {a.desc}</div>)}
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'.5rem'}}>
        {achievements.map(a=>(
          <div key={a.type} style={{padding:'.6rem',borderRadius:8,border:a.unlocked?'2px solid #f59e0b':'1px solid #e5e7eb',background:a.unlocked?'#fffbeb':'#f9fafb',textAlign:'center',opacity:a.unlocked?1:.5}}>
            <div style={{fontSize:'1.5rem'}}>{a.icon}</div>
            <div style={{fontSize:'.72rem',fontWeight:600,color:a.unlocked?'#92400e':'#9ca3af',marginTop:2}}>{a.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardView({user,settings,onNavigate,onFindPartner,onExchange,onRefreshUser,t}){
  const[online,setOnline]=useState({searching:0,in_call:0,total:0,by_level:{}});
  const[balances,setBalances]=useState({fp:user.fp_balance??0,rp:user.rp_balance??0});
  const[learnerProgress,setLearnerProgress]=useState(null);
  const[reputation,setReputation]=useState(null);
  const[showGoalModal,setShowGoalModal]=useState(false);
  const[goalMinutes,setGoalMinutes]=useState(user.daily_goal_minutes||15);
  const[learningFocus,setLearningFocus]=useState(user.learning_focus||'general');
  const isFreePeriod=!!user.in_free_period;
  const canCall=balances.fp>=1||isFreePeriod;

  useEffect(()=>{
    fetch(`${API_URL}/api/stats/online`).then(r=>r.json()).then(setOnline).catch(()=>{});
    fetch(`${API_URL}/api/user/balances/${user.id}`).then(r=>r.json()).then(d=>{
      if(d.success){setBalances({fp:d.fp,rp:d.rp});if(d.fp!==user.fp_balance||d.rp!==user.rp_balance)onRefreshUser();}
    }).catch(()=>{});
    // Fetch learner progress
    fetch(`${API_URL}/api/learner/progress`,{headers:{'Authorization':`Bearer ${localStorage.getItem('chatter3_token')}`}}).then(r=>r.json()).then(d=>{
      if(d.success)setLearnerProgress(d);
    }).catch(()=>{});
    // Fetch reputation
    fetch(`${API_URL}/api/reputation`,{headers:{'Authorization':`Bearer ${localStorage.getItem('chatter3_token')}`}}).then(r=>r.json()).then(d=>{
      if(d.success)setReputation(d);
    }).catch(()=>{});
  },[user.id]);

  const totalOnline=online.total||online.searching+online.in_call;
  const sameLevel=online.by_level?.[user.english_level]||0;

  return(
    <div className="dashboard-container">
      <div className="welcome-message">
        <h2>{t.dashboard.welcome}</h2>
        <p>{t.dashboard.welcomeSubtitle}</p>
        {totalOnline>0&&(
          <div style={{display:'flex',justifyContent:'center',marginBottom:'.75rem'}}>
            <span className="dashboard-online-pill">
              <span className="live-dot"/>
              {totalOnline===1?t.dashboard.online1:t.dashboard.onlineMany.replace('{totalOnline}',totalOnline)}
              {online.searching>0&&<span style={{opacity:.7,fontWeight:400}}>&nbsp;· {online.searching} {t.dashboard.searching}</span>}
            </span>
          </div>
        )}
        {isFreePeriod&&user.founding_member&&(
          <div style={{background:'linear-gradient(135deg,#fef3c7,#fde68a)',border:'1px solid #fbbf24',borderRadius:10,padding:'10px 16px',marginBottom:'.75rem',fontSize:'.85rem',color:'#92400e',fontWeight:500}}>
            {t.dashboard.foundingMember}
          </div>
        )}
        {user.streak_count>0&&(
          <div style={{background:user.streak_count>=7?'linear-gradient(135deg,#fbbf24,#f59e0b)':user.streak_count>=3?'linear-gradient(135deg,#34d399,#10b981)':'linear-gradient(135deg,#e0e7ff,#c7d2fe)',border:`1px solid ${user.streak_count>=7?'#f59e0b':user.streak_count>=3?'#10b981':'#818cf8'}`,borderRadius:10,padding:'10px 16px',marginBottom:'.75rem',fontSize:'.85rem',color:user.streak_count>=7?'#92400e':user.streak_count>=3?'#065f46':'#3730a3',fontWeight:500}}>
            {t.dashboard.streak.replace('{count}',user.streak_count)}{user.streak_count>=7?t.dashboard.streakGreat:user.streak_count>=3?t.dashboard.streakGood:t.dashboard.streakStart}
          </div>
        )}
        {reputation&&(
          <div style={{background:reputation.badge.tier==='Trusted'?'linear-gradient(135deg,#fef3c7,#fde68a)':reputation.badge.tier==='Experienced'?'linear-gradient(135deg,#dcfce7,#bbf7d0)':reputation.badge.tier==='Active'?'linear-gradient(135deg,#e0e7ff,#c7d2fe)':'linear-gradient(135deg,#f1f5f9,#e2e8f0)',border:`1px solid ${reputation.badge.tier==='Trusted'?'#f59e0b':reputation.badge.tier==='Experienced'?'#22c55e':reputation.badge.tier==='Active'?'#6366f1':'#94a3b8'}`,borderRadius:10,padding:'10px 14px',marginBottom:'.75rem',fontSize:'.85rem',color:reputation.badge.tier==='Trusted'?'#92400e':reputation.badge.tier==='Experienced'?'#065f46':reputation.badge.tier==='Active'?'#3730a3':'#475569',fontWeight:500}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontSize:'1.2rem'}}>{reputation.badge.icon}</span>
                <div>
                  <span style={{fontWeight:700}}>{reputation.badge.tier}</span>
                  <span style={{opacity:.7,marginLeft:6}}>Reputation</span>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'50px',height:'6px',background:'rgba(0,0,0,.1)',borderRadius:3}}>
                  <div style={{width:`${reputation.score}%`,height:'100%',background:reputation.badge.color,borderRadius:3,transition:'width .3s'}}/>
                </div>
                <span style={{fontSize:'.8rem',fontWeight:700}}>{reputation.score}</span>
              </div>
            </div>
          </div>
        )}
        <button onClick={onFindPartner} className="start-matching-btn" disabled={!canCall}>
          {!canCall?t.dashboard.noFP:t.dashboard.findPartner}
        </button>
        {!canCall&&!isFreePeriod&&(
          <p style={{fontSize:'.82rem',color:'#f59e0b',marginTop:'.5rem'}}>
            ⚡ {t.dashboard.noFPWarning.replace('exchange RP for FP',t.dashboard.exchangeRP)}
          </p>
        )}
      </div>

      <div className="stats-card">
        <h3>{t.dashboard.yourBalances}</h3>
        <div className="balance-grid">
          <div className="balance-tile fp">
            <div className="balance-num fp">{balances.fp}</div>
            <div className="balance-lbl">{t.dashboard.freePoints}</div>
            <div style={{fontSize:'.7rem',color:'#6b7280',marginTop:2}}>{t.dashboard.fpDesc}</div>
          </div>
          <div className="balance-tile rp">
            <div className="balance-num rp">{balances.rp.toFixed(1)}</div>
            <div className="balance-lbl">{t.dashboard.rewardPoints}</div>
            <div style={{fontSize:'.7rem',color:'#6b7280',marginTop:2}}>{t.dashboard.rpDesc.replace('{RP_TO_FP}',RP_TO_FP)}</div>
          </div>
        </div>
        <button className="exchange-btn" onClick={onExchange}>{t.dashboard.exchangeButton}</button>

        <h3 style={{marginTop:'1.25rem'}}>{t.dashboard.yourStats}</h3>
        <div className="stat-row"><span className="stat-label">{t.dashboard.level}</span><span className="stat-value" style={{textTransform:'capitalize'}}>{user.english_level}</span></div>
        <div className="stat-row"><span className="stat-label">{t.dashboard.callDuration}</span><span className="stat-value">{user.english_level==='beginner'?t.dashboard.durationBeginner:t.dashboard.durationOther}</span></div>
        <div className="stat-row"><span className="stat-label">{t.dashboard.streakStat}</span><span className="stat-value">{user.streak_count||0} {t.dashboard.days}</span></div>
        {settings.matching_by_level==='true'&&totalOnline>0&&sameLevel<=1&&(
          <div className="stat-row"><span className="stat-label" style={{color:'#f59e0b',fontSize:'.8rem'}}>{t.dashboard.noLevelWarning.replace('{level}',user.english_level)}</span></div>
        )}
        <div className="stat-row" style={{border:'none',paddingTop:'.875rem'}}>
          <button onClick={()=>onNavigate('profile')} className="btn-subtle">
            {t.dashboard.profileHistory}
          </button>
        </div>
      </div>

      {/* Learner Progress Section (Data Moat) */}
      {learnerProgress&&(
        <div className="stats-card" style={{marginTop:'1rem'}}>
          <h3 style={{margin:'0 0 .75rem',fontSize:'1rem',fontWeight:700}}>{t?.dashboard?.learningProgress||'Your Learning Progress'}</h3>
          
          {/* Daily Goal */}
          <div style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',border:'1px solid #bbf7d0',borderRadius:10,padding:'14px',marginBottom:'.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <span style={{fontSize:'1rem'}}>{(learnerProgress.goals?.[0]?.actual_minutes||0)>=(learnerProgress.goals?.[0]?.goal_minutes||15)?'🎯':'🎯'}</span>
                <span style={{fontSize:'.85rem',fontWeight:600,color:'#166534'}}>{t?.dashboard?.dailyGoal||'Daily Goal'}</span>
              </div>
              <button onClick={()=>setShowGoalModal(true)} style={{fontSize:'.72rem',color:'#6366f1',background:'white',border:'1px solid #e2e8f0',borderRadius:4,padding:'3px 8px',cursor:'pointer',fontWeight:500}}>Edit</button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
              <div style={{flex:1,height:'10px',background:'#dcfce7',borderRadius:5,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(100,((learnerProgress.goals?.[0]?.actual_minutes||0)/(learnerProgress.goals?.[0]?.goal_minutes||15))*100)}%`,background:learnerProgress.goals?.[0]?.completed===1?'linear-gradient(90deg,#22c55e,#10b981)':'linear-gradient(90deg,#34d399,#22c55e)',borderRadius:5,transition:'width .5s ease'}}/>
              </div>
              <span style={{fontSize:'.85rem',color:'#166534',fontWeight:600,minWidth:'60px',textAlign:'right'}}>{learnerProgress.goals?.[0]?.actual_minutes||0}/{learnerProgress.goals?.[0]?.goal_minutes||15}m</span>
            </div>
            {learnerProgress.goals?.[0]?.completed===1?(
              <div style={{fontSize:'.78rem',color:'#16a34a',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}><span>✓</span> {t?.dashboard?.goalCompleted||'Goal completed! Keep it up!'}</div>
            ):(
              <div style={{fontSize:'.72rem',color:'#4ade80'}}>{(t?.dashboard?.minutesToGo||'{minutes} minutes to go').replace('{minutes}',Math.max(0,(learnerProgress.goals?.[0]?.goal_minutes||15)-(learnerProgress.goals?.[0]?.actual_minutes||0)))}</div>
            )}
          </div>

          {/* Quick Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.5rem',marginBottom:'.75rem'}}>
            <div style={{textAlign:'center',padding:'8px',background:'#f8fafc',borderRadius:6}}>
              <div style={{fontSize:'1.1rem',fontWeight:700,color:'#1e293b'}}>{learnerProgress.streak||0}</div>
              <div style={{fontSize:'.7rem',color:'#64748b'}}>{t?.dashboard?.dayStreak||'Day Streak'}</div>
            </div>
            <div style={{textAlign:'center',padding:'8px',background:'#f8fafc',borderRadius:6}}>
              <div style={{fontSize:'1.1rem',fontWeight:700,color:'#1e293b'}}>{learnerProgress.total_sessions||0}</div>
              <div style={{fontSize:'.7rem',color:'#64748b'}}>{t?.dashboard?.sessions||'Sessions'}</div>
            </div>
            <div style={{textAlign:'center',padding:'8px',background:'#f8fafc',borderRadius:6}}>
              <div style={{fontSize:'1.1rem',fontWeight:700,color:'#1e293b'}}>{learnerProgress.vocabulary_count||0}</div>
              <div style={{fontSize:'.7rem',color:'#64748b'}}>{t?.dashboard?.words||'Words'}</div>
            </div>
          </div>

          {/* Quality Trend */}
          {learnerProgress.quality_trend?.length>0&&(
            <div style={{marginBottom:'.75rem'}}>
              <div style={{fontSize:'.85rem',fontWeight:600,color:'#1e293b',marginBottom:'6px'}}>{t?.dashboard?.conversationQuality||'Conversation Quality'}</div>
              <div style={{display:'flex',gap:'4px',alignItems:'flex-end',height:'40px'}}>
                {learnerProgress.quality_trend.slice(0,10).reverse().map((q,i)=>(
                  <div key={i} style={{flex:1,background:`${q.quality_score>=70?'#22c55e':q.quality_score>=40?'#f59e0b':'#ef4444'}`,height:`${Math.max(4,q.quality_score*0.4)}px`,borderRadius:2,minWidth:0}} title={`Score: ${q.quality_score}`}/>
                ))}
              </div>
              <div style={{fontSize:'.7rem',color:'#64748b',marginTop:'4px'}}>{t?.dashboard?.lastSessions||'Last 10 sessions (higher = better)'}</div>
            </div>
          )}

          {/* Partner Rating */}
          {learnerProgress.ratings?.count>0&&(
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px',background:'#f8fafc',borderRadius:6,fontSize:'.85rem'}}>
              <span style={{color:'#64748b'}}>{t?.dashboard?.partnerRating||'Partner Rating'}</span>
              <span style={{fontWeight:600,color:'#1e293b'}}>{learnerProgress.ratings.avg?.toFixed(1)}/5 ({learnerProgress.ratings.count} ratings)</span>
            </div>
          )}

          {/* Vocabulary Review (Spaced Repetition) */}
          <VocabularyReview userId={user.id}/>
        </div>
      )}

      {/* Achievements */}
      <AchievementsSection t={t}/>

      {/* Goal Setting Modal */}
      {showGoalModal&&(
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}} role="dialog" aria-modal="true" aria-label="Set Daily Goal" onKeyDown={e=>{if(e.key==='Escape')setShowGoalModal(false);}}>
          <div style={{background:'white',borderRadius:12,padding:'24px',maxWidth:'400px',width:'90%'}}>
            <h3 style={{margin:'0 0 16px',fontSize:'1.1rem',fontWeight:700}}>{t?.dashboard?.setDailyGoal||'Set Daily Goal'}</h3>
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'.85rem',fontWeight:500,color:'#374151',display:'block',marginBottom:'6px'}}>{t?.dashboard?.minutesPerDay||'Minutes per day'}</label>
              <input type='number' value={goalMinutes} onChange={e=>setGoalMinutes(parseInt(e.target.value)||0)} min={5} max={120} style={{width:'100%',padding:'8px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.9rem'}}/>
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'.85rem',fontWeight:500,color:'#374151',display:'block',marginBottom:'6px'}}>{t?.dashboard?.learningFocus||'Learning Focus'}</label>
              <select value={learningFocus} onChange={e=>setLearningFocus(e.target.value)} style={{width:'100%',padding:'8px 12px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.9rem'}}>
                <option value='general'>{t?.dashboard?.generalEnglish||'General English'}</option>
                <option value='business'>{t?.dashboard?.businessEnglish||'Business English'}</option>
                <option value='travel'>{t?.dashboard?.travelEnglish||'Travel English'}</option>
                <option value='academic'>{t?.dashboard?.academicEnglish||'Academic English'}</option>
                <option value='conversation'>{t?.dashboard?.conversationPractice||'Conversation Practice'}</option>
              </select>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>setShowGoalModal(false)} style={{flex:1,padding:'10px',border:'1px solid #d1d5db',borderRadius:6,background:'white',cursor:'pointer',fontSize:'.85rem'}}>{t?.dashboard?.cancel||'Cancel'}</button>
              <button onClick={()=>{
                fetch(`${API_URL}/api/learner/goal`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('chatter3_token')}`},body:JSON.stringify({goal_minutes:goalMinutes,learning_focus:learningFocus})}).then(()=>{setShowGoalModal(false);onRefreshUser();}).catch(()=>toast.error('Failed to save goal'));
              }} style={{flex:1,padding:'10px',border:'none',borderRadius:6,background:'#6366f1',color:'white',cursor:'pointer',fontSize:'.85rem',fontWeight:600}}>{t?.dashboard?.saveGoal||'Save Goal'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <LeaderboardCard userId={user.id} t={t}/>

      {/* PWA Install Banner */}
      <InstallBanner t={t}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MATCHING VIEW
// ─────────────────────────────────────────────────────────────────
function MatchingView({user,settings,onCancel,onMatch,t}){
  const[status,setStatus]=useState(t.matching.looking);
  const[matched,setMatched]=useState(false);
  const[online,setOnline]=useState({searching:0,in_call:0,by_level:{}});
  const[elapsed,setElapsed]=useState(0);
  const[timedOut,setTimedOut]=useState(false);
  const stopRingRef=useRef(null);
  const t0=useRef(Date.now());
  const starters=getStarters(t);
  const[matchTip]=useState(()=>starters[Math.floor(Math.random()*starters.length)](t?.matching?.yourPartner||'your partner'));

  useEffect(()=>{
    stopRingRef.current=startRinging();
    const s=setInterval(()=>{
      fetch(`${API_URL}/api/stats/online`).then(r=>r.json()).then(setOnline).catch(()=>{});
    },10000);
    fetch(`${API_URL}/api/stats/online`).then(r=>r.json()).then(setOnline).catch(()=>{});
    const tick=setInterval(()=>{
      const e=Math.floor((Date.now()-t0.current)/1000);
      setElapsed(e);
      if(e>=MATCH_TIMEOUT){setTimedOut(true);stopRingRef.current?.();}
    },1000);
    return()=>{clearInterval(s);clearInterval(tick);stopRingRef.current?.();};
  },[]);

  useEffect(()=>{
    if(timedOut)return;
    let polling;
    const search=async()=>{
      if(matched)return;
      try{
        if(!matched){
          const r=await authFetch(`${API_URL}/api/matching/join`,{method:'POST',body:JSON.stringify({english_level:user.english_level,country:user.country,native_language:(user.native_language||'').trim().toLowerCase(),})});
          const d=await r.json();
          if(d.error==='insufficient_fp'){
            // Check if partner already matched us before bailing
            const sr=await authFetch(`${API_URL}/api/matching/session/${user.id}`);
            const sd=await sr.json();
            if(sd.active_session){clearInterval(polling);setStatus(t.matching.connecting);onMatch(sd.session);return;}
            stopRingRef.current?.();onCancel();return;
          }
          if(d.matched){setMatched(true);setStatus(t.matching.partnerFound);stopRingRef.current?.();}
        }
                const sr=await authFetch(`${API_URL}/api/matching/session/${user.id}`);
        const sd=await sr.json();
        if(sd.active_session){clearInterval(polling);setStatus(t.matching.connecting);onMatch(sd.session);}
      }catch{setStatus(t.matching.error);}
    };
    search();polling=setInterval(search,3000);
    return()=>clearInterval(polling);
  },[matched,timedOut]);

  const cancel=async()=>{
    stopRingRef.current?.();
    try{await authFetch(`${API_URL}/api/matching/leave`,{method:'POST',body:JSON.stringify({})});}catch{}
    onCancel();
  };

  const total=online.total||online.searching+online.in_call;
  const sameLevel=online.by_level?.[user.english_level]||0;
  const noLevel=settings?.matching_by_level==='true'&&total>0&&sameLevel<=1;

  if(timedOut){
    return(
      <div className="matching-screen">
        <div style={{fontSize:'2.8rem',marginBottom:'.875rem'}}>😔</div>
        <p className="match-status">{t.matching.noMatch}</p>
        <p className="match-sub" style={{maxWidth:300,textAlign:'center'}}>
          {noLevel?t.matching.noLevel.replace('{total}',total).replace('{level}',user.english_level)
            :t.matching.noMatchDesc}
        </p>
        <button onClick={cancel} className="start-matching-btn" style={{marginTop:'1.25rem'}}>{t.matching.backToDashboard}</button>
      </div>
    );
  }

  return(
    <div className="matching-screen">
      <div className="sonar-container">
        <div className="sonar-ring"/><div className="sonar-ring"/><div className="sonar-ring"/>
        <div className="sonar-core">🔍</div>
      </div>
      <p className="match-status">{status}</p>
      {user.mvp_mode
        ?<p className="match-sub">{t.matching.findingPartner}</p>
        :<p className="match-sub">{t.matching.findingLevel.replace('{level}',user.english_level)}</p>}
      <div className="level-badge">📊 {user.mvp_mode?t.matching.allLevels:user.english_level} {t.matching.minSessions.replace('{N}',user.mvp_mode||user.english_level==='beginner'?'5':'10')}</div>
      {total>0&&<div className="online-badge"><span className="online-dot"/>{total===1?t.matching.online1:t.matching.onlineMany.replace('{total}',total)}</div>}
      {elapsed>=15&&noLevel&&<p style={{fontSize:'.78rem',color:'#f59e0b',maxWidth:260,textAlign:'center',margin:'.4rem 0'}}>⚠️ {user.mvp_mode?t.matching.noUsers:t.matching.noLevelUsers.replace('{level}',user.english_level)}{t.matching.continuing}</p>}
      <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,(elapsed/MATCH_TIMEOUT)*100)}%`,background:elapsed>60?'#f59e0b':'#4f8ef7'}}/></div>
      <p style={{fontSize:'.72rem',color:'#9ca3af',margin:'0 0 .875rem'}}>{t.matching.remaining.replace('{N}',MATCH_TIMEOUT-elapsed)}</p>
      <div style={{background:'rgba(79,142,247,0.1)',border:'1px solid rgba(79,142,247,0.25)',borderRadius:12,padding:'.75rem 1rem',maxWidth:320,textAlign:'center',margin:'0 0 .875rem'}}>
        <p style={{fontSize:'.75rem',fontWeight:600,color:'#4f8ef7',margin:'0 0 .35rem'}}>{t.matching.whileYouWait}</p>
        <p style={{fontSize:'.72rem',color:'#94a3b8',margin:0}}>{matchTip}</p>
      </div>
      <button onClick={cancel} className="cancel-btn">{t.matching.cancelSearch}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRE-CALL VIEW
// ─────────────────────────────────────────────────────────────────
function PreCallView({session,onStart,onCancel,t}){
  const FROM=5;
  const[cd,setCd]=useState(FROM);
  const[partnerReputation,setPartnerReputation]=useState(null);
  const partner=session.partner||{};
  const name=partner.nickname||partner.username||t.precall.yourPartner;
  const starters=getStarters(t);
  const tip=starters[Math.floor(Math.random()*starters.length)](name);
  const LEVEL={beginner:t.auth.beginner,intermediate:t.auth.intermediate,advanced:t.auth.advanced};
  useEffect(()=>{playSound('match');},[]);
  useEffect(()=>{if(cd<=0){onStart();return;}const t=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(t);},[cd]);
  // Fetch partner reputation
  useEffect(()=>{
    if(partner.id){
      fetch(`${API_URL}/api/reputation?userId=${partner.id}`,{headers:{'Authorization':`Bearer ${localStorage.getItem('chatter3_token')}`}}).then(r=>r.json()).then(d=>{
        if(d.success)setPartnerReputation(d);
      }).catch(()=>{});
    }
  },[partner.id]);
  const R=27,C=2*Math.PI*R,offset=C*(1-cd/FROM);
  const stroke=cd>2?'#4f8ef7':cd>1?'#f59e0b':'#ef4444';
  return(
    <div className="precall-overlay">
      <div className="precall-bg"/>
      <div className="precall-card">
        <div className="precall-tag">{t.precall.matched}</div>
        <div className="precall-avatar-wrap">
          <div className="precall-avatar-ring"/>
          <div className="precall-avatar-inner">
            {partner.avatar_url?<Avatar src={partner.avatar_url} name={name} size={80}/>:<span style={{fontFamily:'Sora,sans-serif',fontSize:'2.2rem',fontWeight:800,color:'white'}}>{name.charAt(0).toUpperCase()}</span>}
          </div>
        </div>
        <h2 className="precall-name">{name}{partner.founding_member?<span style={{display:'block',marginTop:4,fontSize:'.7rem',fontWeight:600,color:'#fbbf24',letterSpacing:'.03em'}}>{t.precall.foundingMember}</span>:null}{partner.is_new_member&&!partner.founding_member?<span style={{display:'block',marginTop:4,fontSize:'.7rem',fontWeight:600,color:'#22c55e',letterSpacing:'.03em'}}>{t.precall.newMember}</span>:null}</h2>
        <div className="precall-chips">
          {partner.country&&<span className="chip country">{getFlag(partner.country)} {countryName(partner.country)}</span>}
          {partner.native_language&&<span className="chip lang">🗣️ {partner.native_language}</span>}
          {partner.english_level&&<span className="chip level">{LEVEL[partner.english_level]||partner.english_level}</span>}
          {partnerReputation&&<span className="chip" style={{background:`${partnerReputation.badge.color}20`,color:partnerReputation.badge.color,border:`1px solid ${partnerReputation.badge.color}40`}}>{partnerReputation.badge.icon} {partnerReputation.badge.tier}</span>}
        </div>
        <div className="precall-starter"><strong>💡 {t.precall.starter}</strong>{tip}</div>
        <div className="precall-countdown">
          <div style={{display:'flex',alignItems:'center',gap:'1.25rem',justifyContent:'center'}}>
            <div className="countdown-ring">
              <svg width="66" height="66" style={{transform:'rotate(-90deg)'}}>
                <circle cx="33" cy="33" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3"/>
                <circle cx="33" cy="33" r={R} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} style={{transition:'stroke-dashoffset .9s linear,stroke .3s'}}/>
              </svg>
              <span className="countdown-num" style={{color:stroke}}>{cd}</span>
            </div>
            <button className="precall-start-btn" onClick={onStart}>{t.precall.startNow}</button>
          </div>
          <p style={{color:'rgba(255,255,255,.28)',fontSize:'.75rem',margin:'.65rem 0 0'}}>{t.precall.autoStart.replace('{cd}',cd)}</p>
        </div>
        <button className="precall-back-btn" onClick={onCancel}>{t.precall.goBack}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FEEDBACK MODAL
// ─────────────────────────────────────────────────────────────────
function FeedbackModal({t,userId,onClose}){
  const[category,setCategory]=useState('general');
  const[message,setMessage]=useState('');
  const[sending,setSending]=useState(false);
  const[done,setDone]=useState(false);
  const[rpAwarded,setRpAwarded]=useState(0);
  useEffect(()=>{
    const h=(e)=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[onClose]);
  const submit=async()=>{
    if(!message.trim()||sending)return;
    setSending(true);
    try{
      const r=await authFetch(`${API_URL}/api/feedback`,{method:'POST',body:JSON.stringify({category,message:message.trim()})});
      const d=await r.json();
      if(d.success){setDone(true);setRpAwarded(d.rp_awarded||0);}
    }catch{}
    setSending(false);
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:16}} role="dialog" aria-modal="true" aria-label="Send Feedback">
      <div className="modal-panel">
        <button onClick={onClose} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:'1.3rem',cursor:'pointer',color:'#9ca3af'}}>✕</button>
        {done?(
          <div style={{textAlign:'center',padding:'1rem 0'}}>
            <div style={{fontSize:'2.5rem',marginBottom:12}}>✅</div>
            <h3 style={{fontFamily:'Sora,sans-serif',margin:'0 0 8px'}}>{t?.modals?.feedbackSuccessTitle||'Thank you for your feedback!'}</h3>
            <p style={{fontSize:'.88rem',color:'#6b7280',margin:'0 0 12px'}}>{t?.modals?.feedbackSuccessDesc||'Your input helps us improve Chatter3.'}</p>
            {rpAwarded>0&&<p style={{fontSize:'.82rem',color:'#4f8ef7',fontWeight:600}}>+{rpAwarded} {(t?.modals?.feedbackRP||'RP earned!').replace('{rp}',rpAwarded)}</p>}
            <button onClick={onClose} style={{marginTop:12,padding:'10px 24px',background:'#4f8ef7',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>{t?.modals?.feedbackDone||'Done'}</button>
          </div>
        ):(
          <div>
            <h3 style={{fontFamily:'Sora,sans-serif',margin:'0 0 4px',fontSize:'1.1rem'}}>{t?.modals?.feedbackTitle||'Send Feedback'}</h3>
            <p style={{fontSize:'.82rem',margin:'0 0 16px'}}>{t?.modals?.feedbackDesc||'Help us improve Chatter3. Your feedback is sent directly to our team.'}</p>
            <div style={{marginBottom:12}}>
              <label style={{display:'block',fontSize:'.82rem',fontWeight:600,marginBottom:4}}>{t?.modals?.feedbackCategory||'Category'}</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="admin-select" style={{width:'100%',padding:'10px 12px',borderRadius:8,fontSize:'.88rem'}}>
                <option value="general">{t?.modals?.feedbackGeneral||'General Feedback'}</option>
                <option value="bug">{t?.modals?.feedbackBug||'Bug Report'}</option>
                <option value="feature">{t?.modals?.feedbackFeature||'Feature Request'}</option>
                <option value="improvement">{t?.modals?.feedbackImprovement||'Improvement Suggestion'}</option>
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:'.82rem',fontWeight:600,marginBottom:4}}>{t?.modals?.feedbackMessage||'Message'}</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder={t?.modals?.feedbackPlaceholder||"Tell us what's on your mind..."} rows={5} className="admin-input" style={{width:'100%',padding:'10px 12px',borderRadius:8,fontSize:'.88rem',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit'}}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={onClose} className="btn-subtle" style={{flex:1,padding:'10px',borderRadius:8,fontSize:'.88rem'}}>{t?.modals?.feedbackCancel||'Cancel'}</button>
              <button onClick={submit} disabled={!message.trim()||sending} style={{flex:1,padding:'10px',background:message.trim()?'#4f8ef7':'#ccc',color:'white',border:'none',borderRadius:8,cursor:message.trim()?'pointer':'not-allowed',fontWeight:600,fontSize:'.88rem'}}>{sending?(t?.modals?.feedbackSending||'Sending…'):(t?.modals?.feedbackSubmit||'Submit')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// VIDEO ROOM VIEW
// ─────────────────────────────────────────────────────────────────
function VideoRoomView({user,session,callStartedAt,onEnd,t}){
  const customDur=(session.custom_duration||0)*60;
  const total=customDur>0?customDur:(session.english_level==='beginner'?300:600);
  const[timeLeft,setTimeLeft]=useState(total);
  const[connStatus,setConnStatus]=useState('new');
  const[showRating,setShowRating]=useState(false);
  const[showDisc,setShowDisc]=useState(false);
  const[showReport,setShowReport]=useState(false);
  const[endReason,setEndReason]=useState(null);
  const[partnerEndedScreen,setPartnerEndedScreen]=useState(false);
  const[partnerReconnecting,setPartnerReconnecting]=useState(false);
  const[err,setErr]=useState('');
  const[isFullscreen,setIsFullscreen]=useState(false);
  const toast=useToast();
  const lv=useRef(null),rv=useRef(null),pc=useRef(null),ws=useRef(null);
  const remStream=useRef(null),lcQ=useRef([]),rcQ=useRef([]),negRef=useRef(false),streamRef=useRef(null);
  const discTimer=useRef(null),autoTimer=useRef(null);
  const hasConnected=useRef(false);
  const partnerReconnectTimer=useRef(null);
  const connTimeout=useRef(null);
  const intentionalHangup=useRef(false);
  const partnerHungUp=useRef(false);
  const usedRelay=useRef(false);

  const toggleFullscreen=async()=>{
    try{
      if(!document.fullscreenElement){await document.documentElement.requestFullscreen();setIsFullscreen(true);}
      else{await document.exitFullscreen();setIsFullscreen(false);}
    }catch{}
  };
  useEffect(()=>{const h=()=>setIsFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',h);return()=>document.removeEventListener('fullscreenchange',h);},[]);

  const cleanup=()=>{
    if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}
    if(lv.current)lv.current.srcObject=null;
    if(rv.current)rv.current.srcObject=null;
    if(pc.current){pc.current.close();pc.current=null;}
    if(ws.current){ws.current.close();ws.current=null;}
  };

  useEffect(()=>{
    const init=async()=>{
      try{const r=await fetch(`${API_URL}/api/ice-servers`);const d=await r.json();start(d.iceServers||[{urls:'stun:stun.l.google.com:19302'}]);}
      catch{start([{urls:'stun:stun.l.google.com:19302'}]);}
    };
    const start=async(ice)=>{
      try{
        const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        streamRef.current=stream;if(lv.current)lv.current.srcObject=stream;
        remStream.current=new MediaStream();if(rv.current)rv.current.srcObject=remStream.current;
        const p=new RTCPeerConnection({iceServers:ice});
        stream.getTracks().forEach(t=>p.addTrack(t,stream));
        p.ontrack=ev=>{const s=ev.streams?.[0]||remStream.current;if(!ev.streams?.[0])remStream.current.addTrack(ev.track);if(rv.current){rv.current.srcObject=s;rv.current.play().catch(()=>{});}};
        p.onicecandidate=ev=>{if(ev.candidate){const pl=JSON.stringify({type:'candidate',candidate:ev.candidate});ws.current?.readyState===1?ws.current.send(pl):lcQ.current.push(pl);logConn('ice_candidate_sent',{candidate:ev.candidate});}};
        p.onconnectionstatechange=()=>{
          const s=p.connectionState;setConnStatus(s);
          logConn('ice_connection_state_change',{state:s});
          if(s==='connected'){hasConnected.current=true;playSound('start');clearTimeout(discTimer.current);clearTimeout(autoTimer.current);clearTimeout(connTimeout.current);setShowDisc(false);logConn('connected',{time_to_connect_ms:Date.now()-t0});
            // Detect TURN relay usage
            p.getStats().then(stats=>{stats.forEach(r=>{if(r.type==='candidate-pair'&&r.state==='succeeded'&&r.localCandidateId){const lc=stats.get(r.localCandidateId);if(lc&&lc.relayProtocol)usedRelay.current=true;}});}).catch(()=>{});
          }
          if((s==='failed')&&!hasConnected.current){
            logConn('failed',{never_connected:true});
            authFetch(`${API_URL}/api/matching/refund-fp`,{method:'POST',body:JSON.stringify({session_id:session.id})}).catch(()=>toast.error('Refund failed — contact support'));
          }
          if((s==='disconnected'||s==='failed') && !intentionalHangup.current && !partnerHungUp.current){
            discTimer.current=setTimeout(()=>setShowDisc(true),3000);
            autoTimer.current=setTimeout(async()=>{
              // Check server-side if partner already ended the call
              try{
        const sr=await authFetch(`${API_URL}/api/matching/session/${user.id}`);
                const sd=await sr.json();
                if(!sd.active_session){partnerHungUp.current=true;clearTimeout(discTimer.current);setPartnerEndedScreen(true);setTimeout(()=>{cleanup();playSound('end');setEndReason('partner');setShowRating(true);},1500);return;}
              }catch{}
              setEndReason('network');setShowDisc(false);
              await authFetch(`${API_URL}/api/matching/end`,{method:'POST',body:JSON.stringify({session_id:session.id,reason:'network_disconnect',used_relay:usedRelay.current})}).catch(()=>{});
              cleanup();playSound('end');setShowRating(true);
            },15000);
          }
        };
        pc.current=p;
        const sock=new WebSocket(`${WS_URL}/api/signal?sessionId=${session.id}`);
        ws.current=sock;
        sock.onopen=()=>{setConnStatus('checking');while(lcQ.current.length>0)sock.send(lcQ.current.shift());sock.send(JSON.stringify({type:'join'}));if(hasConnected.current)sock.send(JSON.stringify({type:'reconnected'}));};
        // Connection timeout: if not connected within 30s, refund FP and end session
        connTimeout.current=setTimeout(()=>{
          if(!hasConnected.current){
            authFetch(`${API_URL}/api/matching/refund-fp`,{method:'POST',body:JSON.stringify({session_id:session.id})}).catch(()=>toast.error('Refund failed — contact support'));
            cleanup();playSound('end');setShowRating(true);
          }
        },30000);
        sock.onmessage=async(msg)=>{
          const data=JSON.parse(msg.data);
          if(data.type==='bye'){
            if(data.reason==='hangup'){
              // Partner intentionally ended the call
              partnerHungUp.current=true;
              clearTimeout(discTimer.current);
              clearTimeout(autoTimer.current);
              setPartnerEndedScreen(true);
              setTimeout(()=>{cleanup();playSound('end');setEndReason('partner');setShowRating(true);},1500);
            } else if(hasConnected.current){
              // Partner disconnected unexpectedly — show reconnect notice, auto-proceed after 15s
              setPartnerReconnecting(true);
              partnerReconnectTimer.current=setTimeout(()=>{
                cleanup();playSound('end');setPartnerReconnecting(false);setEndReason('partner');setShowRating(true);
              },15000);
            } else {
              // Never connected — just end
              clearTimeout(connTimeout.current);
              authFetch(`${API_URL}/api/matching/refund-fp`,{method:'POST',body:JSON.stringify({session_id:session.id})}).catch(()=>toast.error('Refund failed — contact support'));
              cleanup();playSound('end');setEndReason('partner');setShowRating(true);
            }
          }
          else if(data.type==='reconnected'){clearTimeout(partnerReconnectTimer.current);setPartnerReconnecting(false);}
          else if(data.type==='join'){sock.send(JSON.stringify({type:'join_ack'}));if(user.id===session.user1_id&&!negRef.current)neg();}
          else if(data.type==='join_ack'){if(user.id===session.user1_id&&!negRef.current)neg();}
          else if(data.type==='offer'){negRef.current=true;await p.setRemoteDescription(new RTCSessionDescription(data.sdp));flushRC();const a=await p.createAnswer();await p.setLocalDescription(a);sock.send(JSON.stringify({type:'answer',sdp:a}));logConn('answer_created');}
          else if(data.type==='answer'){await p.setRemoteDescription(new RTCSessionDescription(data.sdp));flushRC();logConn('answer_received');}
          else if(data.type==='candidate'){const c=new RTCIceCandidate(data.candidate);p.remoteDescription?.type?await p.addIceCandidate(c):rcQ.current.push(c);logConn('ice_candidate_received',{candidate:data.candidate});}
        };
        const neg=async()=>{negRef.current=true;const o=await p.createOffer();await p.setLocalDescription(o);sock.send(JSON.stringify({type:'offer',sdp:o}));logConn('offer_created');};
      }catch(err){
        console.error('Camera error:',err);
        setErr(err.name==='NotAllowedError'?'Camera permission denied. Please allow camera access in your browser settings and try again.'
          :err.name==='NotFoundError'?'No camera found. Please connect a camera and try again.'
          :err.name==='NotReadableError'?'Camera is in use by another app. Close other apps using the camera and try again.'
          :'Could not access camera/microphone. Please check your device settings.');
      }
    };
    const logConn=(event_type,event_data)=>{
      authFetch(`${API_URL}/api/connection/event`,{method:'POST',body:JSON.stringify({session_id:session.id,event_type,event_data,user_agent:navigator.userAgent})}).catch(()=>{});
    };
    const flushRC=async()=>{if(!pc.current)return;while(rcQ.current.length>0)try{await pc.current.addIceCandidate(rcQ.current.shift());}catch{}};
    const beforeUnload=()=>{ws.current?.readyState===1&&ws.current.send(JSON.stringify({type:'bye'}));navigator.sendBeacon(`${API_URL}/api/matching/end`,JSON.stringify({session_id:session.id}));};
    window.addEventListener('beforeunload',beforeUnload);
    // Use server session.created_at for timer sync — both users see identical countdown
    // SQLite returns "2024-01-15 12:34:56" (space), must convert to ISO format
    const rawDate=session.created_at||'';
    const isoDate=rawDate.includes('T')?rawDate:rawDate.replace(' ','T')+'Z';
    const sessionStart=new Date(isoDate).getTime();
    const t0=isNaN(sessionStart)?(callStartedAt||Date.now()):sessionStart;
    const tick=()=>{const el=Math.floor((Date.now()-t0)/1000);const rem=Math.max(0,total-el);setTimeLeft(rem);return rem;};
    tick();init();
    const timer=setInterval(()=>{if(tick()<=0)hangup();},1000);
    return()=>{cleanup();clearInterval(timer);clearTimeout(discTimer.current);clearTimeout(autoTimer.current);clearTimeout(partnerReconnectTimer.current);clearTimeout(connTimeout.current);window.removeEventListener('beforeunload',beforeUnload);};
  },[]);

  const hangup=async()=>{
    intentionalHangup.current=true;
    ws.current?.readyState===1&&ws.current.send(JSON.stringify({type:'bye',reason:'hangup'}));
    try{await authFetch(`${API_URL}/api/matching/end`,{method:'POST',body:JSON.stringify({session_id:session.id,reason:'hangup',used_relay:usedRelay.current})});}catch{}
    playSound('end');cleanup();setShowRating(true);
  };

  const[showShareCard,setShowShareCard]=useState(false);
  const[shareData,setShareData]=useState({});

  const rate=async(rating)=>{
    let rpResult={};
    try{
      const r=await authFetch(`${API_URL}/api/matching/rate`,{method:'POST',body:JSON.stringify({session_id:session.id,rating,used_relay:usedRelay.current})});
      const d=await r.json();
      if(d.rp_awarded){playSound('points');rpResult={rp:d.rp_awarded,streak:d.streak};}
    }catch{}
    setShareData({partner:session.partner?.username,duration:Math.floor((Date.now()-callStartedAt)/1000),rp:rpResult.rp||0,streak:rpResult.streak||user.streak_count||0,rating});
    setShowShareCard(true);
  };

  const fmt=s=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const tc=timeLeft>60?'normal':timeLeft>30?'warning':'critical';
  const SM={new:{l:t.video.initializing,c:'new'},checking:{l:t.video.connecting,c:'checking'},connecting:{l:t.video.connecting,c:'connecting'},connected:{l:t.video.connected,c:'connected'},disconnected:{l:t.video.reconnecting,c:'disconnected'},failed:{l:t.video.connectionFailed,c:'failed'},closed:{l:t.video.ended,c:'closed'}};
  const si=SM[connStatus]||SM.new;

  if(err)return(
    <div className="matching-screen">
      <p style={{color:'red',fontWeight:600}}>{err}</p>
       <div className="warning-box">
        <strong>{t.video.iphoneWarning}</strong> {t.video.safariWarning}
      </div>
      <button onClick={()=>window.location.reload()} style={{marginTop:12,padding:'8px 20px',borderRadius:8,border:'none',background:'#4f46e5',color:'white',cursor:'pointer',fontSize:'.9rem'}}>
        {t.video?.retry||'Try Again'}
      </button>
      <button onClick={onEnd} className="cancel-btn">{t.video.goBack}</button>
    </div>
  );

  return(
    <div className="video-call-interface">
      <div className="video-compact-header">
        <img src="/chatter3_logo.png" alt="Chatter3"/>
        <span className="video-compact-pts">🎫 {user.fp_balance??0} FP &nbsp;·&nbsp; ⭐ {(user.rp_balance||0).toFixed(1)} RP</span>
      </div>
        {showReport&&<ReportModal targetUser={session.partner} sessionId={session.id} onClose={()=>setShowReport(false)} t={t}/>}
      <div className="video-container">
        <video ref={rv} autoPlay playsInline className="video-el"/>
        <video ref={lv} autoPlay playsInline muted className="video-el local"/>
        <div className="timer-overlay">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tc==='normal'?'white':tc==='warning'?'#fbbf24':'#f87171'} strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className={`timer-display ${tc}`}>{fmt(timeLeft)}</span>
        </div>
        <div className={`status-badge ${si.c}`}><span className="s-dot"/>{si.l}</div>
        {partnerReconnecting&&(
          <div className="ended-overlay">
            <div className="spinner"/>
            <h3>{t.video.partnerDisconnected}</h3>
            <p>{t.video.waitingReconnect}</p>
            <button className="disc-end-btn" onClick={()=>{clearTimeout(partnerReconnectTimer.current);cleanup();playSound('end');setEndReason('partner');setPartnerReconnecting(false);setShowRating(true);}}>{t.video.endCallNow}</button>
          </div>
        )}
        {partnerEndedScreen&&!partnerReconnecting&&<div className="ended-overlay"><div style={{fontSize:'2.25rem',marginBottom:'.65rem'}}>📵</div><h3>{t.video.partnerEnded}</h3><p>{t.video.takingToRating}</p></div>}
        {showDisc&&!showRating&&!partnerEndedScreen&&!partnerReconnecting&&(
          <div className="disconnect-overlay">
            <div className="spinner"/>
            <h3>{t.video.connectionLost}</h3>
            <p>{t.video.tryingReconnect}</p>
            <button className="disc-end-btn" onClick={hangup}>{t.video.endCallNow}</button>
          </div>
        )}
        {showRating&&(
          <div className="rating-overlay">
            {endReason==='network'&&<div className="context-note warning">{t.video.networkIssue}</div>}
            {endReason==='partner'&&<div className="context-note muted">{t.video.partnerEndedCall}</div>}
            <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.3rem',fontWeight:800,margin:'0 0 .4rem'}}>{t.video.ratePartner}</h2>
            <p style={{color:'rgba(255,255,255,.6)',margin:0,fontSize:'.88rem'}}>{t.video.howWasConversation.replace('{username}',session.partner?.username)}</p>
            <p style={{color:'rgba(255,255,255,.38)',fontSize:'.78rem',margin:'.5rem 0 0'}}>{t.video.ratingInstruction}</p>
            
            {/* Quick vocabulary save */}
            <div style={{margin:'.75rem 0',padding:'12px',background:'rgba(255,255,255,.08)',borderRadius:10,border:'1px solid rgba(255,255,255,.1)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px'}}>
                <span style={{fontSize:'.9rem'}}>📚</span>
                <p style={{color:'rgba(255,255,255,.8)',fontSize:'.8rem',margin:0,fontWeight:600}}>Learn any new words?</p>
              </div>
              <p style={{color:'rgba(255,255,255,.5)',fontSize:'.72rem',margin:'0 0 8px'}}>Save words to review later with spaced repetition</p>
              <div style={{display:'flex',gap:'8px'}}>
                <input id="vocab-input" placeholder="e.g., 'procrastinate'" onKeyDown={e=>{if(e.key==='Enter'){const input=document.getElementById('vocab-input');if(input&&input.value.trim())document.querySelector('.vocab-save-btn')?.click();}}} style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.1)',color:'white',fontSize:'.9rem',transition:'border-color .15s'}} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.3)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.15)'}/>
                <button className="vocab-save-btn" onClick={()=>{
                  const input=document.getElementById('vocab-input');
                  if(input&&input.value.trim()){
                    const word=input.value.trim();
                    input.value='';
                    input.placeholder='Saved! ✓';
                    setTimeout(()=>{input.placeholder="e.g., 'procrastinate'";},2000);
                    fetch(`${API_URL}/api/vocabulary/log`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('chatter3_token')}`},body:JSON.stringify({word,context:`Session with ${session.partner?.username||'partner'}`,session_id:session.id})}).catch(()=>toast.error('Failed to save word'));
                  }
                }} style={{padding:'10px 16px',background:'#22c55e',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontSize:'.85rem',fontWeight:600,transition:'background .15s',whiteSpace:'nowrap'}} onMouseEnter={e=>e.target.style.background='#16a34a'} onMouseLeave={e=>e.target.style.background='#22c55e'}>Save</button>
              </div>
            </div>

            <div className="rating-buttons">
              <button className="rating-btn good" onClick={()=>rate('good')}>{t.video.good}</button>
              <button className="rating-btn meh" onClick={()=>rate('meh')}>{t.video.meh}</button>
              {endReason==='network'&&(
                <button className="rating-btn warn" onClick={()=>rate('connection_issue')}>{t.video.connectionIssue}</button>
              )}
            </div>
          </div>
        )}
        {showShareCard&&(
          <div className="rating-overlay" style={{background:'rgba(0,0,0,.85)'}}>
            <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:16,padding:'1.5rem',maxWidth:320,width:'100%',textAlign:'center',boxShadow:'0 20px 40px rgba(0,0,0,.3)'}}>
              <div style={{fontSize:'2rem',marginBottom:'.5rem'}}>🎉</div>
              <h3 style={{color:'white',margin:'0 0 .25rem',fontFamily:'Sora,sans-serif',fontSize:'1.1rem'}}>{t.video.callComplete}</h3>
              <p style={{color:'rgba(255,255,255,.7)',margin:'0 0 1rem',fontSize:'.85rem'}}>{t.video.withPartner.replace('{partner}',shareData.partner)}</p>
              <div style={{display:'flex',justifyContent:'center',gap:'1.5rem',marginBottom:'1rem'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{color:'white',fontSize:'1.5rem',fontWeight:800}}>{Math.floor(shareData.duration/60)}:{(shareData.duration%60).toString().padStart(2,'0')}</div>
                  <div style={{color:'rgba(255,255,255,.6)',fontSize:'.7rem'}}>{t.video.minutes}</div>
                </div>
                {shareData.rp>0&&<div style={{textAlign:'center'}}>
                  <div style={{color:'#fbbf24',fontSize:'1.5rem',fontWeight:800}}>+{shareData.rp}</div>
                  <div style={{color:'rgba(255,255,255,.6)',fontSize:'.7rem'}}>{t.video.rpEarned}</div>
                </div>}
                {shareData.streak>1&&<div style={{textAlign:'center'}}>
                  <div style={{color:'#f97316',fontSize:'1.5rem',fontWeight:800}}>🔥{shareData.streak}</div>
                  <div style={{color:'rgba(255,255,255,.6)',fontSize:'.7rem'}}>{t.video.streakStat}</div>
                </div>}
              </div>
              <p style={{color:'rgba(255,255,255,.5)',fontSize:'.75rem',margin:'0 0 .75rem'}}>{t.video.shareText}</p>
              <div style={{display:'flex',gap:'.5rem',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>{const streakTxt=shareData.streak>1?(t.video.shareMessageStreak||' 🔥{streak} day streak!').replace('{streak}',shareData.streak):'';const msg=(t.video.shareMessage||'🎉 I just practiced English for {duration} min on Chatter3!{streak} Join me: https://app.chatter3.com').replace('{duration}',Math.floor(shareData.duration/60)).replace('{streak}',streakTxt);navigator.share?navigator.share({title:'Chatter3',text:msg,url:'https://app.chatter3.com'}):navigator.clipboard.writeText(msg).then(()=>toast.success(t.video.copied));}} aria-label={t.video.share} style={{background:'white',color:'#6366f1',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:'.8rem',cursor:'pointer'}}>{t.video.share}</button>
                <button onClick={()=>{const streakTxt=shareData.streak>1?(t.video.shareMessageStreak||' 🔥{streak} day streak!').replace('{streak}',shareData.streak):'';const msg=(t.video.shareMessage||'🎉 I just practiced English for {duration} min on Chatter3!{streak} Join me: https://app.chatter3.com').replace('{duration}',Math.floor(shareData.duration/60)).replace('{streak}',streakTxt);navigator.clipboard.writeText(msg).then(()=>toast.success(t.video.copied));}} aria-label={t.video.copy} style={{background:'rgba(255,255,255,.15)',color:'white',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,padding:'8px 16px',fontWeight:600,fontSize:'.8rem',cursor:'pointer'}}>{t.video.copy}</button>
              </div>
              <button onClick={()=>{setShowShareCard(false);onEnd();}} style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',marginTop:'.75rem',cursor:'pointer',fontSize:'.8rem'}}>{t.video.skip}</button>
            </div>
          </div>
        )}
      </div>
      {!showRating&&(
        <div className="call-controls" style={{paddingBottom:'env(safe-area-inset-bottom, 0px)'}}>
          <div>
            <p style={{fontSize:'.82rem',color:'#999',margin:0}}>{t.video.talkingTo}</p>
            <p style={{fontWeight:700,fontSize:'1rem',margin:0}}>{session.partner?.username}</p>
            {session.partner?.country&&<p style={{fontSize:'.78rem',color:'#6b7280',margin:'1px 0 0'}}>{getFlag(session.partner.country)} {countryName(session.partner.country)}</p>}
            <button className="report-btn" onClick={()=>setShowReport(true)}>{t.video.report}</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={toggleFullscreen} style={{background:'rgba(0,0,0,.5)',border:'none',color:'white',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:'.8rem'}} aria-label={isFullscreen?'Exit fullscreen':'Fullscreen'}>
              {isFullscreen?'✕':'⛶'} {isFullscreen?'Exit':'Fullscreen'}
            </button>
            <button onClick={hangup} className="control-btn-end"><PhoneOff style={{width:17,height:17}}/> {t.video.endCall}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PROFILE VIEW
// ─────────────────────────────────────────────────────────────────
function ProfileView({user,onBack,onUpdate,onShowOnboarding,t}){
  const[form,setForm]=useState({username:user.username||'',nickname:user.nickname||'',country:user.country||'',native_language:user.native_language||'',english_level:user.english_level||'beginner',bio:user.bio||'',avatar_url:user.avatar_url||'',learning_focus:user.learning_focus||'general',daily_goal_minutes:user.daily_goal_minutes||0});
  const[history,setHistory]=useState([]);
  const[showFeedback,setShowFeedback]=useState(false);
  const[showPwChange,setShowPwChange]=useState(false);
  const[pwForm,setPwForm]=useState({current_password:'',new_password:'',confirm_password:''});
  const[pwErr,setPwErr]=useState('');
  const[pwMsg,setPwMsg]=useState('');
  const[showDeleteConfirm,setShowDeleteConfirm]=useState(false);
  const fileRef=useRef(null);
  useEffect(()=>{
    authFetch(`${API_URL}/api/user/history`,{method:'POST',body:JSON.stringify({})}).then(r=>r.json()).then(d=>{if(d.success)setHistory(d.history);});
  },[]);
  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const onFile=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();const rd=new FileReader();rd.onload=ev=>{img.onload=()=>{const M=800;let{width:w,height:h}=img;if(w>M||h>M){const r=Math.min(M/w,M/h);w=Math.round(w*r);h=Math.round(h*r);}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);setForm(p=>({...p,avatar_url:c.toDataURL('image/jpeg',.75)}));};img.src=ev.target.result;};rd.readAsDataURL(f);};
  const save=async()=>{const r=await authFetch(`${API_URL}/api/user/update`,{method:'POST',body:JSON.stringify({...form})});const d=await r.json();if(d.success){const u={...user,...d.user};localStorage.setItem('chatter3_user',JSON.stringify(u));onUpdate(u);toast.success(t.profile.profileSaved);}};
  const changePassword=async()=>{
    setPwErr('');setPwMsg('');
    if(!pwForm.new_password){setPwErr(t.profile.passwordRequired);return;}
    if(pwForm.new_password.length<6){setPwErr(t.profile.passwordTooShort);return;}
    if(pwForm.new_password!==pwForm.confirm_password){setPwErr(t.profile.passwordsMismatch);return;}
    try{
      const r=await authFetch(`${API_URL}/api/auth/change-password`,{method:'POST',body:JSON.stringify({current_password:pwForm.current_password,new_password:pwForm.new_password})});
      const d=await r.json();
      if(d.success){setPwMsg(t.profile.passwordUpdated);setPwForm({current_password:'',new_password:'',confirm_password:''});setTimeout(()=>setShowPwChange(false),1500);}else{setPwErr(d.error||t.profile.passwordFailed);}
    }catch{setPwErr(t.profile.networkError);}
  };
  return(
    <div className="dashboard-container">
      <div style={{textAlign:'center',marginBottom:'1.25rem'}}><h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.3rem',fontWeight:800,margin:0}}>{t.profile.editProfile}</h2>{user.founding_member?<span style={{display:'inline-block',marginTop:6,padding:'3px 10px',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',borderRadius:10,fontSize:'.72rem',fontWeight:700,letterSpacing:'.03em'}}>{t.profile.foundingMember}</span>:null}{user.is_new_member&&!user.founding_member?<span style={{display:'inline-block',marginTop:6,marginLeft:6,padding:'3px 10px',background:'linear-gradient(135deg,#22c55e,#10b981)',color:'white',borderRadius:10,fontSize:'.72rem',fontWeight:700,letterSpacing:'.03em'}}>{t.profile.newMember}</span>:null}</div>
      <div className="profile-section">
        <div className="profile-avatar">
          {form.avatar_url?<Avatar src={form.avatar_url} name={form.nickname||user.username} size={100} style={{width:'100%',height:'100%'}}/>:(form.username||user.username).charAt(0).toUpperCase()}
        </div>
        <div style={{textAlign:'center',marginBottom:'1.1rem'}}>
          <input type="file" accept="image/*" onChange={onFile} style={{display:'none'}} ref={fileRef}/>
          <button className="upload-btn" onClick={()=>fileRef.current.click()}><UploadIcon style={{width:13,height:13,marginRight:4}}/> {t.profile.uploadPicture}</button>
          <p style={{fontSize:'.72rem',color:'#9ca3af',margin:'3px 0 0'}}>{t.profile.autoCompress}</p>
        </div>
        <div className="form-group"><label>{t.profile.username}</label><input value={form.username} onChange={upd('username')}/></div>
        <div className="form-group"><label>{t.profile.displayName}</label><input value={form.nickname} onChange={upd('nickname')} placeholder={t.profile.displayNamePlaceholder}/></div>
        <div className="form-group"><label>{t.profile.country}</label><CountrySelect value={form.country} onChange={v=>setForm(f=>({...f,country:v}))}/></div>
        <div className="form-group"><label>{t.profile.nativeLanguage}</label><input value={form.native_language} onChange={upd('native_language')} placeholder={t.profile.nativeLanguagePlaceholder}/></div>
        <div className="form-group"><label>{t.profile.level}</label>
          <select value={form.english_level} onChange={upd('english_level')}>
            <option value="beginner">{t.profile.beginner}</option><option value="intermediate">{t.profile.intermediate}</option><option value="advanced">{t.profile.advanced}</option>
          </select>
        </div>
        <div className="form-group"><label>{t?.dashboard?.learningFocus||'Learning Focus'}</label>
          <select value={form.learning_focus||user.learning_focus||'general'} onChange={e=>setForm(f=>({...f,learning_focus:e.target.value}))}>
            <option value="general">{t?.dashboard?.generalEnglish||'General English'}</option>
            <option value="business">{t?.dashboard?.businessEnglish||'Business English'}</option>
            <option value="travel">{t?.dashboard?.travelEnglish||'Travel English'}</option>
            <option value="academic">{t?.dashboard?.academicEnglish||'Academic English'}</option>
            <option value="conversation">{t?.dashboard?.conversationPractice||'Conversation Practice'}</option>
            <option value="pronunciation">{t?.dashboard?.pronunciationFocus||'Pronunciation Focus'}</option>
          </select>
          <p style={{fontSize:'.75rem',color:'#64748b',margin:'4px 0 0'}}>{t?.profile?.learningFocusHelp||'Helps us suggest better conversation partners'}</p>
        </div>
        <div className="form-group"><label>{t?.dashboard?.dailyGoal||'Daily Goal'} (minutes)</label>
          <input type="number" value={form.daily_goal_minutes||user.daily_goal_minutes||0} onChange={e=>setForm(f=>({...f,daily_goal_minutes:parseInt(e.target.value)||0}))} min={0} max={120} placeholder={t?.profile?.dailyGoalPlaceholder||'0 = no goal'}/>
          <p style={{fontSize:'.75rem',color:'#64748b',margin:'4px 0 0'}}>{t?.profile?.dailyGoalHelp||'Set to 15+ minutes for streak tracking'}</p>
        </div>
        <button className="save-btn" onClick={save}>{t.profile.saveProfile}</button>
        {user.auth_provider!=='google'&&<>
        <button onClick={()=>{setShowPwChange(!showPwChange);setPwErr('');setPwMsg('');}} className="btn-accent-outline">&#x1f512; {user.has_password?t.profile.changePassword:t.profile.setPassword}</button>
        {showPwChange&&(
           <div className="pw-box">
            <div style={{fontWeight:600,fontSize:'.85rem',marginBottom:8}}>{user.has_password?t.profile.changePasswordTitle:t.profile.setPasswordTitle}</div>
            {pwErr&&<div style={{color:'#ef4444',fontSize:'.8rem',marginBottom:6}}>{pwErr}</div>}
            {pwMsg&&<div style={{color:'#22c55e',fontSize:'.8rem',marginBottom:6}}>{pwMsg}</div>}
            {user.has_password&&<div className="form-group"><label htmlFor="pw-current">{t.profile.currentPassword}</label><input id="pw-current" type="password" value={pwForm.current_password} onChange={e=>setPwForm(f=>({...f,current_password:e.target.value}))}/></div>}
            <div className="form-group"><label htmlFor="pw-new">{t.profile.newPassword}</label><input id="pw-new" type="password" value={pwForm.new_password} onChange={e=>setPwForm(f=>({...f,new_password:e.target.value}))} minLength={6}/></div>
            <div className="form-group"><label htmlFor="pw-confirm">{t.profile.confirmPassword}</label><input id="pw-confirm" type="password" value={pwForm.confirm_password} onChange={e=>setPwForm(f=>({...f,confirm_password:e.target.value}))} minLength={6}/></div>
            <button className="save-btn" onClick={changePassword} style={{width:'100%'}}>{user.has_password?t.profile.updatePassword:t.profile.setPasswordBtn}</button>
          </div>
        )}
        </>}
        <div style={{borderTop:'1px solid #e5e7eb',marginTop:'1rem',paddingTop:'1rem'}}>
  <h4 style={{fontSize:'.85rem',fontWeight:700,color:'#374151',margin:'0 0 .75rem'}}>Your Data</h4>
  <button onClick={async()=>{
    try{const r=await authFetch(`${API_URL}/api/user/data-export`);const d=await r.json();if(d.success){const blob=new Blob([JSON.stringify(d.exports,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='chatter3-data-export.json';a.click();URL.revokeObjectURL(url);toast.success('Data exported successfully!');}else{toast.error('Export failed');}}catch{toast.error('Export failed');}
  }} className="btn-accent-outline" style={{width:'100%',marginBottom:8}}>📥 Export My Data</button>
  <button onClick={()=>setShowDeleteConfirm(true)} className="btn-accent-outline" style={{width:'100%',color:'#ef4444',borderColor:'#ef4444'}}>🗑️ Delete My Account</button>
</div>
        <button onClick={()=>setShowFeedback(true)} className="btn-accent-outline">{t.profile.sendFeedback}</button>
        <button onClick={onShowOnboarding} className="btn-accent-outline">{t.profile.viewIntro}</button>
        <button onClick={onBack} className="btn-subtle">{t.profile.back}</button>
      </div>
      <div style={{background:'#f0f4ff',border:'1px solid #c7d7fc',borderRadius:12,padding:'1.25rem',marginBottom:'1.25rem'}}>
        <h3 style={{fontFamily:'Sora,sans-serif',fontSize:'.95rem',margin:'0 0 .75rem',color:'#1e293b'}}>{t.profile.learnMore}</h3>
        <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
          <a href="/how-it-works" target="_blank" style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.6rem .75rem',background:'white',borderRadius:8,textDecoration:'none',color:'#374151',fontSize:'.88rem',border:'1px solid #e5e7eb',transition:'border-color .15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#4f46e5'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
            <span>📖</span><span>{t.profile.howItWorks}</span><span style={{marginLeft:'auto',color:'#9ca3af',fontSize:'.8rem'}}>→</span>
          </a>
          <a href="/for-beginners" target="_blank" style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.6rem .75rem',background:'white',borderRadius:8,textDecoration:'none',color:'#374151',fontSize:'.88rem',border:'1px solid #e5e7eb',transition:'border-color .15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#4f46e5'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
            <span>🌱</span><span>{t.profile.forBeginners}</span><span style={{marginLeft:'auto',color:'#9ca3af',fontSize:'.8rem'}}>→</span>
          </a>
          <a href="/blog" target="_blank" style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.6rem .75rem',background:'white',borderRadius:8,textDecoration:'none',color:'#374151',fontSize:'.88rem',border:'1px solid #e5e7eb',transition:'border-color .15s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#4f46e5'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
            <span>📝</span><span>{t.profile.blogTips}</span><span style={{marginLeft:'auto',color:'#9ca3af',fontSize:'.8rem'}}>→</span>
          </a>
        </div>
      </div>
      {showFeedback&&<FeedbackModal t={t} userId={user.id} onClose={()=>setShowFeedback(false)}/>}
      {showDeleteConfirm&&<ConfirmDialog title="Delete Account" message="This will permanently anonymize all your data. Your learning progress, achievements, and conversation history will be lost. This action cannot be undone." confirmLabel="Delete Everything" variant="danger" requireInput="DELETE" onConfirm={async()=>{try{const r=await authFetch(`${API_URL}/api/user/delete-account`,{method:'POST'});const d=await r.json();if(d.success){localStorage.clear();window.location.href='/';}else{toast.error(d.error||'Delete failed');}}catch{toast.error('Delete failed');}setShowDeleteConfirm(false);}} onCancel={()=>setShowDeleteConfirm(false)}/>}
      <div className="history-list">
        <h3 style={{fontFamily:'Sora,sans-serif',fontSize:'.95rem',margin:'0 0 .875rem'}}>{t.profile.recentConversations}</h3>
        {history.length===0&&<p style={{color:'#9ca3af',fontSize:'.88rem'}}>{t.profile.noCalls}</p>}
        {history.map(h=>(
          <div key={h.id} className="history-item">
            <div className="history-avatar">
              {h.partner_avatar?<Avatar src={h.partner_avatar} name={h.partner_name} size={40} style={{width:'100%',height:'100%'}}/>:(h.partner_name||'?').charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <strong style={{fontSize:'.9rem'}}>{h.partner_name||t.profile.unknown}</strong>
              <div style={{fontSize:'.76rem',color:'#9ca3af',marginTop:1}}>{new Date(h.created_at).toLocaleDateString()}</div>
              {h.points_earned!=null&&<span className="history-points">⭐ +{parseFloat(h.points_earned).toFixed(1)} RP</span>}
            </div>
            <div style={{textAlign:'right',fontSize:'.82rem',color:'#6b7280',flexShrink:0}}>
              {h.duration?Math.floor(h.duration/60)+'m '+(h.duration%60)+'s':t.profile.incomplete}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppWithProviders(){
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}
export default AppWithProviders;

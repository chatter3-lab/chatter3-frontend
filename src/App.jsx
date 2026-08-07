import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import SEOHead from './components/SEOHead';
import LanguageSwitcher from './components/LanguageSwitcher';
import { getTranslations, getLangFromPath, detectLanguage, getLocalizedPath, languages } from './i18n/detect';
import { useTranslation } from './i18n/useTranslation';

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
  return <div ref={ref} style={{margin:'12px 0'}}/>;
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
  match: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  start: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  end:   'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  points:'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  ring:  'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
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

// ── Country helpers ────────────────────────────────────────── 

// ── Conversation starters ────────────────────────────────────
const getStarters=(t)=>[
  (p)=>(t?.matching?.starter1||'Ask {partner} what the most popular food is in their country!').replace('{partner}',p),
  (p)=>(t?.matching?.starter2||'Ask {partner} what music or shows are trending where they live!').replace('{partner}',p),
  (p)=>(t?.matching?.starter3||'Ask {partner} what they enjoy doing on weekends!').replace('{partner}',p),
  (p)=>(t?.matching?.starter4||'Ask {partner} what made them want to practice English conversation!').replace('{partner}',p),
  (p)=>(t?.matching?.starter5||'Ask {partner} to describe something unique about their hometown!').replace('{partner}',p),
];

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const STYLES=`
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
*{box-sizing:border-box;}
body,html{margin:0;padding:0;width:100%;font-family:'DM Sans',-apple-system,sans-serif;background:#f5f5f5;overflow-x:hidden;}
#root{width:100%;margin:0;padding:0;}
.app-container{display:flex;flex-direction:column;min-height:100vh;width:100%;}
.app-content{flex:1;display:flex;flex-direction:column;width:100%;max-width:1200px;margin:0 auto;padding:0 1rem;}

/* Header */
.app-header{background:white;padding:.75rem 0;box-shadow:0 2px 10px rgba(0,0,0,.1);}
.app-header-content{display:flex;justify-content:space-between;align-items:center;width:100%;max-width:1200px;margin:0 auto;padding:0 1rem;}
.header-logo-img{height:60px;width:auto;object-fit:contain;}
.user-info{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;}
.user-info span{font-weight:500;font-size:.9rem;}
.header-pts{background:#f0f4ff;border:1px solid #c7d7fc;border-radius:20px;padding:4px 12px;font-size:.82rem;font-weight:700;color:#4f46e5;display:flex;align-items:center;gap:5px;}
.header-btn{padding:6px 14px;border:none;border-radius:6px;cursor:pointer;font-size:.85rem;font-family:'DM Sans',sans-serif;}
.btn-logout{background:#fee2e2;color:#b91c1c;}
.btn-admin{background:linear-gradient(135deg,#1e293b,#334155);color:white;}
.btn-friends{background:#f0f4ff;color:#4f46e5;border:1px solid #c7d7fc;}
.btn-help{background:#f0f4ff;color:#4f46e5;border:1px solid #c7d7fc;}
.help-menu-wrapper{position:relative;}
.help-dropdown{display:none;position:absolute;right:0;top:100%;background:white;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.1);min-width:160px;z-index:1000;margin-top:4px;}
.help-menu-wrapper:hover .help-dropdown{display:block;}
.help-dropdown a{display:block;padding:8px 14px;font-size:.85rem;color:#374151;text-decoration:none;transition:background .15s;}
.help-dropdown a:hover{background:#f3f4f6;}
.friend-item{display:flex;align-items:center;gap:9px;padding:10px;background:#f8fafc;border-radius:8px;margin-bottom:7px;border:1px solid #f1f5f9;}
.friend-avatar{width:38px;height:38px;border-radius:50%;background:#e0e7ff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#4f46e5;overflow:hidden;flex-shrink:0;}
.friend-info{flex:1;}.friend-name{font-weight:600;font-size:.88rem;color:#1a1a2e;}.friend-sub{font-size:.75rem;color:#94a3b8;margin-top:1px;}
.friend-action-btn{padding:5px 11px;border:1.5px solid #e5e7eb;border-radius:6px;background:white;font-size:.77rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
.friend-action-btn.accept{border-color:#bbf7d0;color:#15803d;}.friend-action-btn.decline{border-color:#fca5a5;color:#ef4444;}.friend-action-btn.remove{border-color:#e5e7eb;color:#9ca3af;}.friend-action-btn:hover{opacity:.8;}
.invite-share-row{display:flex;gap:.5rem;margin-top:.75rem;flex-wrap:wrap;}
.invite-share-btn{flex:1;min-width:58px;padding:9px 5px;border:1.5px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-size:.75rem;font-family:'DM Sans',sans-serif;transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:3px;}.invite-share-btn:hover{border-color:#4f8ef7;color:#4f46e5;}
.invite-url-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;padding:9px 12px;font-size:.78rem;color:#475569;word-break:break-all;margin:.75rem 0;font-family:monospace;}
.modal-tab-row{display:flex;gap:.5rem;margin-bottom:1rem;}
.modal-tab{flex:1;padding:8px;border:1.5px solid #e5e7eb;border-radius:7px;background:white;color:#6b7280;cursor:pointer;font-size:.83rem;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .15s;}
.modal-tab.active{background:#1e293b;color:white;border-color:#1e293b;}
.setting-row{display:flex;justify-content:space-between;align-items:center;padding:.65rem 0;border-bottom:1px solid #f1f5f9;}.setting-row:last-child{border-bottom:none;}
.setting-info{flex:1;}.setting-name{font-weight:600;font-size:.88rem;color:#1e293b;}.setting-desc{font-size:.75rem;color:#94a3b8;margin-top:2px;}
.toggle{position:relative;width:44px;height:24px;flex-shrink:0;}.toggle input{opacity:0;width:0;height:0;}
.toggle-slider{position:absolute;inset:0;background:#e5e7eb;border-radius:12px;cursor:pointer;transition:background .2s;}.toggle-slider::before{content:'';position:absolute;height:18px;width:18px;left:3px;top:3px;background:white;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.toggle input:checked+.toggle-slider{background:#4f8ef7;}.toggle input:checked+.toggle-slider::before{transform:translateX(20px);}
.duration-input{width:80px;padding:6px 9px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:.85rem;font-family:'DM Sans',sans-serif;text-align:center;}
.save-settings-btn{margin-top:1rem;padding:9px 20px;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;border:none;border-radius:7px;font-family:'Sora',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;}

/* Auth */
.auth-container{display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:1rem;}
.auth-footer{margin-top:1.5rem;text-align:center;color:rgba(255,255,255,.7);font-size:.82rem;}
.auth-footer-links{display:flex;gap:1rem;justify-content:center;margin-bottom:.5rem;flex-wrap:wrap;}
.auth-footer-links a{color:rgba(255,255,255,.85);text-decoration:none;font-weight:500;}
.auth-footer-links a:hover{text-decoration:underline;color:white;}
.auth-box{background:white;padding:2rem;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);text-align:center;width:100%;max-width:500px;}
.auth-header{display:flex;flex-direction:column;align-items:center;margin-bottom:1.5rem;}
.auth-logo{width:100%;max-width:320px;height:auto;object-fit:contain;margin-bottom:.75rem;}
.auth-subtitle{color:#666;margin-bottom:.5rem;font-size:1.05rem;}
.auth-divider{margin:1.25rem 0;color:#999;position:relative;}
.auth-divider::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:#eee;}
.google-button-container{display:flex;justify-content:center;margin:.75rem 0;width:100%;}
.auth-link{color:#4285f4;background:none;border:none;cursor:pointer;margin-top:1rem;display:block;width:100%;font-size:.9rem;}
.error-message{background:#ffebee;color:#c62828;padding:10px;border-radius:4px;margin-bottom:1rem;border-left:4px solid #c62828;text-align:left;font-size:.88rem;}
.register-form{text-align:left;}
.form-group{margin-bottom:.875rem;}
.form-group label{display:block;margin-bottom:.4rem;color:#333;font-weight:500;font-size:.9rem;}
.form-group input,.form-group select{width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:15px;box-sizing:border-box;}
.register-form button[type="submit"]{width:100%;padding:11px;background:#4285f4;color:white;border:none;border-radius:6px;font-size:15px;cursor:pointer;margin-top:.75rem;}
.terms-row{display:flex;align-items:flex-start;gap:10px;margin:.75rem 0 0;text-align:left;}
.terms-row input[type="checkbox"]{width:17px;height:17px;flex-shrink:0;margin-top:2px;accent-color:#4285f4;cursor:pointer;}
.terms-row label{font-size:.8rem;color:#6b7280;line-height:1.5;cursor:pointer;}
.terms-row a{color:#4285f4;text-decoration:underline;}

/* Dashboard */
.dashboard-container{padding:2rem 1rem;text-align:center;}
.welcome-message h2{color:#333;margin-bottom:.5rem;font-size:1.8rem;}
.welcome-message>p{color:#666;font-size:1.1rem;margin-bottom:1.5rem;}
.start-matching-btn{padding:13px 28px;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s;}
.start-matching-btn:hover{opacity:.9;transform:translateY(-1px);}
.start-matching-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.dashboard-online-pill{display:inline-flex;align-items:center;gap:7px;padding:5px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;font-size:.82rem;font-weight:600;color:#15803d;margin-bottom:1rem;}
.live-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 1.5s ease-in-out infinite;flex-shrink:0;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);}}

/* Stats card */
.stats-card{background:white;padding:1.25rem 1.5rem;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.08);margin:1.5rem auto;max-width:580px;text-align:left;}
.stats-card h3{margin:0 0 1rem;color:#1a1a2e;font-family:'Sora',sans-serif;font-size:1rem;}
.stat-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid #f3f4f6;}
.stat-row:last-child{border-bottom:none;}
.stat-label{color:#6b7280;font-size:.9rem;}
.stat-value{font-weight:700;font-size:.9rem;}

/* Leaderboard card */
.leaderboard-card{background:white;padding:1.25rem 1.5rem;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.08);margin:1.5rem auto;max-width:580px;text-align:left;}
.leaderboard-card h3{margin:0 0 .75rem;color:#1a1a2e;font-family:'Sora',sans-serif;font-size:1rem;}
.lb-tabs{display:flex;gap:4px;}
.lb-tab{padding:4px 10px;border-radius:8px;border:none;cursor:pointer;font-size:.75rem;font-weight:600;}
.lb-tab.active{background:#4f46e5;color:white;}
.lb-tab:not(.active){background:#f3f4f6;color:#6b7280;}
.lb-row{display:flex;align-items:center;padding:8px 10px;border-radius:8px;margin-bottom:2px;}
.lb-row.me{background:#eef2ff;font-weight:700;}
.lb-rank{width:28px;font-size:.9rem;color:#6b7280;}
.lb-name{flex:1;font-size:.88rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lb-sessions{font-size:.78rem;color:#6b7280;margin-right:8px;}
.lb-score{font-size:.78rem;font-weight:600;color:#4f46e5;}
.lb-streak{margin-left:6px;font-size:.75rem;}

/* Language switcher */
.lang-select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 8px center;border:1px solid rgba(0,0,0,.15);border-radius:6px;padding:4px 28px 4px 8px;cursor:pointer;font-size:.78rem;font-weight:600;letter-spacing:.04em;color:#374151;line-height:1;background-color:transparent;font-family:inherit;}
.lang-select:hover{border-color:rgba(0,0,0,.25);}
.lang-select:focus{outline:none;border-color:#4f46e5;box-shadow:0 0 0 2px rgba(79,70,229,.2);}

/* FP/RP balance display */
.balance-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin:.75rem 0 1rem;}
.balance-tile{border-radius:10px;padding:.875rem 1rem;text-align:center;}
.balance-tile.fp{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;}
.balance-tile.rp{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;}
.balance-num{font-family:'Sora',sans-serif;font-size:1.6rem;font-weight:800;}
.balance-num.fp{color:#1d4ed8;}
.balance-num.rp{color:#15803d;}
.balance-lbl{font-size:.72rem;color:#6b7280;margin-top:2px;}
.exchange-btn{width:100%;padding:9px;background:#f0f4ff;border:1px solid #c7d7fc;border-radius:8px;color:#4f46e5;font-weight:600;font-size:.85rem;cursor:pointer;margin-top:.25rem;font-family:'DM Sans',sans-serif;transition:all .15s;}
.exchange-btn:hover{background:#e0e7ff;}

/* Profile */
.profile-section{max-width:580px;margin:0 auto;background:white;padding:2rem;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.05);text-align:left;}
.profile-avatar{width:90px;height:90px;border-radius:50%;background:#e0e7ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:bold;overflow:hidden;margin:0 auto 1.25rem;}
.upload-btn{background:#eee;border:1px solid #ddd;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.85rem;}
.save-btn{background:#10b981;color:white;border:none;padding:11px;width:100%;border-radius:6px;font-size:.95rem;cursor:pointer;margin-top:.75rem;}
.history-list{margin-top:1.5rem;max-width:580px;margin-left:auto;margin-right:auto;}
.history-item{display:flex;align-items:center;gap:10px;padding:13px;background:white;margin-bottom:8px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.05);border:1px solid #eee;}
.history-avatar{width:38px;height:38px;border-radius:50%;background:#eee;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#555;overflow:hidden;}
.history-points{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;font-size:.75rem;font-weight:700;color:#15803d;margin-top:3px;}

/* Modals */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;z-index:8800;}
.modal-card{background:white;border-radius:18px;padding:2rem 1.75rem;width:100%;max-width:400px;animation:slideUp .3s cubic-bezier(.4,0,.2,1);}
@keyframes slideUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.modal-icon{font-size:2.5rem;margin-bottom:.75rem;text-align:center;}
.modal-card h2{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:800;color:#1a1a2e;margin:0 0 .4rem;text-align:center;}
.modal-card>p{color:#6b7280;font-size:.88rem;line-height:1.55;margin:0 0 1.25rem;text-align:center;}
.modal-btn-primary{width:100%;padding:11px;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;border:none;border-radius:9px;font-family:'Sora',sans-serif;font-size:.93rem;font-weight:700;cursor:pointer;margin-bottom:7px;transition:opacity .2s;}
.modal-btn-primary:hover{opacity:.9;}
.modal-btn-primary:disabled{opacity:.45;cursor:not-allowed;}
.modal-btn-ghost{width:100%;padding:9px;background:none;border:none;color:#9ca3af;cursor:pointer;font-size:.83rem;font-family:'DM Sans',sans-serif;}
.modal-input{width:100%;padding:10px 13px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:'DM Sans',sans-serif;margin-bottom:.6rem;box-sizing:border-box;outline:none;}
.modal-input:focus{border-color:#4f8ef7;}

/* Profile gate */
.profile-gate-overlay{position:fixed;inset:0;z-index:8888;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;}
.profile-gate-card{background:white;border-radius:20px;padding:2.25rem 1.75rem;width:100%;max-width:400px;box-shadow:0 20px 50px rgba(0,0,0,.3);text-align:center;animation:slideUp .35s cubic-bezier(.4,0,.2,1);}
.profile-gate-input{width:100%;padding:11px 14px;border:2px solid #e5e7eb;border-radius:9px;font-size:14px;font-family:'DM Sans',sans-serif;margin-bottom:.6rem;box-sizing:border-box;outline:none;}
.profile-gate-input:focus{border-color:#4f8ef7;}
.profile-gate-submit{width:100%;padding:12px;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;border:none;border-radius:9px;font-family:'Sora',sans-serif;font-size:.93rem;font-weight:700;cursor:pointer;margin-top:.4rem;transition:opacity .2s,transform .2s;}
.profile-gate-submit:hover{opacity:.9;transform:translateY(-1px);}
.profile-gate-submit:disabled{opacity:.55;cursor:not-allowed;transform:none;}

/* Onboarding */
.onboarding-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#0d0d1a;overflow:hidden;}
.ob-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(79,142,247,.15) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(124,58,237,.15) 0%,transparent 60%),radial-gradient(ellipse at 60% 80%,rgba(5,150,105,.1) 0%,transparent 60%);pointer-events:none;}
.ob-star{position:absolute;width:2px;height:2px;background:white;border-radius:50%;opacity:.3;animation:twinkle 3s infinite alternate;}
@keyframes twinkle{0%{opacity:.1;transform:scale(1);}100%{opacity:.6;transform:scale(1.5);}}
.ob-card{position:relative;width:100%;max-width:400px;margin:0 1.25rem;z-index:1;}
.ob-skip{position:fixed;top:1.25rem;right:1.25rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.7);padding:5px 14px;border-radius:20px;font-size:.82rem;cursor:pointer;z-index:10000;font-family:'DM Sans',sans-serif;}
.ob-logo{text-align:center;margin-bottom:2rem;}
.ob-logo img{height:52px;filter:brightness(0) invert(1);opacity:.9;}
.slides-wrapper{overflow:hidden;}
.slides-track{display:flex;transition:transform .5s cubic-bezier(.4,0,.2,1);}
.slide{flex:0 0 100%;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 .5rem;}
.slide-tag{font-family:'Sora',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;padding:3px 10px;border-radius:20px;margin-bottom:1.25rem;}
.slide-icon{width:88px;height:88px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:2.6rem;margin-bottom:1.5rem;}
.slide-headline{font-family:'Sora',sans-serif;font-size:1.5rem;font-weight:800;color:white;line-height:1.25;margin-bottom:.875rem;letter-spacing:-.02em;}
.slide-body{font-size:.93rem;color:rgba(255,255,255,.62);line-height:1.6;max-width:300px;}
.slide-note{margin-top:.875rem;font-size:.75rem;color:rgba(255,255,255,.3);font-style:italic;}
.ob-dots{display:flex;justify-content:center;gap:7px;margin:2rem 0 1.75rem;}
.ob-dot{height:5px;border-radius:3px;background:rgba(255,255,255,.22);transition:all .4s;cursor:pointer;border:none;padding:0;}
.ob-dot.active{background:white;}
.ob-cta{width:100%;padding:13px;border:none;border-radius:12px;font-family:'Sora',sans-serif;font-size:.93rem;font-weight:700;cursor:pointer;transition:all .22s;}
.ob-cta:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(0,0,0,.4);}

/* Matching */
.matching-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:2rem 1rem;text-align:center;}
.sonar-container{position:relative;width:130px;height:130px;display:flex;align-items:center;justify-content:center;margin-bottom:2rem;}
.sonar-ring{position:absolute;border-radius:50%;border:2px solid #4f8ef7;animation:sonar 2.4s ease-out infinite;opacity:0;}
.sonar-ring:nth-child(1){width:56px;height:56px;animation-delay:0s;}
.sonar-ring:nth-child(2){width:96px;height:96px;animation-delay:.8s;}
.sonar-ring:nth-child(3){width:130px;height:130px;animation-delay:1.6s;}
@keyframes sonar{0%{opacity:.8;transform:scale(.6);}100%{opacity:0;transform:scale(1);}}
.sonar-core{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#4f8ef7,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 0 0 4px rgba(79,142,247,.2),0 4px 18px rgba(79,142,247,.4);z-index:1;}
.match-status{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:700;color:#1a1a2e;margin-bottom:.4rem;}
.match-sub{color:#6b7280;font-size:.9rem;margin-bottom:1.25rem;}
.level-badge{display:inline-block;padding:4px 13px;background:#f0f4ff;border:1px solid #c7d7fc;border-radius:20px;font-size:.8rem;font-weight:600;color:#4f46e5;text-transform:capitalize;margin-bottom:1.25rem;}
.online-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;font-size:.8rem;font-weight:600;color:#15803d;margin-bottom:1.5rem;}
.online-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 1.5s ease-in-out infinite;}
.cancel-btn{padding:9px 26px;background:white;color:#6b7280;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
.cancel-btn:hover{border-color:#f44336;color:#f44336;background:#fff5f5;}
.progress-bar{width:190px;height:3px;background:#e5e7eb;border-radius:2px;margin:.875rem 0 .4rem;overflow:hidden;}
.progress-fill{height:100%;border-radius:2px;transition:width 1s linear,background .3s;}

/* Pre-call */
.precall-overlay{position:fixed;inset:0;z-index:7777;background:#0d0d1a;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto;}
.precall-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%,rgba(79,142,247,.12) 0%,transparent 55%),radial-gradient(ellipse at 70% 60%,rgba(124,58,237,.12) 0%,transparent 55%);pointer-events:none;}
.precall-card{position:relative;width:100%;max-width:390px;text-align:center;animation:precallIn .5s cubic-bezier(.34,1.56,.64,1);z-index:1;}
@keyframes precallIn{from{opacity:0;transform:scale(.85) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}
.precall-tag{font-family:'Sora',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#a78bfa;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:center;gap:6px;}
.precall-tag::before,.precall-tag::after{content:'';display:block;width:28px;height:1px;background:rgba(167,139,250,.4);}
.precall-avatar-wrap{position:relative;width:100px;height:100px;margin:0 auto 1.25rem;}
.precall-avatar-ring{position:absolute;inset:-5px;border-radius:50%;background:conic-gradient(from 0deg,#4f8ef7,#7c3aed,#4f8ef7);animation:spin 4s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.precall-avatar-inner{position:absolute;inset:3px;border-radius:50%;background:#0d0d1a;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:1;}
.precall-avatar-inner img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.precall-name{font-family:'Sora',sans-serif;font-size:1.65rem;font-weight:800;color:white;margin-bottom:.2rem;letter-spacing:-.02em;}
.precall-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin:.875rem 0 1.25rem;}
.chip{display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:20px;font-size:.79rem;font-weight:500;border:1px solid;}
.chip.country{background:rgba(79,142,247,.12);border-color:rgba(79,142,247,.3);color:#93c5fd;}
.chip.lang{background:rgba(124,58,237,.12);border-color:rgba(124,58,237,.3);color:#c4b5fd;}
.chip.level{background:rgba(5,150,105,.12);border-color:rgba(5,150,105,.3);color:#6ee7b7;}
.precall-starter{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:11px 14px;margin-bottom:1.75rem;font-size:.83rem;color:rgba(255,255,255,.58);line-height:1.5;}
.precall-starter strong{display:block;color:rgba(255,255,255,.3);font-size:.69rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px;}
.precall-countdown{display:flex;flex-direction:column;align-items:center;gap:.875rem;margin-bottom:.75rem;}
.countdown-ring{position:relative;width:66px;height:66px;}
.countdown-ring svg{transform:rotate(-90deg);}
.countdown-num{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:800;color:white;}
.precall-start-btn{background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;border:none;padding:12px 28px;border-radius:11px;font-family:'Sora',sans-serif;font-size:.93rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 18px rgba(79,142,247,.4);}
.precall-start-btn:hover{transform:translateY(-2px);}
.precall-back-btn{background:none;border:none;color:rgba(255,255,255,.28);font-size:.79rem;cursor:pointer;margin-top:.875rem;font-family:'DM Sans',sans-serif;transition:color .2s;}
.precall-back-btn:hover{color:rgba(255,255,255,.55);}

/* Video */
.video-compact-header{display:flex;align-items:center;justify-content:space-between;padding:5px 1rem;background:white;box-shadow:0 1px 4px rgba(0,0,0,.08);flex-shrink:0;}
.video-compact-header img{height:32px;width:auto;}
.video-compact-pts{font-size:.79rem;font-weight:700;color:#4285f4;}

/* Changed height to 100vh to ensure the interface occupies the full screen height */
.video-call-interface{display:flex;flex-direction:column;height:100vh;gap:.75rem;padding:.75rem;position:relative;box-sizing:border-box;}

/* Flex-grow allows this container to aggressively claim all remaining vertical space */
.video-container{position:relative;flex-grow:1;background:#1a1a1a;border-radius:12px;overflow:hidden;display:flex;justify-content:center;align-items:center;min-height:0;width:100%;}

/* Set object-fit to contain so wide video feeds fit fully inside the taller container without getting severely cropped on the sides */
.video-el{width:100%;height:100%;object-fit:contain;}

.video-el.local{position:absolute;bottom:16px;right:14px;width:130px;height:175px;border:2px solid white;border-radius:8px;z-index:10;object-fit:cover;background:#333;}
.timer-overlay{position:absolute;top:.875rem;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.65);backdrop-filter:blur(6px);padding:6px 16px;border-radius:22px;color:white;display:flex;align-items:center;gap:7px;z-index:5;border:1px solid rgba(255,255,255,.1);}
.timer-display{font-family:'Sora',sans-serif;font-size:.95rem;font-weight:700;letter-spacing:.05em;transition:color .4s;}
.timer-display.normal{color:#fff;}
.timer-display.warning{color:#fbbf24;}
.timer-display.critical{color:#f87171;animation:blink 1s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.5;}}
.status-badge{position:absolute;bottom:14px;left:14px;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:18px;font-size:.75rem;font-weight:600;z-index:20;backdrop-filter:blur(6px);border:1px solid transparent;}
.status-badge.connected{background:rgba(16,185,129,.2);border-color:rgba(16,185,129,.4);color:#6ee7b7;}
.status-badge.connecting,.status-badge.checking{background:rgba(251,191,36,.2);border-color:rgba(251,191,36,.3);color:#fcd34d;}
.status-badge.failed,.status-badge.disconnected{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.3);color:#fca5a5;}
.status-badge.new,.status-badge.closed{background:rgba(156,163,175,.2);border-color:rgba(156,163,175,.2);color:#d1d5db;}
.s-dot{width:6px;height:6px;border-radius:50%;}
.status-badge.connected .s-dot{background:#10b981;}
.status-badge.connecting .s-dot,.status-badge.checking .s-dot{background:#f59e0b;animation:pulse 1s infinite;}
.status-badge.failed .s-dot,.status-badge.disconnected .s-dot{background:#ef4444;}
.status-badge.new .s-dot,.status-badge.closed .s-dot{background:#9ca3af;}
.call-controls{background:white;padding:1.1rem 1.25rem;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.1);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
.control-btn-end{background:#ef4444;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:.93rem;display:flex;align-items:center;gap:.4rem;font-family:'DM Sans',sans-serif;}
.report-btn{background:none;border:1px solid #e5e7eb;color:#9ca3af;padding:5px 10px;border-radius:6px;font-size:.75rem;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;margin-top:5px;}
.report-btn:hover{border-color:#ef4444;color:#ef4444;background:#fff5f5;}
.ended-overlay,.disconnect-overlay,.rating-overlay{position:absolute;inset:0;background:rgba(0,0,0,.87);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:50;border-radius:12px;text-align:center;padding:2rem;color:white;animation:fadeIn .3s ease;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.ended-overlay h3,.disconnect-overlay h3{font-family:'Sora',sans-serif;font-size:1.15rem;font-weight:700;margin:.75rem 0 .4rem;}
.ended-overlay p,.disconnect-overlay p{color:rgba(255,255,255,.58);font-size:.87rem;margin:0 0 1.5rem;}
.spinner{width:44px;height:44px;border:3px solid rgba(255,255,255,.15);border-top-color:#f59e0b;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:1rem;}
.disc-end-btn{padding:9px 24px;background:#ef4444;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;font-family:'DM Sans',sans-serif;}
.rating-buttons{display:flex;gap:.875rem;margin-top:1.75rem;flex-wrap:wrap;}
.rating-btn{padding:.875rem 1.75rem;font-size:1.1rem;border-radius:8px;border:none;cursor:pointer;transition:transform .2s;}
.rating-btn.good{background:#10b981;color:white;}
.rating-btn.meh{background:#6b7280;color:white;}
.rating-btn.warn{background:#f59e0b;color:white;}
.rating-btn:hover{transform:scale(1.05);}
.context-note{font-size:.82rem;margin-bottom:.75rem;padding:5px 13px;border-radius:7px;}
.context-note.warning{color:#fbbf24;background:rgba(251,191,36,.15);}
.context-note.muted{color:rgba(255,255,255,.45);}

/* Report modal */
.report-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;}
.report-card{background:white;border-radius:14px;padding:1.5rem;width:100%;max-width:370px;animation:slideUp .28s cubic-bezier(.4,0,.2,1);}
.report-card h3{font-family:'Sora',sans-serif;font-size:1rem;font-weight:800;color:#1a1a2e;margin:0 0 .3rem;}
.report-card>p{color:#6b7280;font-size:.82rem;margin:0 0 1rem;}
.reason-btn{display:block;width:100%;padding:9px 12px;margin-bottom:7px;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:7px;font-size:.84rem;text-align:left;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;color:#374151;}
.reason-btn:hover,.reason-btn.sel{border-color:#ef4444;color:#ef4444;background:#fff5f5;}
.reason-btn.sel{font-weight:600;}
.report-actions{display:flex;gap:7px;margin-top:10px;}
.report-action-btn{flex:1;padding:10px;border:none;border-radius:7px;font-family:'Sora',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;transition:background .2s;}
.report-action-btn.block{background:#6b7280;color:white;}
.report-action-btn.report{background:#ef4444;color:white;}
.report-action-btn:disabled{opacity:.45;cursor:not-allowed;}
.report-cancel{width:100%;padding:8px;background:none;border:none;color:#9ca3af;cursor:pointer;font-size:.82rem;margin-top:5px;font-family:'DM Sans',sans-serif;}
.report-success{text-align:center;padding:.75rem 0;}
.report-success-icon{font-size:2.25rem;margin-bottom:.6rem;}

/* ── ADMIN DASHBOARD ─────────────────────────────────────── */
.admin-container{padding:1.5rem 1rem;max-width:1100px;margin:0 auto;}
.admin-header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;}
.admin-header h1{font-family:'Sora',sans-serif;font-size:1.4rem;font-weight:800;color:#1a1a2e;margin:0;}
.admin-badge{padding:3px 10px;background:#1e293b;color:#94a3b8;border-radius:20px;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
.admin-tabs{display:flex;gap:.5rem;margin-bottom:1.5rem;flex-wrap:wrap;}
.admin-tab{padding:8px 18px;border:1.5px solid #e5e7eb;border-radius:8px;background:white;color:#6b7280;cursor:pointer;font-size:.85rem;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .15s;}
.admin-tab.active{background:#1e293b;color:white;border-color:#1e293b;}
.admin-tab:hover:not(.active){border-color:#1e293b;color:#1e293b;}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.875rem;margin-bottom:1.5rem;}
.kpi-card{background:white;border-radius:10px;padding:1rem 1.1rem;box-shadow:0 1px 4px rgba(0,0,0,.07);border:1px solid #f1f5f9;}
.kpi-card .kpi-val{font-family:'Sora',sans-serif;font-size:1.8rem;font-weight:800;color:#1a1a2e;}
.kpi-card .kpi-lbl{font-size:.75rem;color:#94a3b8;margin-top:2px;}
.kpi-card .kpi-sub{font-size:.72rem;color:#22c55e;font-weight:600;margin-top:3px;}
.admin-section{background:white;border-radius:10px;padding:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.07);border:1px solid #f1f5f9;margin-bottom:1rem;}
.admin-section h3{font-family:'Sora',sans-serif;font-size:.93rem;font-weight:700;color:#1e293b;margin:0 0 1rem;}
.admin-table{width:100%;border-collapse:collapse;font-size:.83rem;}
.admin-table th{text-align:left;padding:8px 10px;background:#f8fafc;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;}
.admin-table td{padding:9px 10px;border-bottom:1px solid #f1f5f9;color:#374151;}
.admin-table tr:hover td{background:#f8fafc;}
.badge-pill{display:inline-block;padding:2px 9px;border-radius:12px;font-size:.72rem;font-weight:700;}
.badge-pill.pending{background:#fef3c7;color:#92400e;}
.badge-pill.actioned{background:#dcfce7;color:#166534;}
.badge-pill.reviewed{background:#e0e7ff;color:#3730a3;}
.badge-pill.banned{background:#fee2e2;color:#991b1b;}
.badge-pill.admin{background:#e0e7ff;color:#3730a3;}
.search-row{display:flex;gap:.75rem;margin-bottom:1rem;}
.search-input{flex:1;padding:9px 13px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.88rem;font-family:'DM Sans',sans-serif;outline:none;}
.search-input:focus{border-color:#4f8ef7;}
.search-btn{padding:9px 18px;background:#1e293b;color:white;border:none;border-radius:8px;cursor:pointer;font-size:.85rem;font-family:'DM Sans',sans-serif;}
.action-row{display:flex;gap:.5rem;flex-wrap:wrap;}
.act-btn{padding:5px 12px;border:1.5px solid #e5e7eb;border-radius:6px;background:white;font-size:.78rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
.btn-subtle{padding:9px;width:100%;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;cursor:pointer;font-size:.88rem;font-family:'DM Sans',sans-serif;transition:all .15s;}
.btn-accent-outline{padding:9px;width:100%;background:#f0f4ff;border:1px solid #c7d7fc;border-radius:6px;cursor:pointer;color:#4f46e5;font-size:.88rem;font-family:'DM Sans',sans-serif;transition:all .15s;}
.act-btn.ban{border-color:#fca5a5;color:#ef4444;}
.act-btn.unban{border-color:#bbf7d0;color:#10b981;}
.act-btn.adjust{border-color:#c7d7fc;color:#4f46e5;}
.act-btn.dismiss{border-color:#e2e8f0;color:#64748b;}
.act-btn.action{border-color:#fca5a5;color:#ef4444;}
.act-btn:hover{opacity:.8;}
.panel-white{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:1rem;box-shadow:0 2px 8px rgba(0,0,0,.06);}
.qty-btn{width:34px;height:34px;border-radius:50%;border:1.5px solid #e5e7eb;background:white;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;}
.text-muted{color:#6b7280;}
.bg-light{background:#f8fafc;}
.bg-green{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px;padding:.75rem 1rem;text-align:center;margin-bottom:.875rem;}
.warning-box{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:1rem;max-width:320;text-align:left;margin:.75rem 0;font-size:.83rem;color:#92400e;line-height:1.5;}
.pw-box{margin-top:8px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;}
.chart-row{display:flex;gap:4px;align-items:flex-end;height:80px;margin-top:.75rem;}
.chart-bar{flex:1;background:linear-gradient(to top,#4f8ef7,#7c3aed);border-radius:3px 3px 0 0;min-height:2px;transition:height .3s;}
.chart-labels{display:flex;gap:4px;margin-top:3px;}
.chart-lbl{flex:1;font-size:.6rem;color:#94a3b8;text-align:center;white-space:nowrap;overflow:hidden;}
.health-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;}
.health-item{background:#f8fafc;border-radius:8px;padding:.875rem 1rem;}
.health-item .h-val{font-family:'Sora',sans-serif;font-size:1.4rem;font-weight:800;color:#1e293b;}
.health-item .h-lbl{font-size:.75rem;color:#94a3b8;margin-top:2px;}
.inline-form{display:flex;gap:.5rem;margin-top:.75rem;flex-wrap:wrap;}
.inline-form input{flex:1;min-width:80px;padding:7px 10px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:.83rem;font-family:'DM Sans',sans-serif;}
.inline-form button{padding:7px 14px;background:#4f46e5;color:white;border:none;border-radius:6px;cursor:pointer;font-size:.83rem;}

/* Mobile */
@media(max-width:768px){
  .app-header-content{flex-direction:column;gap:.75rem;}
  .user-info{flex-direction:column;}
  .auth-box{margin:.75rem;width:auto;}
  .profile-section{padding:1.25rem;width:auto;margin:.75rem;}
  .video-el.local{width:48px!important;height:70px!important;bottom:8px!important;right:8px!important;}
  .slide-headline{font-size:1.35rem;}
  .precall-name{font-size:1.45rem;}
  .admin-container{padding:1rem .75rem;}
  .kpi-grid{grid-template-columns:1fr 1fr;}
  .balance-grid{grid-template-columns:1fr 1fr;}
}

/* Dark mode */
@media(prefers-color-scheme:dark){
  body,html{background:#0f1117;color:#e2e8f0;}
  .app-header{background:#1a1d2e;box-shadow:0 2px 10px rgba(0,0,0,.4);}
  .app-header .header-pts{background:#1e2740;border-color:#2d3a5c;color:#93c5fd;}
  .app-header .user-info span{color:#e2e8f0;}
  .auth-box{background:#1a1d2e;box-shadow:0 10px 30px rgba(0,0,0,.5);}
  .auth-subtitle{color:#94a3b8;}
  .auth-divider{color:#64748b;}
  .auth-divider::before{background:#334155;}
  .form-group label{color:#cbd5e1;}
  .form-group input,.form-group select{background:#0f1117;border-color:#334155;color:#e2e8f0;}
  .form-group input::placeholder{color:#64748b;}
  .error-message{background:rgba(239,68,68,.15);color:#fca5a5;border-left-color:#ef4444;}
  .modal-tab{background:#0f1117;border-color:#334155;color:#94a3b8;}
  .modal-tab.active{background:#1e293b;color:#e2e8f0;border-color:#1e293b;}
  .invite-url-box{background:#0f1117;border-color:#334155;color:#94a3b8;}
  .setting-name{color:#e2e8f0;}
  .setting-desc{color:#94a3b8;}
  .setting-row{border-bottom-color:#1e293b;}
  .toggle-slider{background:#334155;}
  .toggle-slider::before{background:#94a3b8;}
  .duration-input{background:#0f1117;border-color:#334155;color:#e2e8f0;}
  .profile-section{background:#1a1d2e;box-shadow:0 2px 10px rgba(0,0,0,.3);}
  .save-btn{background:#059669;}
  .upload-btn{background:#1e293b;border-color:#334155;color:#94a3b8;}
  .stats-card{background:#1a1d2e;box-shadow:0 2px 10px rgba(0,0,0,.3);}
  .stats-card h3{color:#e2e8f0;}
  .stat-row{border-bottom-color:#1e293b;}
  .stat-label{color:#94a3b8;}
  .stat-value{color:#e2e8f0;}
  .balance-tile.fp{background:linear-gradient(135deg,#1e2740,#1e3a5f);border-color:#2d4a7a;}
  .balance-tile.rp{background:linear-gradient(135deg,#0f2918,#14532d);border-color:#166534;}
  .exchange-btn{background:#1e293b;border-color:#334155;color:#93c5fd;}
  .exchange-btn:hover{background:#1e3a5f;}
  .welcome-message h2{color:#e2e8f0;}
  .welcome-message>p{color:#94a3b8;}
  .start-matching-btn{box-shadow:0 4px 18px rgba(79,142,247,.3);}
  .dashboard-online-pill{background:#0f2918;border-color:#166534;color:#4ade80;}
  .leaderboard-card{background:#1a1d2e;box-shadow:0 2px 10px rgba(0,0,0,.3);}
  .leaderboard-card h3{color:#e2e8f0;}
  .lb-tab.active{background:#4f46e5;color:white;}
  .lb-tab:not(.active){background:#1e293b;color:#94a3b8;}
  .lb-row.me{background:#1e2740;}
  .lb-rank{color:#94a3b8;}
  .lb-name{color:#e2e8f0;}
  .lb-sessions{color:#94a3b8;}
  .lb-score{color:#93c5fd;}
  .lang-select{border-color:rgba(255,255,255,.2);color:#e2e8f0;background-color:transparent;}
  .lang-select option{background:#1a1d2e;color:#e2e8f0;}
  .lang-select:hover{border-color:rgba(255,255,255,.35);}
  .lang-select:focus{border-color:#93c5fd;box-shadow:0 0 0 2px rgba(147,197,253,.2);}
  .friend-item{background:#1e293b;border-color:#2d3a5c;}
  .friend-name{color:#e2e8f0;}
  .friend-sub{color:#94a3b8;}
  .friend-avatar{background:#1e3a5f;color:#93c5fd;}
  .friend-action-btn{background:#1a1d2e;border-color:#334155;color:#94a3b8;}
  .friend-action-btn.accept{border-color:#166534;color:#4ade80;}
  .friend-action-btn.decline{border-color:#7f1d1d;color:#f87171;}
  .friend-action-btn.remove{border-color:#334155;color:#94a3b8;}
  .admin-container{background:#0f1117;}
  .admin-section{background:#1a1d2e;box-shadow:0 2px 10px rgba(0,0,0,.3);border-color:#2d3a5c;}
  .admin-table th{background:#1e293b;color:#94a3b8;border-bottom-color:#2d3a5c;}
  .admin-table td{color:#cbd5e1;border-bottom-color:#1e293b;}
  .admin-table tr:hover td{background:#1e293b;}
  .kpi-card{background:#1a1d2e;border-color:#2d3a5c;}
  .kpi-card h4{color:#94a3b8;}
  .kpi-card .kpi-val{color:#e2e8f0;}
  .admin-input{background:#0f1117;border-color:#334155;color:#e2e8f0;}
  .admin-input::placeholder{color:#64748b;}
  .admin-select{background:#0f1117;border-color:#334155;color:#e2e8f0;}
  .admin-btn{background:#1e293b;border-color:#334155;color:#94a3b8;}
  .admin-btn:hover{background:#2d3a5c;}
  .admin-btn.primary{background:linear-gradient(135deg,#4f8ef7,#7c3aed);border:none;color:white;}
  .modal-card{background:#1a1d2e;}
  .modal-card h2{color:#e2e8f0;}
  .modal-card p{color:#94a3b8;}
  .modal-input{background:#0f1117;border-color:#334155;color:#e2e8f0;}
  .modal-input::placeholder{color:#64748b;}
  .overlay{background:rgba(0,0,0,.8);}
  .report-overlay{background:rgba(0,0,0,.8);}
  .report-card{background:#1a1d2e;}
  .report-card h2{color:#e2e8f0;}
  .report-card p{color:#94a3b8;}
  .profile-gate-card{background:#1a1d2e;}
  .profile-gate-card h2{color:#e2e8f0;}
  .profile-gate-card p{color:#94a3b8;}
  .profile-gate-input{background:#0f1117;border-color:#334155;color:#e2e8f0;}
  .profile-gate-input::placeholder{color:#64748b;}
  .rating-overlay,.disconnect-overlay{background:rgba(0,0,0,.92);}
  .call-controls{background:#1a1d2e;box-shadow:0 4px 12px rgba(0,0,0,.4);}
  .control-btn-end{box-shadow:0 2px 8px rgba(239,68,68,.3);}
  .report-btn{background:#1a1d2e;border-color:#334155;color:#94a3b8;}
  .report-btn:hover{background:rgba(239,68,68,.1);border-color:#ef4444;color:#f87171;}
  .video-compact-header{background:#1a1d2e;box-shadow:0 1px 4px rgba(0,0,0,.4);}
  .chat-messages-container{background:#0f1117;}
  .chat-input-container{background:#1a1d2e;}
  .chat-input{background:#0f1117;border-color:#334155;color:#e2e8f0;}
  .chat-input::placeholder{color:#64748b;}
  .chat-send-btn{background:#4f8ef7;}
  .chat-send-btn:disabled{background:#334155;}
  .chat-msg{color:#e2e8f0;}
  .chat-msg.system{color:#94a3b8;background:#1e293b;border-color:#2d3a5c;}
  .modal-btn-ghost{color:#94a3b8;}
  .btn-subtle{background:#1e293b;border-color:#334155;color:#cbd5e1;}
  .btn-subtle:hover{background:#2d3a5c;}
  .btn-accent-outline{background:#1e2740;border-color:#2d4a7a;color:#93c5fd;}
  .btn-accent-outline:hover{background:#1e3a5f;}
  .act-btn{background:#1a1d2e;border-color:#334155;color:#94a3b8;}
  .panel-white{background:#1a1d2e;border-color:#2d3a5c;box-shadow:0 2px 8px rgba(0,0,0,.3);}
  .qty-btn{background:#1a1d2e;border-color:#334155;color:#e2e8f0;}
  .modal-panel{background:#1a1d2e;box-shadow:0 20px 60px rgba(0,0,0,.6);}
  .text-muted{color:#94a3b8;}
  .bg-light{background:#1e293b;}
  .bg-green{background:#0f2918;border-color:#166534;color:#4ade80;}
  .warning-box{background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.3);color:#fcd34d;}
  .pw-box{background:#1e293b;border-color:#2d3a5c;}
  .history-item{background:#1a1d2e;border-color:#2d3a5c;box-shadow:0 1px 3px rgba(0,0,0,.3);}
  .history-avatar{background:#2d3a5c;color:#cbd5e1;}
  .history-points{background:#0f2918;border-color:#166534;color:#4ade80;}
}
`;

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
    <div className="overlay" onClick={onClose}>
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
  const submit=async(action)=>{
    if(action!=='block'&&!reason)return;
    setSubmitting(true);
    try{
      if(action==='report'||action==='both')await authFetch(`${API_URL}/api/report`,{method:'POST',body:JSON.stringify({reported_id:targetUser.id,session_id:sessionId,reason})});
      if(action==='block'||action==='both')await authFetch(`${API_URL}/api/block`,{method:'POST',body:JSON.stringify({blocked_id:targetUser.id})});
      setDone(action);
    }catch{setDone(action);}finally{setSubmitting(false);}
  };
  const name=targetUser?.nickname||targetUser?.username||t.modals.reportUnknown;
  const reasonKeys=[t.modals.reportReason1,t.modals.reportReason2,t.modals.reportReason3,t.modals.reportReason4,t.modals.reportReason5,t.modals.reportReason6];
  if(done)return(
    <div className="report-overlay" onClick={onClose}>
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
    <div className="report-overlay" onClick={onClose}>
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

  const post=(p,b)=>authFetch(`${API_URL}${p}`,{method:'POST',body:JSON.stringify(b||{})}).then(r=>r.json());

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
    alert(t?.modals?.friendRequestSent||'Friend request sent!');
  };

  const respond=async(reqId,action)=>{
    await post('/api/friends/respond',{request_id:reqId,action});
    const d=await post('/api/friends/list',{});
    if(d.success){setFriends(d.friends||[]);setPending(d.pending_requests||[]);}
  };

  const removeFriend=async(fid)=>{
    await post('/api/friends/remove',{friend_id:fid});
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
        {f.avatar_url?<img src={f.avatar_url} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} alt=""/>:(f.nickname||f.username||'?').charAt(0).toUpperCase()}
      </div>
      <div className="friend-info">
        <div className="friend-name">{f.nickname||f.username}{f.founding_member?<span style={{marginLeft:5,padding:'1px 6px',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',borderRadius:8,fontSize:'.6rem',fontWeight:700,verticalAlign:'middle'}}>{t?.modals?.fmBadge||'🏆 FM'}</span>:null}{f.is_new_member?<span style={{marginLeft:5,padding:'1px 6px',background:'linear-gradient(135deg,#22c55e,#10b981)',color:'white',borderRadius:8,fontSize:'.6rem',fontWeight:700,verticalAlign:'middle'}}>{t?.modals?.newBadge||'🆕 NEW'}</span>:null}</div>
        <div className="friend-sub">{f.country?`${getFlag(f.country)} ${countryName(f.country)}`:''}{f.english_level?` · ${f.english_level}`:''}</div>
      </div>
      {actions}
    </div>
  );

  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal-card" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h2 style={{margin:0,textAlign:'left'}}>👥 {t?.modals?.friendsTitle||'Friends & Invite'}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:'1.1rem'}}>✕</button>
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

// ── Admin Dashboard ─────────────────────────────────────────────
// ── Admin Settings Panel ────────────────────────────────────────
function AdminSettingsPanel({user,t}){
  const[settings,setSettings]=useState({matching_by_level:'true',matching_diff_country:'true',matching_diff_language:'true',custom_call_duration:'0',promo_fp_free_days:'0',promo_initial_rp:'0',promo_badge_days:'0'});
  const[loading,setLoading]=useState(true);
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[customDur,setCustomDur]=useState('0');
  const[promoFpFree,setPromoFpFree]=useState('0');
  const[promoInitRp,setPromoInitRp]=useState('0');
  const[newMemberDays,setNewMemberDays]=useState('30');
  const[mvpMode,setMvpMode]=useState(false);
  const[maintenanceMode,setMaintenanceMode]=useState(false);
  const[maintenanceMsg,setMaintenanceMsg]=useState('');

  const post=(p,b)=>authFetch(`${API_URL}${p}`,{method:'POST',body:JSON.stringify(b||{})}).then(r=>r.json());

  useEffect(()=>{
    post('/api/admin/settings',{}).then(d=>{
      if(d.settings){
        const m={};d.settings.forEach(s=>m[s.key]=s.value);
        setSettings(m);
        setCustomDur(m.custom_call_duration||'0');
        setPromoFpFree(m.promo_fp_free_days||'0');
        setPromoInitRp(m.promo_initial_rp||'0');
        setNewMemberDays(m.new_member_days||'30');
        setMvpMode(m.mvp_mode==='true');
        setMaintenanceMode(m.maintenance_mode==='true');
        setMaintenanceMsg(m.maintenance_message||'');
      }
      setLoading(false);
    });
  },[]);

  const toggle=key=>{setSettings(prev=>({...prev,[key]:prev[key]==='true'?'false':'true'}));setSaved(false);};

  const saveAll=async()=>{
    setSaving(true);
    await Promise.all([
      post('/api/admin/settings/update',{key:'matching_by_level',value:settings.matching_by_level}),
      post('/api/admin/settings/update',{key:'matching_diff_country',value:settings.matching_diff_country}),
      post('/api/admin/settings/update',{key:'matching_diff_language',value:settings.matching_diff_language}),
      post('/api/admin/settings/update',{key:'custom_call_duration',value:customDur}),
      post('/api/admin/settings/update',{key:'promo_fp_free_days',value:promoFpFree}),
      post('/api/admin/settings/update',{key:'promo_initial_rp',value:promoInitRp}),
      post('/api/admin/settings/update',{key:'new_member_days',value:newMemberDays}),
      post('/api/admin/settings/update',{key:'mvp_mode',value:mvpMode?'true':'false'}),
      post('/api/admin/settings/update',{key:'maintenance_mode',value:maintenanceMode?'true':'false'}),
      post('/api/admin/settings/update',{key:'maintenance_message',value:maintenanceMsg}),
    ]);
    setSettings(prev=>({...prev,custom_call_duration:customDur,promo_fp_free_days:promoFpFree,promo_initial_rp:promoInitRp,new_member_days:newMemberDays}));
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),3000);
  };

  if(loading)return <p style={{color:'#9ca3af'}}>{t.admin.settings.loading}</p>;

  const allOff=settings.matching_by_level==='false'&&settings.matching_diff_country==='false'&&settings.matching_diff_language==='false';

  return(
    <div>
    <div className="admin-section">
      <h3>🎛️ {t.admin.settings.matchingTitle} <span style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:400}}>— {t.admin.settings.matchingSubtitle}</span></h3>
      {[
        {key:'matching_by_level',name:t.admin.settings.matchByLevel,desc:t.admin.settings.matchByLevelDesc},
        {key:'matching_diff_country',name:t.admin.settings.preferCountries,desc:t.admin.settings.preferCountriesDesc},
        {key:'matching_diff_language',name:t.admin.settings.preferLanguages,desc:t.admin.settings.preferLanguagesDesc},
      ].map(({key,name,desc})=>(
        <div key={key} className="setting-row">
          <div className="setting-info">
            <div className="setting-name">{name}</div>
            <div className="setting-desc">{desc}</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings[key]==='true'} onChange={()=>toggle(key)}/>
            <span className="toggle-slider"/>
          </label>
        </div>
      ))}
      {allOff&&(
        <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
          <div className="setting-info">
            <div className="setting-name">{t.admin.settings.customDuration}</div>
            <div className="setting-desc">{t.admin.settings.customDurationDesc}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
            <input type="number" className="duration-input" min="1" max="60" value={customDur} onChange={e=>setCustomDur(e.target.value)}/>
            <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.minutesPerSession}</span>
          </div>
        </div>
      )}
      <button className="save-settings-btn" onClick={saveAll} disabled={saving}>{saving?t.admin.settings.saving:saved?t.admin.settings.saved:t.admin.settings.saveSettings}</button>
    </div>

    <div className="admin-section" style={{marginTop:'1rem'}}>
      <h3>🎁 {t.admin.settings.promotionsTitle} <span style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:400}}>— {t.admin.settings.promotionsSubtitle}</span></h3>
      <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.freeFPPeriod}</div>
          <div className="setting-desc">{t.admin.settings.freeFPPeriodDesc}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
          <input type="number" className="duration-input" min="0" max="365" value={promoFpFree} onChange={e=>setPromoFpFree(e.target.value)}/>
          <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.daysOff}</span>
          {parseInt(promoFpFree)>0&&<span style={{fontSize:'.7rem',color:'#22c55e',fontWeight:600}}>● {t.admin.settings.active}</span>}
        </div>
      </div>
      <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.registrationRP}</div>
          <div className="setting-desc">{t.admin.settings.registrationRPDesc}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
          <input type="number" className="duration-input" min="0" max="100" value={promoInitRp} onChange={e=>setPromoInitRp(e.target.value)}/>
          <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.rpOff}</span>
          {parseInt(promoInitRp)>0&&<span style={{fontSize:'.7rem',color:'#22c55e',fontWeight:600}}>● {t.admin.settings.active}</span>}
        </div>
      </div>
      <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.newMemberBadge}</div>
          <div className="setting-desc">{t.admin.settings.newMemberBadgeDesc}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
          <input type="number" className="duration-input" min="0" max="365" value={newMemberDays} onChange={e=>setNewMemberDays(e.target.value)}/>
          <span style={{fontSize:'.8rem',color:'#6b7280'}}>{t.admin.settings.daysOffDefault}</span>
          {parseInt(newMemberDays)>0&&<span style={{fontSize:'.7rem',color:'#22c55e',fontWeight:600}}>● {t.admin.settings.active}</span>}
        </div>
      </div>
      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-name">{t.admin.settings.mvpMode}</div>
          <div className="setting-desc">{t.admin.settings.mvpModeDesc}</div>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={mvpMode} onChange={()=>setMvpMode(v=>!v)}/>
          <span className="toggle-slider"/>
        </label>
      </div>
    </div>

    <div className="admin-section" style={{marginTop:'1rem'}}>
      <h3>🔧 {t.admin.settings.systemTitle} <span style={{fontSize:'.72rem',color:'#94a3b8',fontWeight:400}}>— {t.admin.settings.systemSubtitle}</span></h3>
      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-name" style={maintenanceMode?{color:'#ef4444'}:{}}>{t.admin.settings.maintenanceMode} {maintenanceMode?'● '+t.admin.settings.active:''}</div>
          <div className="setting-desc">{t.admin.settings.maintenanceModeDesc}</div>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={maintenanceMode} onChange={()=>setMaintenanceMode(v=>!v)}/>
          <span className="toggle-slider"/>
        </label>
      </div>
      {maintenanceMode&&(
        <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
          <div className="setting-info">
            <div className="setting-name">{t.admin.settings.maintenanceMessage}</div>
            <div className="setting-desc">{t.admin.settings.maintenanceMessageDesc}</div>
          </div>
          <textarea value={maintenanceMsg} onChange={e=>setMaintenanceMsg(e.target.value)} placeholder={t.admin.settings.maintenancePlaceholder} style={{width:'100%',minHeight:60,padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem',resize:'vertical'}}/>
        </div>
      )}
      <button className="save-settings-btn" onClick={saveAll} disabled={saving}>{saving?t.admin.settings.saving:saved?t.admin.settings.saved:t.admin.settings.saveSettings}</button>
    </div>
    </div>
  );
}

function AdminDashboard({user,onBack,t}){
  const[tab,setTab]=useState('analytics');
  const[stats,setStats]=useState(null);
  const[reports,setReports]=useState([]);
  const[reportFilter,setReportFilter]=useState('pending');
  const[loading,setLoading]=useState(false);

  const post=(path,body)=>authFetch(`${API_URL}${path}`,{method:'POST',body:JSON.stringify(body||{})}).then(r=>r.json());

  const renderAnalytics = (stats, maxSessions) => {
    if (!stats) return null;
    try {
    return (
      <div>
        <div className="kpi-grid">
          <div className="kpi-card"><div className="kpi-val">{stats.total_users?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.totalUsers}</div><div className="kpi-sub">+{stats.new_users_today} {t.admin.analytics.today}</div></div>
          <div className="kpi-card"><div className="kpi-val">{stats.dau?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.dau}</div></div>
          <div className="kpi-card"><div className="kpi-val">{stats.mau?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.mau}</div></div>
          <div className="kpi-card"><div className="kpi-val">{stats.total_sessions?.toLocaleString()}</div><div className="kpi-lbl">{t.admin.analytics.completedCalls}</div></div>
          <div className="kpi-card"><div className="kpi-val" style={{color:'#22c55e'}}>{stats.active_sessions}</div><div className="kpi-lbl">{t.admin.analytics.liveCalls}</div></div>
          <div className="kpi-card"><div className="kpi-val" style={{color:'#f59e0b'}}>{stats.queue_size}</div><div className="kpi-lbl">{t.admin.analytics.inQueue}</div></div>
          <div className="kpi-card"><div className="kpi-val" style={{color:'#ef4444'}}>{stats.pending_reports}</div><div className="kpi-lbl">{t.admin.analytics.pendingReports}</div></div>
        </div>
        {stats.connection_stats&&(function(){
            const cs=stats.connection_stats;
            const total=cs.total_sessions||0;
            const connected=cs.connected||0;
            const connectRate=total?Math.round((connected/total)*100):0;
            const avgConnect=cs.avg_time_to_connect||0;
            return (
              <div>
                <div className="kpi-grid" style={{marginTop:'.75rem'}}>
                  <div className="kpi-card"><div className="kpi-val" style={{color:connectRate>50?'#22c55e':'#ef4444'}}>{connectRate}%</div><div className="kpi-lbl">{t.admin.analytics.connectRate}</div></div>
                  <div className="kpi-card"><div className="kpi-val">{avgConnect?Math.round(avgConnect)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.avgConnectTime}</div></div>
                  <div className="kpi-card"><div className="kpi-val" style={{color:'#ef4444'}}>{cs.network_disconnects||0}</div><div className="kpi-lbl">{t.admin.analytics.networkDisconnects}</div></div>
                  <div className="kpi-card"><div className="kpi-val" style={{color:'#6b7280'}}>{cs.intentional_ends||0}</div><div className="kpi-lbl">{t.admin.analytics.intentionalEnd}</div></div>
                  <div className="kpi-card"><div className="kpi-val">{cs.connection_issues||0}</div><div className="kpi-lbl">{t.admin.analytics.connectionIssues}</div></div>
                </div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.disconnectReasons}</h3>
                  <div className="chart-row" style={{height:'120px'}}>
                    <div className="chart-bar" style={{height:`${(cs.network_disconnects||0)/Math.max(total,1)*100}%`,background:'#ef4444'}} title={`Network: ${cs.network_disconnects||0}`}/>
                    <div className="chart-bar" style={{height:`${(cs.intentional_ends||0)/Math.max(total,1)*100}%`,background:'#6b7280'}} title={`Intentional End Call: ${cs.intentional_ends||0}`}/>
                    <div className="chart-bar" style={{height:`${(cs.connection_issues||0)/Math.max(total,1)*100}%`,background:'#f59e0b'}} title={`Connection Issues: ${cs.connection_issues||0}`}/>
                    <div className="chart-bar" style={{height:`${(cs.timeouts||0)/Math.max(total,1)*100}%`,background:'#3b82f6'}} title={`Timeout: ${cs.timeouts||0}`}/>
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    <div className="chart-lbl" style={{color:'#ef4444'}}>{t.admin.analytics.network}</div>
                    <div className="chart-lbl" style={{color:'#6b7280'}}>{t.admin.analytics.intentionalEndChart}</div>
                    <div className="chart-lbl" style={{color:'#f59e0b'}}>{t.admin.analytics.connectionIssuesChart}</div>
                    <div className="chart-lbl" style={{color:'#3b82f6'}}>{t.admin.analytics.timeout}</div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.session_stats&&(function(){
            const ss=stats.session_stats;
            const completed=ss.completed_sessions||0;
            const good=(ss.good_ratings||0)+(ss.good_ratings_2||0);
            const meh=(ss.meh_ratings||0)+(ss.meh_ratings_2||0);
            const issues=(ss.connection_issue_ratings||0)+(ss.connection_issue_ratings_2||0);
            const totalRatings=good+meh+issues;
            const completedFull=(ss.completed_full||0)+(ss.completed_full_beginner||0)+(ss.completed_full_other||0);
            const completionRate=completed?Math.round((completedFull/completed)*100):0;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.sessionQuality}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{ss.avg_duration?Math.round(ss.avg_duration/60)+'m': 'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.avgDuration}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{ss.max_duration?Math.round(ss.max_duration/60)+'m':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.maxDuration}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:completionRate>70?'#22c55e':'#ef4444'}}>{completionRate}%</div><div className="kpi-lbl">{t.admin.analytics.fullCompletion}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{good}</div><div className="kpi-lbl" style={{color:'#10b981' }}>{t.admin.analytics.good}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{meh}</div><div className="kpi-lbl" style={{color:'#6b7280'}}>{t.admin.analytics.meh}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{issues}</div><div className="kpi-lbl" style={{color:'#f59e0b'}}>{t.admin.analytics.issues}</div></div>
                  </div>
                  <div className="chart-row" style={{height:'100px'}}>
                    <div className="chart-bar" style={{height:`${totalRatings?Math.round((good/totalRatings)*100):0}%`,background:'#10b981'}} title={`Good: ${good}`}/>
                    <div className="chart-bar" style={{height:`${totalRatings?Math.round((meh/totalRatings)*100):0}%`,background:'#6b7280'}} title={`Meh: ${meh}`}/>
                    <div className="chart-bar" style={{height:`${totalRatings?Math.round((issues/totalRatings)*100):0}%`,background:'#f59e0b'}} title={`Issues: ${issues}`}/>
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    <div className="chart-lbl" style={{color:'#10b981'}}>{t.admin.analytics.goodChart}</div>
                    <div className="chart-lbl" style={{color:'#6b7280'}}>{t.admin.analytics.mehChart}</div>
                    <div className="chart-lbl" style={{color:'#f59e0b'}}>{t.admin.analytics.issuesChart}</div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.queue_stats&&(function(){
            const qs=stats.queue_stats;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.queueWait}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{qs.avg_wait?Math.round(qs.avg_wait)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.avgWait}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{qs.min_wait?Math.round(qs.min_wait)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.minWait}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{qs.max_wait?Math.round(qs.max_wait)+'s':'N/A'}</div><div className="kpi-lbl">{t.admin.analytics.maxWait}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.cross_border_stats&&(function(){
            const cb=stats.cross_border_stats;
            const total=cb.total_matches||0;
            const cross=cb.cross_border||0;
            const rate=total?Math.round((cross/total)*100):0;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.crossBorder}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{total}</div><div className="kpi-lbl">{t.admin.analytics.totalMatches}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{cross}</div><div className="kpi-lbl">{t.admin.analytics.crossBorder}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rate>50?'#22c55e':'#ef4444'}}>{rate}%</div><div className="kpi-lbl">{t.admin.analytics.crossBorderRate}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.browser_stats&&stats.browser_stats.length>0&&(function(){
            const bs=stats.browser_stats;
            const totalFailures=stats.browser_stats.reduce((sum,b)=>sum+(b.failures||0),0);
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.webrtcFailures}</h3>
                  <div className="chart-row" style={{height:'100px'}}>
                    {stats.browser_stats.map((b,i)=>(
                      <div key={i} className="chart-bar" style={{height:`${(b.failures||0)/Math.max(totalFailures,1)*100}%`,background:['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i%5]}} title={`${b.browser}: ${b.failures||0} failures`}/>
                    ))}
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    {stats.browser_stats.map((b,i)=><div key={i} className="chart-lbl" style={{color:['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i%5]}}>{b.browser} ({(b.failures||0)/Math.max(totalFailures,1)*100}%)</div>)}
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.rematch_stats&&(function(){
            const rs=stats.rematch_stats;
            const rate=rs.rematches>0?Math.round((rs.rematches/stats.session_stats?.completed_sessions)*100):0;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.reMatchRate}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{rs.rematches||0}</div><div className="kpi-lbl">{t.admin.analytics.reMatches}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{rate}%</div><div className="kpi-lbl">{t.admin.analytics.reMatchRateStat}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.queue_depth_stats&&stats.queue_depth_stats.results&&(function(){
            const qd=stats.queue_depth_stats;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.queueDepth}</h3>
                  <div className="chart-row" style={{height:'120px'}}>
                    {qd.results.map((d,i)=>(
                      <div key={i} className="chart-bar" style={{height:`${(d.queue_size||0)/Math.max(...qd.results.map(x=>x.queue_size||0),1)*100}%`,background:'#3b82f6'}} title={`${d.day}: ${d.queue_size||0}`}/>
                    ))}
                  </div>
                  <div className="chart-labels" style={{marginTop:'.5rem'}}>
                    {qd.results.filter((_,i)=>i%5===0).map((d,i)=><div key={i} className="chart-lbl" style={{flex:5}}>{d.day?.slice(5)}</div>)}
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.fp_rp_stats&&(function(){
            const fr=stats.fp_rp_stats;
            const totalUsers=fr.active_users||1;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.economy}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val" style={{color:'#10b981'}}>{stats.fp_rp_stats.fp_earned||0}</div><div className="kpi-lbl">{t.admin.analytics.fpEarned}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:'#ef4444'}}>{stats.fp_rp_stats.fp_spent||0}</div><div className="kpi-lbl">{t.admin.analytics.fpSpent}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:'#f59e0b'}}>{stats.fp_rp_stats.rp_earned||0}</div><div className="kpi-lbl">{t.admin.analytics.rpEarned}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{(stats.fp_rp_stats.fp_earned||0)/Math.max(stats.fp_rp_stats.active_users||1,1).toFixed(2)}</div><div className="kpi-lbl">{t.admin.analytics.fpUser}</div></div>
                    <div className="kpi-card"><div className="kpi-val">{(stats.fp_rp_stats.rp_earned||0)/Math.max(stats.fp_rp_stats.active_users||1,1).toFixed(2)}</div><div className="kpi-lbl">{t.admin.analytics.rpUser}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.retention_stats&&(function(){
            const rt=stats.retention_stats;
            const total=rt.total_users||1;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.retention}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{rt.total_users||0}</div><div className="kpi-lbl">{t.admin.analytics.totalUsers}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rt.d1_users/total>0.4?'#22c55e':'#ef4444'}}>{Math.round((rt.d1_users||0)/total*100)}%</div><div className="kpi-lbl">{t.admin.analytics.day1Retention}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rt.d7_users/total>0.2?'#22c55e':'#ef4444'}}>{Math.round((rt.d7_users||0)/total*100)}%</div><div className="kpi-lbl">{t.admin.analytics.day7Retention}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:rt.d30_users/total>0.1?'#22c55e':'#ef4444'}}>{Math.round((rt.d30_users||0)/total*100)}%</div><div className="kpi-lbl">{t.admin.analytics.day30Retention}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.report_stats&&(function(){
            const rs=stats.report_stats;
            return (
              <div>
                <div className="admin-section" style={{marginTop:'.75rem'}}>
                  <h3>{t.admin.analytics.reportsPer1000}</h3>
                  <div className="kpi-grid" style={{marginBottom:'.75rem'}}>
                    <div className="kpi-card"><div className="kpi-val">{stats.report_stats.total_reports||0}</div><div className="kpi-lbl">{t.admin.analytics.totalReports}</div></div>
                    <div className="kpi-card"><div className="kpi-val" style={{color:stats.report_stats.reports_per_1000>10?'#ef4444':stats.report_stats.reports_per_1000>5?'#f59e0b':'#22c55e'}}>{stats.report_stats.reports_per_1000?stats.report_stats.reports_per_1000.toFixed(1):'0'}</div><div className="kpi-lbl">{t.admin.analytics.per1000Sessions}</div></div>
                  </div>
                </div>
              </div>
            );
          }())}
        {stats.sessions_by_day&&stats.sessions_by_day.length>0&&(
        <div className="admin-section">
          <h3>{t.admin.analytics.sessionsLast30}</h3>
          <div className="chart-row">
            {[...stats.sessions_by_day].reverse().map((r,i)=>(
              <div key={i} className="chart-bar" style={{height:`${(r.c/maxSessions)*100}%`}} title={`${r.day}: ${r.c} sessions`}/>
            ))}
          </div>
          <div className="chart-labels">
            {[...stats.sessions_by_day].reverse().filter((_,i)=>i%5===0).map((r,i)=>(
              <div key={i} className="chart-lbl" style={{flex:5}}>{r.day?.slice(5)}</div>
            ))}
          </div>
        </div>
        )}
      </div>
    );
    } catch(e) { console.error('renderAnalytics error:', e); return <div style={{padding:'1rem',color:'#ef4444'}}>{t.admin.analytics.errorLoading}</div>; }
  };

  useEffect(()=>{
    if(tab==='analytics'){
      setLoading(true);
      post('/api/admin/stats',{}).then(d=>{setStats(d);setLoading(false);}).catch(()=>setLoading(false));
    }
  },[tab]);

  const loadReports=async()=>{
    setLoading(true);
    const d=await post('/api/admin/reports',{status:reportFilter});
    setReports(d.reports||[]);setLoading(false);
  };

  useEffect(()=>{if(tab==='reports')loadReports();},[tab,reportFilter]);

  const doReportAction=async(rid,action,note='')=>{
    await post(`/api/admin/report/${rid}/action`,{action,note});
    loadReports();
  };

const maxSessions=stats?.sessions_by_day?.length?Math.max(...stats.sessions_by_day.map(r=>r.c),1):1;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>{t.admin.title}</h1>
        <span className="admin-badge">{t.admin.badge}</span>
        <button className="header-btn btn-logout" onClick={onBack}>{t.admin.back}</button>
      </div>
      <div className="admin-tabs">
        {['analytics','users','referrals','reports','settings','health'].map(tabName=>(
          <button key={tabName} className={`admin-tab ${tab===tabName?'active':''}`} style={{textTransform:'capitalize'}} onClick={()=>setTab(tabName)}>{t.admin.tabs[tabName]}</button>
        ))}
      </div>
      {tab==='analytics' && renderAnalytics(stats, maxSessions)}
{tab==='users'&&(<UsersTab user={user} post={post} t={t}/>)} 
      {tab==='reports'&&(
        <>
          <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
            {['pending','reviewed','actioned'].map(s=>(
              <button key={s} className={`admin-tab ${reportFilter===s?'active':''}`} style={{textTransform:'capitalize',padding:'6px 14px'}} onClick={()=>setReportFilter(s)}>{s}</button>
            ))}
          </div>
          {loading?<p style={{color:'#9ca3af'}}>{t.admin.analytics.loading}</p>:reports.length===0?<p style={{color:'#9ca3af',textAlign:'center'}}>{t.admin.analytics.noReports.replace('{filter}',reportFilter)}</p>:(
            <div className="admin-section">
              <h3>{reports.length} {reportFilter} {t.admin.analytics.reports}</h3>
              <div style={{overflowX:'auto'}}>
                <table className="admin-table">
                  <thead><tr><th>{t.admin.analytics.reporter}</th><th>{t.admin.analytics.reported}</th><th>{t.admin.analytics.reason}</th><th>{t.admin.analytics.date}</th><th>{t.admin.analytics.status}</th><th>{t.admin.analytics.actions}</th></tr></thead>
                  <tbody>
                    {reports.map(r=>(
                      <tr key={r.id}>
                        <td>{r.reporter_name}</td>
                        <td><strong>{r.reported_name}</strong><br/><span style={{fontSize:'.75rem',color:'#94a3b8'}}>{r.reported_email}</span></td>
                        <td style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.reason}</td>
                        <td style={{fontSize:'.78rem',color:'#94a3b8'}}>{r.created_at?.slice(0,10)}</td>
                        <td><span className={`badge-pill ${r.status}`}>{r.status}</span></td>
                        <td>
                          {r.status==='pending'&&(
                            <div className="action-row">
                              <button className="act-btn dismiss" onClick={()=>doReportAction(r.id,'dismiss','Reviewed — no action needed')}>{t.admin.analytics.dismiss}</button>
                              <button className="act-btn action" onClick={()=>doReportAction(r.id,'action','User warned')}>{t.admin.analytics.actionBtn}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {tab==='settings'&&(
        <AdminSettingsPanel user={user} t={t}/>
      )}
      {tab==='referrals'&&(
        <ReferralsTab post={post} t={t}/>
      )}
      {tab==='health'&&(
        <HealthTab stats={stats} user={user} post={post} t={t}/>
      )}
    </div>
  );
}

function ReferralsTab({post,t}){
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    post('/api/admin/referrals',{}).then(d=>{if(d.success)setData(d);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  if(loading)return<p style={{color:'#9ca3af',padding:'1rem'}}>{t.admin.referrals.loading}</p>;
  if(!data)return<p style={{color:'#9ca3af',padding:'1rem'}}>{t.admin.referrals.failed}</p>;
  return(
    <div className="admin-section">
      <h3>{t.admin.referrals.overview}</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'1.5rem'}}>
        <div className="kpi-card"><div className="kpi-val">{data.total_referrals}</div><div className="kpi-lbl">{t.admin.referrals.totalReferrals}</div></div>
        <div className="kpi-card"><div className="kpi-val" style={{color:'#4f46e5'}}>{data.total_rp_given} RP</div><div className="kpi-lbl">{t.admin.referrals.totalRP}</div></div>
      </div>
      <h3>{t.admin.referrals.recentRewards}</h3>
      {data.transactions.length===0?<p style={{color:'#9ca3af'}}>{t.admin.referrals.noRewards}</p>:(
        <div style={{overflowX:'auto'}}>
          <table className="admin-table">
            <thead><tr><th>{t.admin.referrals.referredBy}</th><th>{t.admin.referrals.newUser}</th><th>{t.admin.referrals.date}</th></tr></thead>
            <tbody>
              {data.transactions.map(t=>(
                <tr key={t.id}>
                  <td>{t.referrer_nickname||t.referrer_name||t.referrer_email}</td>
                  <td>{t.invitee_nickname||t.invitee_name||t.invitee_email}</td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersTab({user,post,t}){
  const[users,setUsers]=useState([]);
  const[page,setPage]=useState(0);
  const[loading,setLoading]=useState(true);
  const[total,setTotal]=useState(0);
  const[searchQ,setSearchQ]=useState('');
  const[searchMode,setSearchMode]=useState(false);
  const[showForm,setShowForm]=useState(false);
  const[editingUser,setEditingUser]=useState(null);
  const[form,setForm]=useState({username:'',email:'',english_level:'beginner',country:'',native_language:''});
  const[formError,setFormError]=useState('');
  const[formSaving,setFormSaving]=useState(false);
  const[selectedUser,setSelectedUser]=useState(null);
  const[adjustFP,setAdjustFP]=useState('');
  const[adjustRP,setAdjustRP]=useState('');
  const[banReason,setBanReason]=useState('');
  const[statuses,setStatuses]=useState({});
  const PAGE=50;

  const load=async(p=0)=>{
    setLoading(true);
    const d=await post('/api/admin/users/all',{offset:p*PAGE,limit:PAGE});
    if(d.success){setUsers(d.users||[]);setTotal(d.total||0);}
    setLoading(false);
  };

  const fetchStatuses=async()=>{
    const ids=users.map(u=>u.id);
    if(!ids.length)return;
    const d=await post('/api/admin/users/status',{user_ids:ids});
    if(d.success)setStatuses(d.statuses||{});
  };

  useEffect(()=>{if(!searchMode)load(page);},[page,searchMode]);
  useEffect(()=>{if(users.length>0)fetchStatuses();},[users]);
  useEffect(()=>{
    if(!users.length)return;
    const iv=setInterval(fetchStatuses,10000);
    return()=>clearInterval(iv);
  },[users.map(u=>u.id).join(',')]);

  const searchUsers=async()=>{
    if(!searchQ.trim()){clearSearch();return;}
    setLoading(true);setSearchMode(true);
    const d=await post('/api/admin/users',{query:searchQ});
    setUsers(d.users||[]);setTotal(d.users?.length||0);setLoading(false);
  };

  const clearSearch=()=>{setSearchQ('');setSearchMode(false);setPage(0);};

  const exportCSV=async()=>{
    const d=await post('/api/admin/users/export',{});
    if(!d.csv)return;
    const blob=new Blob([d.csv],{type:'text/csv'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='chatter3_users_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
  };

  const openAdd=()=>{setEditingUser(null);setForm({username:'',email:'',english_level:'beginner',country:'',native_language:''});setFormError('');setShowForm(true);};
  const openEdit=(u)=>{setEditingUser(u);setForm({username:u.username,email:u.email,english_level:u.english_level||'beginner',country:u.country||'',native_language:u.native_language||'',nickname:u.nickname||''});setFormError('');setShowForm(true);};

  const saveUser=async()=>{
    setFormSaving(true);setFormError('');
    try{
      if(editingUser){
        const d=await post('/api/admin/user/'+editingUser.id+'/update',form);
        if(d.error){setFormError(d.error);setFormSaving(false);return;}
        if(d.success)setUsers(prev=>prev.map(u=>u.id===editingUser.id?d.user:u));
      }else{
        const d=await post('/api/admin/user/create',form);
        if(d.error){setFormError(d.error);setFormSaving(false);return;}
        if(d.success){setUsers(prev=>[d.user,...prev]);setTotal(t=>t+1);}
      }
      setShowForm(false);
    }catch(e){setFormError(t.admin.users.requestFailed);}
    setFormSaving(false);
  };

  const deleteUser=async(u)=>{
    if(!confirm(t.admin.users.deleteConfirm.replace('{username}',u.username)))return;
    try{
      const d=await post('/api/admin/user/'+u.id+'/delete');
      if(d.error){alert(d.error);return;}
      if(d.success){setUsers(prev=>prev.filter(x=>x.id!==u.id));setTotal(t=>t-1);}
    }catch(e){alert(t.admin.users.deleteFailed+e.message);}
  };

  const loadUserDetail=async(uid)=>{
      const d=await post('/api/admin/user/'+uid,{});
    setSelectedUser(d);
  };

  const doAdjust=async(uid)=>{
    await post('/api/admin/user/'+uid+'/adjust',{fp_delta:parseFloat(adjustFP)||0,rp_delta:parseFloat(adjustRP)||0});
    alert(t.admin.users.balancesUpdated);loadUserDetail(uid);setAdjustFP('');setAdjustRP('');
  };

  const doBan=async(uid)=>{
    if(!banReason.trim()){alert(t.admin.users.enterReason);return;}
    await post('/api/admin/user/'+uid+'/ban',{reason:banReason});
    alert(t.admin.users.userBanned);setBanReason('');loadUserDetail(uid);
  };

  const doUnban=async(uid)=>{
    await post('/api/admin/user/'+uid+'/unban',{});
    alert(t.admin.users.userUnbanned);loadUserDetail(uid);
  };

  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
        <p style={{margin:0,fontSize:'.88rem',color:'#64748b'}}>
          {searchMode?t.admin.users.searchResults.replace('{N}',users.length):t.admin.users.pagination.replace('{N}',total).replace('{N}',page+1).replace('{N}',Math.ceil(total/PAGE||1))}
        </p>
        <div style={{display:'flex',gap:'.5rem'}}>
          <button className="save-settings-btn" style={{margin:0,background:'#22c55e'}} onClick={openAdd}>{t.admin.users.addUser}</button>
          <button className="save-settings-btn" style={{margin:0}} onClick={exportCSV}>{t.admin.users.exportCSV}</button>
        </div>
      </div>

      <div className="search-row">
        <input className="search-input" placeholder={t.admin.users.searchPlaceholder} value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')searchUsers();if(e.key==='Escape')clearSearch();}}/>
        {searchMode?<button className="search-btn" onClick={clearSearch} style={{background:'#64748b'}}>{t.admin.users.clear}</button>:<button className="search-btn" onClick={searchUsers}>{t.admin.users.searchButton}</button>}
      </div>

      {selectedUser&&(
        <div className="admin-section" style={{marginBottom:'1rem',borderLeft:'3px solid #4f8ef7'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'.5rem'}}>
            <div>
              <h3 style={{margin:0}}>{selectedUser.user?.nickname||selectedUser.user?.username} <span style={{fontWeight:400,color:'#94a3b8',fontSize:'.82rem'}}>{selectedUser.user?.email}</span></h3>
              <div style={{display:'flex',gap:.5,flexWrap:'wrap',marginTop:'.4rem'}}>
                {selectedUser.user?.is_admin?<span className="badge-pill admin">{t.admin.users.adminBadge}</span>:null}
                {selectedUser.user?.is_banned?<span className="badge-pill banned">{t.admin.users.bannedBadge}</span>:null}
                <span style={{fontSize:'.78rem',color:'#94a3b8'}}>{selectedUser.user?.country?getFlag(selectedUser.user.country)+' '+countryName(selectedUser.user.country):'—'} · {selectedUser.user?.english_level}</span>
              </div>
            </div>
            <button onClick={()=>setSelectedUser(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:.9}}>{t.admin.users.close}</button>
          </div>
           <div className="bg-light" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.5rem',margin:'.875rem 0',borderRadius:8,padding:'.75rem'}}>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#1d4ed8'}}>{selectedUser.user?.fp_balance??0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.fp}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#15803d'}}>{(selectedUser.user?.rp_balance||0).toFixed(1)}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.rp}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem'}}>{selectedUser.sessions?.length||0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.sessions}</div></div>
            <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#ef4444'}}>{selectedUser.reports_received||0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.users.reports}</div></div>
          </div>
           <p style={{margin:'0 0 .5rem',fontSize:'.82rem',fontWeight:600}}>{t.admin.users.adjustBalances}</p>
          <div className="inline-form">
            <input placeholder={t.admin.users.fpDelta} value={adjustFP} onChange={e=>setAdjustFP(e.target.value)}/>
            <input placeholder={t.admin.users.rpDelta} value={adjustRP} onChange={e=>setAdjustRP(e.target.value)}/>
            <button onClick={()=>doAdjust(selectedUser.user?.id)}>{t.admin.users.apply}</button>
          </div>
          {!selectedUser.user?.is_banned?(
            <>
               <p style={{margin:'.875rem 0 .4rem',fontSize:'.82rem',fontWeight:600}}>{t.admin.users.banUser}</p>
              <div className="inline-form">
                <input placeholder={t.admin.users.banReason} value={banReason} onChange={e=>setBanReason(e.target.value)} style={{flex:2}}/>
                <button style={{background:'#ef4444'}} onClick={()=>doBan(selectedUser.user?.id)}>{t.admin.users.banButton}</button>
              </div>
            </>
          ):(
            <button className="act-btn unban" style={{marginTop:'.75rem'}} onClick={()=>doUnban(selectedUser.user?.id)}>{t.admin.users.unbanButton}</button>
          )}
        </div>
      )}

      {showForm&&(
        <div className="panel-white">
          <h4 style={{margin:'0 0 12px',fontSize:'.95rem'}}>{editingUser?t.admin.users.editUser:t.admin.users.addUserTitle}</h4>
          {formError&&<p style={{color:'#ef4444',fontSize:'.82rem',margin:'0 0 8px'}}>{formError}</p>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.usernameRequired}</label><input value={form.username} onChange={upd('username')} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.displayName}</label><input value={form.nickname||''} onChange={upd('nickname')} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.emailRequired}</label><input value={form.email} onChange={upd('email')} type="email" style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.level}</label>
              <select value={form.english_level} onChange={upd('english_level')} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.country}</label><CountrySelect value={form.country} onChange={v=>setForm(f=>({...f,country:v}))}/></div>
            <div><label style={{display:'block',fontSize:'.78rem',fontWeight:600,marginBottom:2}}>{t.admin.users.nativeLanguage}</label><input value={form.native_language} onChange={upd('native_language')} placeholder={t.admin.users.nativeLanguagePlaceholder} style={{width:'100%',padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:'.88rem'}}/></div>
          </div>
          <div style={{display:'flex',gap:'.5rem',marginTop:12}}>
            <button onClick={()=>setShowForm(false)} className="btn-subtle" style={{padding:'8px 16px',fontSize:'.88rem'}}>{t.admin.users.cancel}</button>
            <button onClick={saveUser} disabled={formSaving||!form.username||!form.email} style={{padding:'8px 16px',background:form.username&&form.email?'#4f8ef7':'#ccc',color:'white',border:'none',borderRadius:6,cursor:form.username&&form.email?'pointer':'not-allowed',fontWeight:600,fontSize:'.88rem'}}>{formSaving?t.admin.users.saving:editingUser?t.admin.users.update:t.admin.users.create}</button>
          </div>
        </div>
      )}

      {loading?<p style={{color:'#9ca3af'}}>{searchMode?t.admin.users.searching:t.admin.users.loading}</p>:users.length===0?(
        <p style={{color:'#9ca3af',textAlign:'center'}}>{searchMode?t.admin.users.noResults:t.admin.users.noUsers}</p>
      ):(
        <div className="admin-section">
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead><tr><th>#</th><th>{t.admin.users.usernameHeader}</th><th>{t.admin.users.displayNameHeader}</th><th>{t.admin.users.emailHeader}</th><th>{t.admin.users.countryHeader}</th><th>{t.admin.users.languageHeader}</th><th>{t.admin.users.levelHeader}</th><th>{t.admin.users.fpHeader}</th><th>{t.admin.users.rpHeader}</th><th>{t.admin.users.badgeHeader}</th><th>{t.admin.users.newHeader}</th><th>{t.admin.users.onlineHeader}</th><th>{t.admin.users.statusHeader}</th><th>{t.admin.users.joinedHeader}</th><th>{t.admin.users.actionsHeader}</th></tr></thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={u.id}>
                    <td style={{color:'#94a3b8',fontSize:'.72rem'}}>{searchMode?i+1:page*PAGE+i+1}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.nickname||'—'}</td>
                    <td style={{fontSize:'.78rem',color:'#64748b'}}>{u.email}</td>
                    <td>{u.country?getFlag(u.country)+' '+countryName(u.country):'—'}</td>
                    <td>{u.native_language||'—'}</td>
                    <td style={{textTransform:'capitalize'}}>{u.english_level}</td>
                    <td style={{color:'#1d4ed8',fontWeight:700}}>{u.fp_balance??0}</td>
                    <td style={{color:'#15803d',fontWeight:700}}>{(u.rp_balance||0).toFixed(1)}</td>
                    <td>
                      <button
                        onClick={async()=>{
                          const d=await post('/api/admin/user/'+u.id+'/founding-member',{});
                          if(d.success!==false)setUsers(prev=>prev.map(x=>x.id===u.id?{...x,founding_member_override:d.founding_member_override}:x));
                        }}
                        style={{background:u.founding_member_override?'linear-gradient(135deg,#f59e0b,#f97316)':'#334155',color:'white',border:'none',borderRadius:10,padding:'3px 10px',fontSize:'.72rem',fontWeight:700,cursor:'pointer'}}
                        title={u.founding_member_override?t.admin.users.removeFM:t.admin.users.grantFM}
                      >
                        {u.founding_member_override?t.admin.users.fmBadge:t.admin.users.dash}
                      </button>
                    </td>
                    <td>{u.is_new_member?<span style={{padding:'2px 8px',background:'linear-gradient(135deg,#22c55e,#10b981)',color:'white',borderRadius:8,fontSize:'.68rem',fontWeight:700}}>{t.admin.users.newBadge}</span>:'—'}</td>
                    <td style={{textAlign:'center'}}>{(()=>{
                      const s=statuses[u.id]||'offline';
                      const colors={online:'#22c55e',searching:'#3b82f6',in_call:'#f97316',offline:'#d1d5db'};
                      const labels={online:t.admin.users.onlineStatus,searching:t.admin.users.searchingStatus,in_call:t.admin.users.inCallStatus,offline:t.admin.users.offlineStatus};
                      const pulse=s!=='offline';
                      return<span title={labels[s]} style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:colors[s],...(pulse?{boxShadow:'0 0 6px '+colors[s]}:{})}}/>;
                    })()}</td>
                    <td>{u.is_banned?<span className="badge-pill banned">{t.admin.users.bannedStatus}</span>:u.is_admin?<span className="badge-pill admin">{t.admin.users.adminStatus}</span>:'—'}</td>
                    <td style={{fontSize:'.75rem',color:'#94a3b8'}}>{u.created_at?.slice(0,10)}</td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="act-btn adjust" onClick={()=>loadUserDetail(u.id)} style={{fontSize:'.7rem'}}>{t.admin.users.details}</button>
                        <button onClick={()=>openEdit(u)} style={{background:'#4f8ef7',color:'white',border:'none',borderRadius:6,padding:'3px 8px',fontSize:'.7rem',cursor:'pointer'}} title="Edit">✏️</button>
                        {!u.is_admin?<button onClick={()=>deleteUser(u)} style={{background:'#ef4444',color:'white',border:'none',borderRadius:6,padding:'3px 8px',fontSize:'.7rem',cursor:'pointer'}} title="Delete">🗑️</button>:null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!searchMode&&(
            <div style={{display:'flex',gap:'.5rem',marginTop:'.875rem',justifyContent:'center'}}>
              <button className="act-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>{t.admin.users.prev}</button>
              <span style={{padding:'4px 12px',fontSize:'.83rem',color:'#64748b'}}>{page*PAGE+1}–{Math.min((page+1)*PAGE,total)+' '+t.admin.users.of+' '+total}</span>
              <button className="act-btn" disabled={(page+1)*PAGE>=total} onClick={()=>setPage(p=>p+1)}>{t.admin.users.next}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HealthTab({user,post,stats,t}){
  const[health,setHealth]=useState(null);
  const[usage,setUsage]=useState(null);
  useEffect(()=>{
    post('/api/admin/stats',{}).then(setHealth).catch(()=>{});
    post('/api/admin/usage',{}).then(setUsage).catch(()=>{});
  },[]);

  // Cloudflare free tier limits
  const LIMITS={workers_req:100000,d1_reads:5000000,d1_writes:100000,do_req:1000000,d1_storage:5000,workers_cpu:10};

  const UsageBar=({label,used,limit,unit=''})=>{
    const pct=limit?Math.min(100,(used/limit)*100):0;
    const color=pct>90?'#ef4444':pct>70?'#f59e0b':'#22c55e';
    const fmt=used>=1000000?(used/1000000).toFixed(1)+'M':used>=1000?(used/1000).toFixed(1)+'K':used;
    const fmtLim=limit>=1000000?(limit/1000000).toFixed(0)+'M':limit>=1000?(limit/1000).toFixed(0)+'K':limit;
    return(
      <div style={{marginBottom:'.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.8rem',marginBottom:'4px'}}>
          <span style={{color:'#e2e8f0',fontWeight:600}}>{label}</span>
          <span style={{color:'#94a3b8'}}>{fmt}{unit} / {fmtLim}{unit} ({pct.toFixed(1)}%)</span>
        </div>
        <div style={{height:8,background:'#1e293b',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:4,transition:'width .3s'}}/>
        </div>
      </div>
    );
  };

  return(
    <div>
      {usage?(
        <div className="admin-section">
          <h3>{t.admin.health.infraTitle}</h3>
          <p style={{fontSize:'.78rem',color:'#94a3b8',margin:'0 0 1rem'}}>{t.admin.health.infraDesc}</p>

          <div style={{marginBottom:'1.25rem'}}>
            <h4 style={{fontSize:'.85rem',color:'#e2e8f0',margin:'0 0 .5rem'}}>{t.admin.health.today}</h4>
            <UsageBar label={t.admin.health.workerRequests} used={usage.daily?.api_requests||0} limit={LIMITS.workers_req}/>
            <UsageBar label={t.admin.health.d1RowsRead} used={usage.daily?.d1_reads||0} limit={LIMITS.d1_reads}/>
            <UsageBar label={t.admin.health.d1RowsWritten} used={usage.daily?.d1_writes||0} limit={LIMITS.d1_writes}/>
            <UsageBar label={t.admin.health.durableRequests} used={usage.daily?.do_requests||0} limit={LIMITS.do_req}/>
          </div>

          <div style={{marginBottom:'1.25rem'}}>
            <h4 style={{fontSize:'.85rem',color:'#e2e8f0',margin:'0 0 .5rem'}}>{t.admin.health.thisMonth}</h4>
            <UsageBar label={t.admin.health.workerRequests} used={usage.monthly?.api_requests||0} limit={LIMITS.workers_req*30}/>
            <UsageBar label={t.admin.health.d1RowsRead} used={usage.monthly?.d1_reads||0} limit={LIMITS.d1_reads*30}/>
            <UsageBar label={t.admin.health.d1RowsWritten} used={usage.monthly?.d1_writes||0} limit={LIMITS.d1_writes*30}/>
            <UsageBar label={t.admin.health.durableRequests} used={usage.monthly?.do_requests||0} limit={LIMITS.do_req*30}/>
          </div>

          <div>
            <h4 style={{fontSize:'.85rem',color:'#e2e8f0',margin:'0 0 .5rem'}}>{t.admin.health.storageTitle}</h4>
            <table className="admin-table">
              <tbody>
                <tr><td>{t.admin.health.estimatedD1}</td><td style={{color:'#60a5fa',fontWeight:700}}>{(usage.estimates?.total_rows||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health.freeTier5M}</td></tr>
                <tr><td>{t.admin.health.totalUsers}</td><td style={{fontWeight:700}}>{(usage.estimates?.total_users||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health['~1Row']}</td></tr>
                <tr><td>{t.admin.health.totalSessions}</td><td style={{fontWeight:700}}>{(usage.estimates?.total_sessions||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health['~3-4Rows']}</td></tr>
                <tr><td>{t.admin.health.allTimeWrites}</td><td style={{fontWeight:700}}>{(usage.estimates?.total_d1_writes_all_time||0).toLocaleString()}</td><td style={{color:'#94a3b8'}}>{t.admin.health.limit100K}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      ):<p style={{color:'#9ca3af'}}>{t.admin.health.loadingInfra}</p>}

      <div className="admin-section" style={{marginTop:'1rem'}}>
        <h3>{t.admin.health.systemInfo}</h3>
        <table className="admin-table">
          <tbody>
            <tr><td>{t.admin.health.backend}</td><td>{t.admin.health.backendDesc}</td></tr>
            <tr><td>{t.admin.health.database}</td><td>{t.admin.health.databaseDesc}</td></tr>
            <tr><td>{t.admin.health.signaling}</td><td>{t.admin.health.signalingDesc}</td></tr>
            <tr><td>{t.admin.health.email}</td><td>{t.admin.health.emailDesc}</td></tr>
            <tr><td>{t.admin.health.pointSystem}</td><td>{t.admin.health.pointSystemDesc}</td></tr>
            <tr><td>{t.admin.health.fpPerDay}</td><td>{t.admin.health.fpPerDayDesc}</td></tr>
            <tr><td>{t.admin.health.rpPerCompletion}</td><td>{t.admin.health.rpPerCompletionDesc}</td></tr>
            <tr><td>{t.admin.health.exchangeRate}</td><td>{t.admin.health.exchangeRateDesc}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="admin-section" style={{marginTop:'1rem'}}>
        <h3>{t.admin.health.turnTitle}</h3>
        <table className="admin-table">
          <tbody>
            <tr><td>{t.admin.health.provider}</td><td style={{fontWeight:700}}>metered.ca</td><td style={{color:'#94a3b8'}}>chatter3.metered.live</td></tr>
            <tr><td>{t.admin.health.protocol}</td><td>{t.admin.health.turnProtocol}</td><td style={{color:'#94a3b8'}}>Used for WebRTC relay when P2P fails</td></tr>
            <tr><td>{t.admin.health.freeTier}</td><td>{t.admin.health.bandwidth}</td><td style={{color:'#94a3b8'}}>Exceeding → paid plan required</td></tr>
            <tr><td>{t.admin.health.fallback}</td><td>{t.admin.health.googleStun}</td><td style={{color:'#94a3b8'}}>Used if metered.ca is unreachable</td></tr>
          </tbody>
        </table>
        {usage?.relay?(()=>{
          const tRelay=usage.relay.today_relay||0;
          const tP2P=usage.relay.today_p2p||0;
          const mRelay=usage.relay.month_relay||0;
          const mP2P=usage.relay.month_p2p||0;
          const totalRelay=usage.relay.total_relay||0;
          const totalP2P=usage.relay.total_p2p||0;
          const totalAll=totalRelay+totalP2P;
          const relayPct=totalAll>0?Math.round((totalRelay/totalAll)*100):0;
          const todayAll=tRelay+tP2P;
          const todayPct=todayAll>0?Math.round((tRelay/todayAll)*100):0;
          const monthAll=mRelay+mP2P;
          const monthPct=monthAll>0?Math.round((mRelay/monthAll)*100):0;
          return(
            <div style={{marginTop:'.75rem',background:'#1e293b',borderRadius:8,padding:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
                <h4 style={{margin:0,fontSize:'.85rem',fontWeight:700}}>{t.admin.health.p2pVsTurn}</h4>
                <span style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.p2pDesc}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'.5rem',marginBottom:'.5rem'}}>
                <div style={{textAlign:'center',padding:'8px'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#22c55e'}}>{todayPct}%</div>
                  <div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.todayRelay}</div>
                  <div style={{fontSize:'.65rem',color:'#6b7280'}}>{tRelay}/{todayAll} {t.admin.health.callsUnit}</div>
                </div>
                <div style={{textAlign:'center',padding:'8px'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#60a5fa'}}>{monthPct}%</div>
                  <div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.monthRelay}</div>
                  <div style={{fontSize:'.65rem',color:'#6b7280'}}>{mRelay}/{monthAll} {t.admin.health.callsUnit}</div>
                </div>
                <div style={{textAlign:'center',padding:'8px'}}>
                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#a78bfa'}}>{relayPct}%</div>
                  <div style={{fontSize:'.7rem',color:'#94a3b8'}}>{t.admin.health.allTimeRelay}</div>
                  <div style={{fontSize:'.65rem',color:'#6b7280'}}>{totalRelay}/{totalAll} {t.admin.health.callsUnit}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:'.5rem',alignItems:'center',marginTop:'.5rem'}}>
                <div style={{flex:1,height:8,background:'#334155',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:`${relayPct}%`,height:'100%',background:relayPct>50?'#f59e0b':'#22c55e',borderRadius:4,transition:'width .3s'}}/>
                </div>
                <span style={{fontSize:'.7rem',color:'#94a3b8',whiteSpace:'nowrap'}}>{100-relayPct}% P2P · {relayPct}% TURN</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem',marginTop:'.75rem',fontSize:'.72rem'}}>
                <div style={{background:'#0f172a',borderRadius:6,padding:'8px'}}>
                  <div style={{color:'#22c55e',fontWeight:600,marginBottom:2}}>{t.admin.health.p2pTitle}</div>
                  <div style={{color:'#94a3b8'}}>{t.admin.health.p2pDesc1}</div>
                  <div style={{color:'#6b7280',fontSize:'.65rem'}}>{t.admin.health.p2pDesc2}</div>
                </div>
                <div style={{background:'#0f172a',borderRadius:6,padding:'8px'}}>
                  <div style={{color:'#f59e0b',fontWeight:600,marginBottom:2}}>{t.admin.health.turnTitle2}</div>
                  <div style={{color:'#94a3b8'}}>{t.admin.health.turnDesc1}</div>
                  <div style={{color:'#6b7280',fontSize:'.65rem'}}>{t.admin.health.turnDesc2}</div>
                </div>
              </div>
            </div>
          );
        })():null}
        <p style={{fontSize:'.72rem',color:'#94a3b8',margin:'.5rem 0 0'}}>Note: Actual bandwidth depends on call duration and video quality. Monitor at <a href="https://chatter3.metered.live/dashboard" target="_blank" rel="noopener" style={{color:'#60a5fa'}}>chatter3.metered.live/dashboard</a></p>
      </div>

      {usage&&usage.sessions&&(()=>{
        const avgDur=usage.sessions.avg_duration||300;
        const avgDurMin=Math.round(avgDur/60);
        const avgDurSec=Math.round(avgDur%60);
        const mbPerMin=2.5;
        const mbPerCall=mbPerMin*(avgDur/60);
        // Free tier limits
        const CF_WORKERS_DAY=100000;
        const CF_D1_WRITES_DAY=100000;
        const CF_DO_DAY=1000000;
        const METERED_MONTH_GB=50;
        const MB_PER_GB=1024;
        // Capacity calculations (each session ~10 API calls, ~5 D1 writes, ~100 DO msgs, ~12.5MB TURN)
        const apiCallsPerSession=10;
        const d1WritesPerSession=5;
        const doMsgsPerSession=100;
        const maxSessionsDay_api=Math.floor(CF_WORKERS_DAY/apiCallsPerSession);
        const maxSessionsDay_d1=Math.floor(CF_D1_WRITES_DAY/d1WritesPerSession);
        const maxSessionsDay_do=Math.floor(CF_DO_DAY/doMsgsPerSession);
        const maxCallsMonth_turn=Math.floor((METERED_MONTH_GB*MB_PER_GB)/mbPerCall);
        const maxCallsDay_turn=Math.floor(maxCallsMonth_turn/30);
        const bottleneck=Math.min(maxSessionsDay_api,maxSessionsDay_d1,maxSessionsDay_do,maxCallsDay_turn);
        const bottleneckLabel=bottleneck===maxCallsDay_turn?'TURN Bandwidth':bottleneck===maxSessionsDay_d1?'D1 Writes':bottleneck===maxSessionsDay_api?'Worker Requests':'Durable Objects';
        // Usage percentages
        const todaySessions=usage.sessions.today||0;
        const monthSessions=usage.sessions.this_month||0;
        const apiPct=usage.daily?.api_requests?((usage.daily.api_requests/CF_WORKERS_DAY)*100):0;
        const d1Pct=usage.daily?.d1_writes?((usage.daily.d1_writes/CF_D1_WRITES_DAY)*100):0;
        const doPct=usage.daily?.do_requests?((usage.daily.do_requests/CF_DO_DAY)*100):0;
        const turnPct=usage.monthly?.api_requests?((todaySessions*mbPerCall/MB_PER_GB/METERED_MONTH_GB)*100*30):0;
        return(
          <div className="admin-section" style={{marginTop:'1rem'}}>
            <h3>{t.admin.health.capacityTitle}</h3>
            <p style={{fontSize:'.78rem',color:'#94a3b8',margin:'0 0 .75rem'}}>Max concurrent calls based on current free tier constraints. Current bottleneck: <strong style={{color:'#f59e0b'}}>{bottleneckLabel}</strong></p>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'.5rem',marginBottom:'1rem'}}>
              <div style={{background:'#1e293b',borderRadius:8,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#22c55e'}}>{bottleneck.toLocaleString()}</div>
                <div style={{fontSize:'.72rem',color:'#94a3b8',marginTop:2}}>{t.admin.health.maxSessionsDay}</div>
                <div style={{fontSize:'.65rem',color:'#6b7280',marginTop:2}}>{t.admin.health.maxSessionsDayDesc}</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#60a5fa'}}>{(bottleneck*30).toLocaleString()}</div>
                <div style={{fontSize:'.72rem',color:'#94a3b8',marginTop:2}}>{t.admin.health.maxSessionsMonth}</div>
                <div style={{fontSize:'.65rem',color:'#6b7280',marginTop:2}}>{t.admin.health.maxSessionsMonthDesc}</div>
              </div>
              <div style={{background:'#1e293b',borderRadius:8,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#a78bfa'}}>{Math.round(bottleneck*avgDur/3600)}</div>
                <div style={{fontSize:'.72rem',color:'#94a3b8',marginTop:2}}>{t.admin.health.avgConcurrent}</div>
                <div style={{fontSize:'.65rem',color:'#6b7280',marginTop:2}}>{t.admin.health.avgConcurrentDesc}</div>
              </div>
            </div>

            <UsageBar label={`${t.admin.health.workerRequests} (${usage.daily?.api_requests||0} today)`} used={usage.daily?.api_requests||0} limit={CF_WORKERS_DAY}/>
            <UsageBar label={`${t.admin.health.d1Writes} (${usage.daily?.d1_writes||0} today)`} used={usage.daily?.d1_writes||0} limit={CF_D1_WRITES_DAY}/>
            <UsageBar label={`${t.admin.health.durableObjs} (${usage.daily?.do_requests||0} today)`} used={usage.daily?.do_requests||0} limit={CF_DO_DAY}/>
            <UsageBar label={`${t.admin.health.turnFree} (~${Math.round((usage.relay?.today_relay||0)*mbPerCall)}MB relay today)`} used={(usage.relay?.today_relay||0)*mbPerCall} limit={METERED_MONTH_GB*MB_PER_GB/30}/>

            <table className="admin-table" style={{marginTop:'.75rem'}}>
              <tbody>
                <tr><td style={{fontWeight:600}}>{t.admin.health.avgDuration}</td><td>{avgDurMin}m {avgDurSec}s</td><td style={{color:'#94a3b8'}}>{t.admin.health.avgDurationDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.estMB}</td><td>{mbPerCall.toFixed(1)} MB</td><td style={{color:'#94a3b8'}}>{t.admin.health.estMBDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.turnFree}</td><td>{METERED_MONTH_GB} GB/month</td><td style={{color:'#94a3b8'}}>{t.admin.health.turnFreeDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.cfWorkers}</td><td>{CF_WORKERS_DAY.toLocaleString()}/day</td><td style={{color:'#94a3b8'}}>{t.admin.health.cfWorkersDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.d1Writes}</td><td>{CF_D1_WRITES_DAY.toLocaleString()}/day</td><td style={{color:'#94a3b8'}}>{t.admin.health.d1WritesDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.durableObjs}</td><td>{CF_DO_DAY.toLocaleString()}/day</td><td style={{color:'#94a3b8'}}>{t.admin.health.durableObjsDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.sessionsToday}</td><td style={{fontWeight:700,color:todaySessions>bottleneck?'#ef4444':'#22c55e'}}>{todaySessions}</td><td style={{color:'#94a3b8'}}>{bottleneck>0?((todaySessions/bottleneck)*100).toFixed(1):0}% {t.admin.health.sessionsTodayDesc}</td></tr>
                <tr><td style={{fontWeight:600}}>{t.admin.health.sessionsMonth}</td><td style={{fontWeight:700}}>{monthSessions}</td><td style={{color:'#94a3b8'}}>{Math.round(bottleneck/30)>0?((monthSessions/(bottleneck/30*30))*100).toFixed(1):0}% {t.admin.health.sessionsMonthDesc}</td></tr>
              </tbody>
            </table>
          </div>
        );
      })()}

      <div className="admin-section" style={{marginTop:'1rem'}}>
        <h3>{t.admin.health.launchTitle}</h3>
        <table className="admin-table">
          <tbody>
            <tr><td>{t.admin.health.freeFP}</td><td>New users skip FP consumption for N days after registration (configurable in Settings)</td></tr>
            <tr><td>{t.admin.health.registrationRP}</td><td>RP granted on signup to encourage retention (configurable in Settings)</td></tr>
            <tr><td>{t.admin.health.fmBadge}</td><td>Exclusive badge shown for N days after registration (configurable in Settings)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LANDING PAGES
// ─────────────────────────────────────────────────────────────────
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
.lp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;}
.lp-card{background:white;padding:1.5rem;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.06);text-align:left;}
.lp-card .lp-icon{font-size:2rem;margin-bottom:.75rem;}
.lp-card h3{font-family:'Sora',sans-serif;font-size:1.05rem;font-weight:700;margin:0 0 .5rem;}
.lp-card p{color:#6b7280;font-size:.92rem;line-height:1.6;margin:0;}
.lp-steps{counter-reset:step;}
.lp-step{display:flex;gap:1.25rem;margin-bottom:2rem;align-items:flex-start;}
.lp-step-num{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:white;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-weight:800;font-size:1.1rem;flex-shrink:0;}
.lp-step h3{font-family:'Sora',sans-serif;font-size:1.05rem;font-weight:700;margin:0 0 .4rem;}
.lp-step p{color:#6b7280;font-size:.92rem;line-height:1.6;margin:0;}
.lp-faq{max-width:700px;margin:0 auto;}
.lp-faq-item{border-bottom:1px solid #e5e7eb;padding:1.25rem 0;text-align:left;}
.lp-faq-item h3{font-size:1rem;font-weight:600;margin:0 0 .4rem;cursor:pointer;}
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
  .lp-hero h1,.lp-section h2,.lp-step h3,.lp-card h3{color:#e2e8f0;}
  .lp-hero p,.lp-card p,.lp-step p,.lp-faq-item p{color:#94a3b8;}
  .lp-card{background:#1a1d2e;}
  .lp-faq-item{border-color:#2d3a5c;}
  .lp-cta-bottom{background:#1a1d2e;}
  .lp-footer{background:#0f1117;}
}
@media(max-width:640px){
  .lp-nav-inner{flex-wrap:wrap;gap:.5rem;}
  .lp-nav-links{display:none;}
  .lp-hero h1{font-size:1.8rem;}
  .lp-hero p{font-size:1rem;}
  .lp-step{flex-direction:column;gap:.75rem;}
  .lp-grid{grid-template-columns:1fr;}
}
`;
function HowItWorksPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/how-it-works`;
  return(
    <div className="lp">
      <style>{LP_STYLES}</style>
      <SEOHead title={t.meta.howItWorks.title} description={t.meta.howItWorks.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`} className="active">{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.howItWorks.title}</h1>
        <p>{t.howItWorks.subtitle}</p>
        <a href="/" className="lp-cta">{t.howItWorks.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.howItWorks.stepsTitle}</h2>
        <div className="lp-steps">
          <div className="lp-step"><div className="lp-step-num">1</div><div><h3>{t.howItWorks.step1Title}</h3><p>{t.howItWorks.step1Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">2</div><div><h3>{t.howItWorks.step2Title}</h3><p>{t.howItWorks.step2Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">3</div><div><h3>{t.howItWorks.step3Title}</h3><p>{t.howItWorks.step3Desc}</p></div></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.howItWorks.whyTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">🎯</div><h3>{t.howItWorks.feature1Title}</h3><p>{t.howItWorks.feature1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🌍</div><h3>{t.howItWorks.feature2Title}</h3><p>{t.howItWorks.feature2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">⚡</div><h3>{t.howItWorks.feature3Title}</h3><p>{t.howItWorks.feature3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🏆</div><h3>{t.howItWorks.feature4Title}</h3><p>{t.howItWorks.feature4Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🔒</div><h3>{t.howItWorks.feature5Title}</h3><p>{t.howItWorks.feature5Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💰</div><h3>{t.howItWorks.feature6Title}</h3><p>{t.howItWorks.feature6Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.howItWorks.faqTitle}</h2>
        <div className="lp-faq">
          <div className="lp-faq-item"><h3>{t.howItWorks.faq1Question}</h3><p>{t.howItWorks.faq1Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.howItWorks.faq2Question}</h3><p>{t.howItWorks.faq2Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.howItWorks.faq3Question}</h3><p>{t.howItWorks.faq3Answer}</p></div>
          <div className="lp-faq-item"><h3>{t.howItWorks.faq4Question}</h3><p>{t.howItWorks.faq4Answer}</p></div>
        </div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.howItWorks.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.howItWorks.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.howItWorks.bottomCta}</a>
      </div>
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-links">
            <a href={`${prefix}/`}>{t.nav.home}</a>
            <a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a>
            <a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a>
            <a href={`${prefix}/blog`}>{t.nav.blog}</a>
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

function ForBeginnersPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/for-beginners`;
  return(
    <div className="lp">
      <style>{LP_STYLES}</style>
      <SEOHead title={t.meta.forBeginners.title} description={t.meta.forBeginners.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`} className="active">{t.nav.forBeginners}</a><a href={`${prefix}/blog`}>{t.nav.blog}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.forBeginners.title}</h1>
        <p>{t.forBeginners.subtitle}</p>
        <a href="/" className="lp-cta">{t.forBeginners.cta}</a>
      </div>
      <div className="lp-section">
        <h2>{t.forBeginners.whyTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><div className="lp-icon">🌱</div><h3>{t.forBeginners.feature1Title}</h3><p>{t.forBeginners.feature1Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">⏰</div><h3>{t.forBeginners.feature2Title}</h3><p>{t.forBeginners.feature2Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">🎯</div><h3>{t.forBeginners.feature3Title}</h3><p>{t.forBeginners.feature3Desc}</p></div>
          <div className="lp-card"><div className="lp-icon">💪</div><h3>{t.forBeginners.feature4Title}</h3><p>{t.forBeginners.feature4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.forBeginners.stepsTitle}</h2>
        <div className="lp-steps">
          <div className="lp-step"><div className="lp-step-num">1</div><div><h3>{t.forBeginners.step1Title}</h3><p>{t.forBeginners.step1Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">2</div><div><h3>{t.forBeginners.step2Title}</h3><p>{t.forBeginners.step2Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">3</div><div><h3>{t.forBeginners.step3Title}</h3><p>{t.forBeginners.step3Desc}</p></div></div>
          <div className="lp-step"><div className="lp-step-num">4</div><div><h3>{t.forBeginners.step4Title}</h3><p>{t.forBeginners.step4Desc}</p></div></div>
        </div>
      </div>
      <div className="lp-section">
        <h2>{t.forBeginners.tipsTitle}</h2>
        <div className="lp-grid">
          <div className="lp-card"><h3>{t.forBeginners.tip1Title}</h3><p>{t.forBeginners.tip1Desc}</p></div>
          <div className="lp-card"><h3>{t.forBeginners.tip2Title}</h3><p>{t.forBeginners.tip2Desc}</p></div>
          <div className="lp-card"><h3>{t.forBeginners.tip3Title}</h3><p>{t.forBeginners.tip3Desc}</p></div>
          <div className="lp-card"><h3>{t.forBeginners.tip4Title}</h3><p>{t.forBeginners.tip4Desc}</p></div>
        </div>
      </div>
      <div className="lp-section lp-faq">
        <h2>{t.forBeginners.faqTitle}</h2>
        <div className="lp-faq-item"><h3>{t.forBeginners.faq1Question}</h3><p>{t.forBeginners.faq1Answer}</p></div>
        <div className="lp-faq-item"><h3>{t.forBeginners.faq2Question}</h3><p>{t.forBeginners.faq2Answer}</p></div>
        <div className="lp-faq-item"><h3>{t.forBeginners.faq3Question}</h3><p>{t.forBeginners.faq3Answer}</p></div>
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.forBeginners.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.forBeginners.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.forBeginners.bottomCta}</a>
      </div>
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-links">
            <a href={`${prefix}/`}>{t.nav.home}</a>
            <a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a>
            <a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a>
            <a href={`${prefix}/blog`}>{t.nav.blog}</a>
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

function BlogPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/blog`;
  const articles=[
    {slug:'how-to-improve-english-speaking',title:t.blog.articles.howToImprove.title,excerpt:t.blog.articles.howToImprove.excerpt,date:'2026-01-15',readTime:'5 min',
     content:`<p>Speaking English fluently is a goal for millions of people worldwide. Whether you're preparing for a job interview, traveling abroad, or simply want to connect with more people, improving your English speaking skills is essential. Here are seven proven methods that actually work.</p>
<h2>1. Practice with Real People</h2><p>The most effective way to improve is through real conversation. Apps like Chatter3 connect you with real English learners for 1-on-1 video calls. No scripts, no textbooks — just genuine conversation.</p>
<h2>2. Speak Every Day</h2><p>Consistency beats intensity. Speaking English for 5 minutes every day is better than one hour once a week. Build a daily habit and watch your confidence grow.</p>
<h2>3. Don't Fear Mistakes</h2><p>Every mistake is a learning opportunity. Native speakers make mistakes too! The key is to keep talking and learn from each error.</p>
<h2>4. Shadow Native Speakers</h2><p>Listen to podcasts, watch videos, and repeat what you hear. This technique, called "shadowing," helps you develop natural pronunciation and rhythm.</p>
<h2>5. Learn Phrases, Not Just Words</h2><p>Instead of memorizing individual words, learn common phrases and expressions. "How's it going?" is more useful than knowing the dictionary definition of each word.</p>
<h2>6. Record Yourself</h2><p>Record your voice and listen back. You'll notice pronunciation issues you never heard before. It's uncomfortable but incredibly effective.</p>
<h2>7. Use Technology Wisely</h2><p>Apps like Chatter3 make it easy to find conversation partners anytime, anywhere. Use technology to practice, not just study.</p>
<h2>Start Today</h2><p>The best time to start improving your English speaking is today. Join Chatter3 and have your first conversation in minutes.</p>`},
    {slug:'english-conversation-topics',title:t.blog.articles.conversationTopics.title,excerpt:t.blog.articles.conversationTopics.excerpt,date:'2026-01-10',readTime:'4 min',
     content:`<p>One of the biggest challenges in English practice is knowing what to talk about. Here are 50 conversation topics organized by difficulty level.</p>
<h2>Beginner Topics</h2><ul><li>Tell me about yourself</li><li>What are your hobbies?</li><li>What's the weather like today?</li><li>Describe your family</li><li>What do you do for work?</li><li>What's your favorite food?</li><li>Do you have any pets?</li><li>What time do you usually wake up?</li><li>What did you do yesterday?</li><li>Do you like sports?</li></ul>
<h2>Intermediate Topics</h2><ul><li>What are your goals for this year?</li><li>Describe your dream vacation</li><li>What's the best advice you've ever received?</li><li>How has technology changed your life?</li><li>What would you do with a million dollars?</li><li>Describe your hometown</li><li>What's your favorite movie and why?</li><li>How do you handle stress?</li><li>What are the pros and cons of social media?</li><li>What's the most interesting thing you've learned recently?</li></ul>
<h2>Advanced Topics</h2><ul><li>What impact will AI have on education?</li><li>Should governments regulate social media?</li><li>What are the ethics of genetic engineering?</li><li>How can we solve the climate crisis?</li><li>What does success mean to you?</li></ul>
<h2>Practice Now</h2><p>Pick any topic and find a conversation partner on Chatter3. Real conversation is the fastest way to improve.</p>`},
    {slug:'benefits-of-video-calls-for-language-learning',title:t.blog.articles.videoCallsBenefits.title,excerpt:t.blog.articles.videoCallsBenefits.excerpt,date:'2026-01-05',readTime:'3 min',
     content:`<p>When it comes to language learning, not all practice methods are equal. Video calls offer unique advantages that text chat simply cannot match.</p>
<h2>1. Non-Verbal Communication</h2><p>55% of communication is body language, 38% is tone of voice, and only 7% is words. Video calls let you see and hear your conversation partner, making the interaction more natural and meaningful.</p>
<h2>2. Real-Time Feedback</h2><p>When you make a mistake, your partner can correct you immediately. This instant feedback loop accelerates learning in ways that delayed text corrections can't.</p>
<h2>3. Pronunciation Practice</h2><p>You can hear how words are actually pronounced by real people. Text chat doesn't help you learn the rhythm, stress, and intonation of natural English.</p>
<h2>4. Building Confidence</h2><p>Talking to a real person on video builds confidence faster than typing. It simulates real-world situations like job interviews, meetings, and social events.</p>
<h2>5. Emotional Connection</h2><p>Video calls create genuine human connections. When you care about your conversation partner, you're more motivated to learn and practice.</p>
<h2>Try Video Practice Today</h2><p>Chatter3 makes video practice easy and free. Sign up and start your first conversation in minutes.</p>`}
  ];
  const[expandedArticle,setExpandedArticle]=useState(null);
  return(
    <div className="lp">
      <style>{LP_STYLES}</style>
      <SEOHead title={t.meta.blog.title} description={t.meta.blog.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`} className="active">{t.nav.blog}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.blog.title}</h1>
        <p>{t.blog.subtitle}</p>
      </div>
      <div className="lp-section">
        {expandedArticle!==null?(
          <div>
            <button onClick={()=>setExpandedArticle(null)} style={{background:'none',border:'none',color:'#6366f1',cursor:'pointer',fontSize:'.9rem',marginBottom:'1rem',padding:0}}>{t.blog.backToArticles}</button>
            <h2 style={{fontSize:'1.8rem',fontWeight:800,marginBottom:'.5rem'}}>{articles[expandedArticle].title}</h2>
            <p style={{color:'#6b7280',fontSize:'.85rem',marginBottom:'1.5rem'}}>{articles[expandedArticle].date} · {articles[expandedArticle].readTime} {t.blog.minRead}</p>
            <div dangerouslySetInnerHTML={{__html:articles[expandedArticle].content}} style={{lineHeight:1.8,fontSize:'1.05rem'}}/>
            <div style={{marginTop:'2rem',padding:'1.5rem',background:'#f0fdf4',borderRadius:12,textAlign:'center'}}>
              <h3 style={{margin:'0 0 .5rem'}}>{t.blog.readyToPractice}</h3>
              <p style={{margin:'0 0 1rem',color:'#6b7280'}}>{t.blog.applyLearning}</p>
              <a href="/" style={{display:'inline-block',background:'#6366f1',color:'white',padding:'12px 24px',borderRadius:8,textDecoration:'none',fontWeight:700}}>{t.blog.startFree}</a>
            </div>
          </div>
        ):(
          <div>
            <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:'1.5rem'}}>{t.blog.latestArticles}</h2>
            {articles.map((a,i)=>(
              <div key={i} onClick={()=>setExpandedArticle(i)} style={{background:'white',borderRadius:12,padding:'1.5rem',marginBottom:'1rem',cursor:'pointer',border:'1px solid #e5e7eb',transition:'box-shadow .2s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <h3 style={{margin:'0 0 .5rem',fontSize:'1.2rem',fontWeight:700,color:'#1a1a2e'}}>{a.title}</h3>
                <p style={{margin:'0 0 .5rem',color:'#6b7280',fontSize:'.9rem'}}>{a.excerpt}</p>
                <span style={{color:'#6366f1',fontSize:'.85rem',fontWeight:600}}>{t.blog.readMore}</span>
              </div>
            ))}
          </div>
        )}
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
            <a href={`${prefix}/blog`}>{t.nav.blog}</a>
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────
export default function App(){
  // Detect browser language on first visit (before useTranslation reads localStorage)
  if(!localStorage.getItem('chatter3_lang')) detectLanguage();

  const path=window.location.pathname;
  
  // Language-prefixed landing pages
  const langMatch=path.match(/^\/(es|ja)\/(how-it-works|for-beginners|blog)/);
  if(langMatch){
    const lang=langMatch[1];
    const page=langMatch[2];
    if(page==='how-it-works')return<HowItWorksPage lang={lang}/>;
    if(page==='for-beginners')return<ForBeginnersPage lang={lang}/>;
    if(page==='blog')return<BlogPage lang={lang}/>;
  }
  
  // English landing pages — detect browser language and redirect if needed
  if(path==='/how-it-works'||path==='/for-beginners'||path==='/blog'||path.startsWith('/blog/')){
    const saved=localStorage.getItem('chatter3_lang');
    const lang=saved||detectLanguage();
    if(lang&&lang!=='en'){
      const cleanPath=path.replace(/^\/blog\/.*/, '/blog');
      window.location.href=getLocalizedPath(cleanPath,lang);
      return null;
    }
    if(path==='/how-it-works')return<HowItWorksPage lang="en"/>;
    if(path==='/for-beginners')return<ForBeginnersPage lang="en"/>;
    if(path==='/blog')return<BlogPage lang="en"/>;
    if(path.startsWith('/blog/'))return<BlogPage lang="en"/>;
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
  const{t,lang}=useTranslation();

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

  const checkSession=async(uid)=>{
    try{const r=await authFetch(`${API_URL}/api/matching/session/${uid}`);const d=await r.json();
      if(d.active_session){
        const age=Date.now()-new Date(d.session.created_at).getTime();
        if(age<300000){setSession(d.session);setCallStartedAt(Date.now());setView('video');}
      }}catch{}
  };

  const refreshUser=async(uid)=>{
    try{const r=await authFetch(`${API_URL}/api/user/${uid}`);const d=await r.json();
      if(d.success){const u={...user,...d.user};localStorage.setItem('chatter3_user',JSON.stringify(u));setUser(u);}}catch{}
  };

  const setAndSaveUser=(u)=>{setUser(u);localStorage.setItem('chatter3_user',JSON.stringify(u));};

  const handleLogin=(u)=>{
    setAndSaveUser(u);setView('dashboard');
    if(!localStorage.getItem('chatter3_onboarding_seen'))setShowOnboarding(true);
    else if(u.auth_provider==='google'&&(!u.country||!u.native_language))setShowProfileGate(true);
  };

  const handleLogout=async()=>{
    if(user)try{await authFetch(`${API_URL}/api/matching/leave`,{method:'POST',body:JSON.stringify({})});}catch{}
    localStorage.removeItem('chatter3_user');localStorage.removeItem('chatter3_token');setUser(null);setView('auth');
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
    <ErrorBoundary>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-container">
        <style>{STYLES}</style>
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
              <div><img src="/chatter3_logo.png" alt="Chatter3" className="header-logo-img"/></div>
              {user&&(
                <div className="user-info">
                   <span style={{fontSize:'.88rem'}}>{user.nickname||user.username}{user.founding_member?<span style={{marginLeft:6,padding:'2px 8px',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',borderRadius:10,fontSize:'.68rem',fontWeight:700,letterSpacing:'.03em',verticalAlign:'middle'}}>{t.profile.foundingMember}</span>:null}{user.is_new_member?<span style={{marginLeft:6,padding:'2px 8px',background:'linear-gradient(135deg,#22c55e,#10b981)',color:'white',borderRadius:10,fontSize:'.68rem',fontWeight:700,letterSpacing:'.03em',verticalAlign:'middle'}}>{t.profile.newMember}</span>:null}</span>
                  <div className="header-pts">🎫 {user.fp_balance??0} FP &nbsp;·&nbsp; ⭐ {(user.rp_balance||0).toFixed(1)} RP</div>
                   <button className="header-btn btn-friends" onClick={()=>setShowFriends(true)}>👥 {t.nav.friends||'Friends'}</button>
                   <div className="help-menu-wrapper">
                     <button className="header-btn btn-help" style={{position:'relative'}}>❓ {t.nav.help||'Help'}</button>
                     <div className="help-dropdown">
                       <a href="/how-it-works" target="_blank">📖 {t.nav.howItWorks}</a>
                       <a href="/for-beginners" target="_blank">🌱 {t.nav.forBeginners}</a>
                       <a href="/blog" target="_blank">📝 {t.nav.blog}</a>
                     </div>
                   </div>
                  <LanguageSwitcher currentLang={localStorage.getItem('chatter3_lang')||'en'}/>
                  {user.is_admin?<button className="header-btn btn-admin" onClick={()=>setView('admin')}>⚙ {t.admin.badge}</button>:null}
                  <button className="header-btn btn-logout" onClick={handleLogout}>{t.nav.logout||'Logout'}</button>
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
          {view==='admin'&&user&&user.is_admin?<AdminDashboard user={user} onBack={()=>setView('dashboard')} t={getTranslations('en')}/>:null}
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
      <div style={{position:'absolute',top:16,right:16,zIndex:10}}>
        <LanguageSwitcher currentLang={lang}/>
      </div>
      <div className="auth-box">
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
            <div className="form-group"><label>{t.auth.email}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
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
      <div style={{position:'absolute',top:16,right:16,zIndex:10}}>
        <LanguageSwitcher currentLang={lang}/>
      </div>
      <div className="auth-box">
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
            <div className="form-group"><label>{t.resetPassword.newPassword}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/></div>
            <div className="form-group"><label>{t.resetPassword.confirmPassword}</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={6}/></div>
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
  const[form,setForm]=useState({email:'',password:'',username:'',english_level:'beginner',country:'',native_language:''});
  const[err,setErr]=useState('');
  const[turnstileToken,setTurnstileToken]=useState('');
  const refParam=new URLSearchParams(window.location.search).get('ref')||'';
  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const submit=async(e)=>{
    e.preventDefault();
    if(reg&&!terms){setErr(t.auth.termsError);return;}
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
      const r=await fetch(`${API_URL}/api/auth/google`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:cr.credential,...(refParam?{ref:refParam}:{})})});
      const d=await r.json();
      if(d.success){if(d.token)localStorage.setItem('chatter3_token',d.token);onLogin(d.user);}else setErr(d.detail||d.error||t.auth.googleError);
    }catch{setErr(t.auth.networkError);}finally{setLoading(false);}
  };

  return(
    <div className="auth-container">
      <div style={{position:'absolute',top:16,right:16,zIndex:10}}>
        <LanguageSwitcher currentLang={lang}/>
      </div>
      <div className="auth-box">
        <div className="auth-header">
          <img src="/chatter3_logo.png" alt="Chatter3" className="auth-logo"/>
          <p className="auth-subtitle">{t.auth.subtitle}</p>
        </div>
        {err&&<div className="error-message">{err}</div>}
        <form onSubmit={submit} className="register-form">
          {reg&&<>
            <div className="form-group"><label>{t.auth.username}</label><input value={form.username} onChange={upd('username')} required/></div>
            <div className="form-group"><label>{t.auth.country}</label><CountrySelect value={form.country} onChange={v=>setForm(f=>({...f,country:v}))} required/></div>
            <div className="form-group"><label>{t.auth.nativeLanguage}</label><input value={form.native_language} onChange={upd('native_language')} required placeholder={t.auth.nativeLanguagePlaceholder}/></div>
            <div className="form-group"><label>{t.auth.level}</label>
              <select value={form.english_level} onChange={upd('english_level')}>
                <option value="beginner">{t.auth.beginner}</option><option value="intermediate">{t.auth.intermediate}</option><option value="advanced">{t.auth.advanced}</option>
              </select>
            </div>
          </>}
          <div className="form-group"><label>{t.auth.email}</label><input type="email" value={form.email} onChange={upd('email')} required/></div>
          <div className="form-group"><label>{t.auth.password}</label><input type="password" value={form.password} onChange={upd('password')} required minLength={6}/></div>
          {!reg&&<div style={{textAlign:'right',marginTop:'-8px',marginBottom:'8px'}}><button type="button" className="auth-link" onClick={()=>setView('forgot')} style={{background:'none',border:'none',color:'#4f46e5',fontSize:'.82rem',cursor:'pointer',padding:0}}>{t.auth.forgotPassword}</button></div>}
          {reg&&(
            <div className="terms-row">
              <input type="checkbox" id="terms" checked={terms} onChange={e=>setTerms(e.target.checked)}/>
              <label htmlFor="terms">{t.auth.terms}</label>
            </div>
          )}
          <TurnstileWidget onVerify={setTurnstileToken} onExpire={()=>setTurnstileToken('')}/>
          <button type="submit" disabled={loading||(reg&&!terms)} style={{opacity:reg&&!terms?0.55:1,cursor:reg&&!terms?'not-allowed':'pointer'}}>
            {loading?t.auth.loading:reg?t.auth.createAccount:t.auth.signIn}
          </button>
        </form>
        <div className="auth-divider">{t.auth.or}</div>
        <div className="google-button-container">
          <GoogleLogin onSuccess={googleSuccess} onError={()=>setErr(t.auth.googleError)}/>
        </div>
        <button className="auth-link" onClick={()=>{setReg(v=>!v);setErr('');setTerms(false);}}>
          {reg?t.auth.hasAccount:t.auth.noAccount}
        </button>
      </div>
      <div className="auth-footer">
        <div className="auth-footer-links">
          <a href="/how-it-works">{t.nav.howItWorks}</a>
          <a href="/for-beginners">{t.nav.forBeginners}</a>
          <a href="/blog">{t.nav.blog}</a>
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
            const isMe=entry.username===userId;
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
function DashboardView({user,settings,onNavigate,onFindPartner,onExchange,onRefreshUser,t}){
  const[online,setOnline]=useState({searching:0,in_call:0,total:0,by_level:{}});
  const[balances,setBalances]=useState({fp:user.fp_balance??0,rp:user.rp_balance??0});
  const isFreePeriod=!!user.in_free_period;
  const canCall=balances.fp>=1||isFreePeriod;

  useEffect(()=>{
    fetch(`${API_URL}/api/stats/online`).then(r=>r.json()).then(setOnline).catch(()=>{});
    fetch(`${API_URL}/api/user/balances/${user.id}`).then(r=>r.json()).then(d=>{
      if(d.success){setBalances({fp:d.fp,rp:d.rp});if(d.fp!==user.fp_balance||d.rp!==user.rp_balance)onRefreshUser();}
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

      {/* Leaderboard */}
      <LeaderboardCard userId={user.id} t={t}/>
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
      try{
        if(!matched){
          const r=await authFetch(`${API_URL}/api/matching/join`,{method:'POST',body:JSON.stringify({english_level:user.english_level,country:user.country,native_language:(user.native_language||'').trim().toLowerCase()})});
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
  const partner=session.partner||{};
  const name=partner.nickname||partner.username||t.precall.yourPartner;
  const starters=getStarters(t);
  const tip=starters[Math.floor(Math.random()*starters.length)](name);
  const LEVEL={beginner:t.auth.beginner,intermediate:t.auth.intermediate,advanced:t.auth.advanced};
  useEffect(()=>{playSound('match');},[]);
  useEffect(()=>{if(cd<=0){onStart();return;}const t=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(t);},[cd]);
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
            {partner.avatar_url?<img src={partner.avatar_url} alt={name}/>:<span style={{fontFamily:'Sora,sans-serif',fontSize:'2.2rem',fontWeight:800,color:'white'}}>{name.charAt(0).toUpperCase()}</span>}
          </div>
        </div>
        <h2 className="precall-name">{name}{partner.founding_member?<span style={{display:'block',marginTop:4,fontSize:'.7rem',fontWeight:600,color:'#fbbf24',letterSpacing:'.03em'}}>{t.precall.foundingMember}</span>:null}{partner.is_new_member?<span style={{display:'block',marginTop:4,fontSize:'.7rem',fontWeight:600,color:'#22c55e',letterSpacing:'.03em'}}>{t.precall.newMember}</span>:null}</h2>
        <div className="precall-chips">
          {partner.country&&<span className="chip country">{getFlag(partner.country)} {countryName(partner.country)}</span>}
          {partner.native_language&&<span className="chip lang">🗣️ {partner.native_language}</span>}
          {partner.english_level&&<span className="chip level">{LEVEL[partner.english_level]||partner.english_level}</span>}
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
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:16}}>
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
  const lv=useRef(null),rv=useRef(null),pc=useRef(null),ws=useRef(null);
  const remStream=useRef(null),lcQ=useRef([]),rcQ=useRef([]),negRef=useRef(false),streamRef=useRef(null);
  const discTimer=useRef(null),autoTimer=useRef(null);
  const hasConnected=useRef(false);
  const partnerReconnectTimer=useRef(null);
  const connTimeout=useRef(null);
  const intentionalHangup=useRef(false);
  const partnerHungUp=useRef(false);
  const usedRelay=useRef(false);

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
            authFetch(`${API_URL}/api/matching/refund-fp`,{method:'POST',body:JSON.stringify({session_id:session.id})}).catch(()=>{});
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
            authFetch(`${API_URL}/api/matching/refund-fp`,{method:'POST',body:JSON.stringify({session_id:session.id})}).catch(()=>{});
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
              authFetch(`${API_URL}/api/matching/refund-fp`,{method:'POST',body:JSON.stringify({session_id:session.id})}).catch(()=>{});
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
      }catch{setErr('Could not access camera/microphone');}
    };
    const logConn=(event_type,event_data)=>{
      authFetch(`${API_URL}/api/connection/event`,{method:'POST',body:JSON.stringify({session_id:session.id,event_type,event_data,user_agent:navigator.userAgent})}).catch(()=>{});
    };
    const flushRC=async()=>{if(!pc.current)return;while(rcQ.current.length>0)try{await pc.current.addIceCandidate(rcQ.current.shift());}catch{}};
    const beforeUnload=()=>{ws.current?.readyState===1&&ws.current.send(JSON.stringify({type:'bye'}));};
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
    return()=>{clearInterval(timer);clearTimeout(discTimer.current);clearTimeout(autoTimer.current);clearTimeout(partnerReconnectTimer.current);clearTimeout(connTimeout.current);window.removeEventListener('beforeunload',beforeUnload);};
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
                <button onClick={()=>{const streakTxt=shareData.streak>1?(t.video.shareMessageStreak||' 🔥{streak} day streak!').replace('{streak}',shareData.streak):'';const msg=(t.video.shareMessage||'🎉 I just practiced English for {duration} min on Chatter3!{streak} Join me: https://app.chatter3.com').replace('{duration}',Math.floor(shareData.duration/60)).replace('{streak}',streakTxt);navigator.share?navigator.share({title:'Chatter3',text:msg,url:'https://app.chatter3.com'}):navigator.clipboard.writeText(msg).then(()=>alert(t.video.copied));}} style={{background:'white',color:'#6366f1',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:'.8rem',cursor:'pointer'}}>{t.video.share}</button>
                <button onClick={()=>{const streakTxt=shareData.streak>1?(t.video.shareMessageStreak||' 🔥{streak} day streak!').replace('{streak}',shareData.streak):'';const msg=(t.video.shareMessage||'🎉 I just practiced English for {duration} min on Chatter3!{streak} Join me: https://app.chatter3.com').replace('{duration}',Math.floor(shareData.duration/60)).replace('{streak}',streakTxt);navigator.clipboard.writeText(msg).then(()=>alert(t.video.copied));}} style={{background:'rgba(255,255,255,.15)',color:'white',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,padding:'8px 16px',fontWeight:600,fontSize:'.8rem',cursor:'pointer'}}>{t.video.copy}</button>
              </div>
              <button onClick={()=>{setShowShareCard(false);onEnd();}} style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',marginTop:'.75rem',cursor:'pointer',fontSize:'.8rem'}}>{t.video.skip}</button>
            </div>
          </div>
        )}
      </div>
      {!showRating&&(
        <div className="call-controls">
          <div>
            <p style={{fontSize:'.82rem',color:'#999',margin:0}}>{t.video.talkingTo}</p>
            <p style={{fontWeight:700,fontSize:'1rem',margin:0}}>{session.partner?.username}</p>
            {session.partner?.country&&<p style={{fontSize:'.78rem',color:'#6b7280',margin:'1px 0 0'}}>{getFlag(session.partner.country)} {countryName(session.partner.country)}</p>}
            <button className="report-btn" onClick={()=>setShowReport(true)}>{t.video.report}</button>
          </div>
          <button onClick={hangup} className="control-btn-end"><PhoneOff style={{width:17,height:17}}/> {t.video.endCall}</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PROFILE VIEW
// ─────────────────────────────────────────────────────────────────
function ProfileView({user,onBack,onUpdate,onShowOnboarding,t}){
  const[form,setForm]=useState({username:user.username||'',nickname:user.nickname||'',country:user.country||'',native_language:user.native_language||'',english_level:user.english_level||'beginner',bio:user.bio||'',avatar_url:user.avatar_url||''});
  const[history,setHistory]=useState([]);
  const[showFeedback,setShowFeedback]=useState(false);
  const[showPwChange,setShowPwChange]=useState(false);
  const[pwForm,setPwForm]=useState({current_password:'',new_password:'',confirm_password:''});
  const[pwErr,setPwErr]=useState('');
  const[pwMsg,setPwMsg]=useState('');
  const fileRef=useRef(null);
  useEffect(()=>{
    authFetch(`${API_URL}/api/user/history`,{method:'POST',body:JSON.stringify({})}).then(r=>r.json()).then(d=>{if(d.success)setHistory(d.history);});
  },[]);
  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const onFile=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();const rd=new FileReader();rd.onload=ev=>{img.onload=()=>{const M=800;let{width:w,height:h}=img;if(w>M||h>M){const r=Math.min(M/w,M/h);w=Math.round(w*r);h=Math.round(h*r);}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);setForm(p=>({...p,avatar_url:c.toDataURL('image/jpeg',.75)}));};img.src=ev.target.result;};rd.readAsDataURL(f);};
  const save=async()=>{const r=await authFetch(`${API_URL}/api/user/update`,{method:'POST',body:JSON.stringify({...form})});const d=await r.json();if(d.success){const u={...user,...d.user};localStorage.setItem('chatter3_user',JSON.stringify(u));onUpdate(u);alert(t.profile.profileSaved);}};
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
      <div style={{textAlign:'center',marginBottom:'1.25rem'}}><h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.3rem',fontWeight:800,margin:0}}>{t.profile.editProfile}</h2>{user.founding_member?<span style={{display:'inline-block',marginTop:6,padding:'3px 10px',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'white',borderRadius:10,fontSize:'.72rem',fontWeight:700,letterSpacing:'.03em'}}>{t.profile.foundingMember}</span>:null}{user.is_new_member?<span style={{display:'inline-block',marginTop:6,marginLeft:6,padding:'3px 10px',background:'linear-gradient(135deg,#22c55e,#10b981)',color:'white',borderRadius:10,fontSize:'.72rem',fontWeight:700,letterSpacing:'.03em'}}>{t.profile.newMember}</span>:null}</div>
      <div className="profile-section">
        <div className="profile-avatar">
          {form.avatar_url?<img src={form.avatar_url} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} alt={t.profile.profileAlt}/>:(form.username||user.username).charAt(0).toUpperCase()}
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
        <button className="save-btn" onClick={save}>{t.profile.saveProfile}</button>
        {user.auth_provider!=='google'&&<>
        <button onClick={()=>{setShowPwChange(!showPwChange);setPwErr('');setPwMsg('');}} className="btn-accent-outline">&#x1f512; {user.has_password?t.profile.changePassword:t.profile.setPassword}</button>
        {showPwChange&&(
           <div className="pw-box">
            <div style={{fontWeight:600,fontSize:'.85rem',marginBottom:8}}>{user.has_password?t.profile.changePasswordTitle:t.profile.setPasswordTitle}</div>
            {pwErr&&<div style={{color:'#ef4444',fontSize:'.8rem',marginBottom:6}}>{pwErr}</div>}
            {pwMsg&&<div style={{color:'#22c55e',fontSize:'.8rem',marginBottom:6}}>{pwMsg}</div>}
            {user.has_password&&<div className="form-group"><label>{t.profile.currentPassword}</label><input type="password" value={pwForm.current_password} onChange={e=>setPwForm(f=>({...f,current_password:e.target.value}))}/></div>}
            <div className="form-group"><label>{t.profile.newPassword}</label><input type="password" value={pwForm.new_password} onChange={e=>setPwForm(f=>({...f,new_password:e.target.value}))} minLength={6}/></div>
            <div className="form-group"><label>{t.profile.confirmPassword}</label><input type="password" value={pwForm.confirm_password} onChange={e=>setPwForm(f=>({...f,confirm_password:e.target.value}))} minLength={6}/></div>
            <button className="save-btn" onClick={changePassword} style={{width:'100%'}}>{user.has_password?t.profile.updatePassword:t.profile.setPasswordBtn}</button>
          </div>
        )}
        </>}
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
      <div className="history-list">
        <h3 style={{fontFamily:'Sora,sans-serif',fontSize:'.95rem',margin:'0 0 .875rem'}}>{t.profile.recentConversations}</h3>
        {history.length===0&&<p style={{color:'#9ca3af',fontSize:'.88rem'}}>{t.profile.noCalls}</p>}
        {history.map(h=>(
          <div key={h.id} className="history-item">
            <div className="history-avatar">
              {h.partner_avatar?<img src={h.partner_avatar} style={{width:'100%',height:'100%',borderRadius:'50%'}} alt=""/>:(h.partner_name||'?').charAt(0).toUpperCase()}
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

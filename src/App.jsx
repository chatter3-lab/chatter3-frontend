import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const API_URL = 'https://api.chatter3.com';
const WS_URL = 'wss://api.chatter3.com';
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";
const RP_TO_FP = 3; // 3 RP → 1 FP
const MATCH_TIMEOUT = 90;

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
const FLAGS={'japan':'🇯🇵','korea':'🇰🇷','south korea':'🇰🇷','china':'🇨🇳','united states':'🇺🇸','usa':'🇺🇸','us':'🇺🇸','america':'🇺🇸','brazil':'🇧🇷','mexico':'🇲🇽','germany':'🇩🇪','france':'🇫🇷','spain':'🇪🇸','italy':'🇮🇹','india':'🇮🇳','indonesia':'🇮🇩','vietnam':'🇻🇳','thailand':'🇹🇭','philippines':'🇵🇭','taiwan':'🇹🇼','russia':'🇷🇺','turkey':'🇹🇷','portugal':'🇵🇹','colombia':'🇨🇴','argentina':'🇦🇷','bangladesh':'🇧🇩','pakistan':'🇵🇰','egypt':'🇪🇬','nigeria':'🇳🇬','saudi arabia':'🇸🇦','uae':'🇦🇪','canada':'🇨🇦','australia':'🇦🇺','uk':'🇬🇧','united kingdom':'🇬🇧','netherlands':'🇳🇱','poland':'🇵🇱','sweden':'🇸🇪','norway':'🇳🇴','denmark':'🇩🇰','finland':'🇫🇮','switzerland':'🇨🇭','austria':'🇦🇹','belgium':'🇧🇪','greece':'🇬🇷','ukraine':'🇺🇦','malaysia':'🇲🇾','singapore':'🇸🇬','hong kong':'🇭🇰','peru':'🇵🇪','chile':'🇨🇱','venezuela':'🇻🇪','morocco':'🇲🇦','kenya':'🇰🇪','ethiopia':'🇪🇹','ghana':'🇬🇭','iran':'🇮🇷','iraq':'🇮🇶','israel':'🇮🇱','nepal':'🇳🇵','sri lanka':'🇱🇰','myanmar':'🇲🇲','cambodia':'🇰🇭'};
const ALIASES={'japon':'japan','jpn':'japan','jp':'japan','brasil':'brazil','deutschland':'germany','allemagne':'germany','españa':'spain','espana':'spain','italia':'italy','türkiye':'turkey','turkiye':'turkey','pilipinas':'philippines','filipinas':'philippines','viet nam':'vietnam','việt nam':'vietnam','estados unidos':'united states','eeuu':'united states','u.s.a':'united states','u.k':'uk','great britain':'uk','england':'uk','britain':'uk','nederland':'netherlands','holland':'netherlands','österreich':'austria','osterreich':'austria','polska':'poland','hellas':'greece','grecia':'greece','україна':'ukraine','marokko':'morocco','maroc':'morocco','burma':'myanmar'};
const normalizeCountry=(r)=>{if(!r)return '';const s=r.trim().toLowerCase().replace(/\s+/g,' ');return ALIASES[s]||FLAGS[s]&&s||(Object.keys(FLAGS).find(k=>k.startsWith(s)||s.startsWith(k)))||s;};
const getFlag=(c)=>FLAGS[normalizeCountry(c)]||'🌍';

// ── Conversation starters ────────────────────────────────────
const STARTERS=[(p)=>`Ask ${p} what the most popular food is in their country!`,(p)=>`Ask ${p} what music or shows are trending where they live!`,(p)=>`Ask ${p} what they enjoy doing on weekends!`,(p)=>`Ask ${p} what made them want to learn English!`,(p)=>`Ask ${p} to describe something unique about their hometown!`];

// ── Onboarding slides ────────────────────────────────────────
const SLIDES=[
  {id:1,emoji:'🌐',color:'#4f8ef7',tag:'CONNECT',headline:'Connect with real people, instantly.',body:'Get matched 1-on-1 with learners around the world. No scheduling. No profiles to browse.'},
  {id:2,emoji:'🗣️',color:'#7c3aed',tag:'SPEAK',headline:"Just speak. That is how you learn.",body:'Short, real conversations build real confidence. No lessons. No teachers. Just practice.'},
  {id:3,emoji:'⭐',color:'#059669',tag:'EARN',headline:'Your conversations earn value.',body:'Complete conversations to earn Reward Points. Exchange them for more call time.',note:'Currently, Chatter3 uses standard in-app points during the beta phase. In the future, these points may transition to a Web3-based token called C3T (Chatter3 Token).'},
];

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const STYLES=`
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
*{box-sizing:border-box;}
body,html{margin:0;padding:0;width:100%;font-family:'DM Sans',-apple-system,sans-serif;background:#f5f5f5;}
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

/* Auth */
.auth-container{display:flex;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:1rem;}
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
.video-call-interface{display:flex;flex-direction:column;height:calc(100vh - 44px);gap:.75rem;padding:.75rem;position:relative;}
.video-container{position:relative;flex:1;background:#1a1a1a;border-radius:12px;overflow:hidden;display:flex;justify-content:center;align-items:center;min-height:0;}
.video-el{width:100%;height:100%;object-fit:cover;}
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
.rating-buttons{display:flex;gap:.875rem;margin-top:1.75rem;}
.rating-btn{padding:.875rem 1.75rem;font-size:1.1rem;border-radius:8px;border:none;cursor:pointer;transition:transform .2s;}
.rating-btn.good{background:#10b981;color:white;}
.rating-btn.meh{background:#6b7280;color:white;}
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
.act-btn.ban{border-color:#fca5a5;color:#ef4444;}
.act-btn.unban{border-color:#bbf7d0;color:#10b981;}
.act-btn.adjust{border-color:#c7d7fc;color:#4f46e5;}
.act-btn.dismiss{border-color:#e2e8f0;color:#64748b;}
.act-btn.action{border-color:#fca5a5;color:#ef4444;}
.act-btn:hover{opacity:.8;}
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
`;

// ── Icon ───────────────────────────────────────────────────────
const Ico=({d,style})=><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',...style}}><path d={d}/></svg>;
const PhoneOff=({style})=><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',...style}}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>;
const UploadIcon=({style})=><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',...style}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

// ── Onboarding ──────────────────────────────────────────────────
function OnboardingSlider({onComplete}){
  const[cur,setCur]=useState(0);
  const stars=useRef(Array.from({length:36},(_,i)=>({id:i,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,delay:`${Math.random()*3}s`,sz:Math.random()>.7?3:2}))).current;
  const s=SLIDES[cur];
  const isLast=cur===SLIDES.length-1;
  return(
    <div className="onboarding-overlay">
      <div className="ob-bg"/>
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        {stars.map(st=><div key={st.id} className="ob-star" style={{top:st.top,left:st.left,animationDelay:st.delay,width:st.sz,height:st.sz}}/>)}
      </div>
      <button className="ob-skip" onClick={onComplete}>Skip</button>
      <div className="ob-card">
        <div className="ob-logo"><img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Chatter3"/></div>
        <div className="slides-wrapper">
          <div className="slides-track" style={{transform:`translateX(-${cur*100}%)`}}>
            {SLIDES.map(sl=>(
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
          {SLIDES.map((sl,i)=><button key={sl.id} className={`ob-dot ${i===cur?'active':''}`} style={{width:i===cur?22:5}} onClick={()=>setCur(i)}/>)}
        </div>
        <button className="ob-cta" onClick={()=>cur<SLIDES.length-1?setCur(cur+1):onComplete()} style={{background:`linear-gradient(135deg,${s.color},${s.color}cc)`,color:'white',boxShadow:`0 4px 18px ${s.color}55`}}>
          {isLast?'🚀 Start Talking':'Next →'}
        </button>
      </div>
    </div>
  );
}

// ── Profile Gate ────────────────────────────────────────────────
function ProfileGate({user,onComplete,onDismiss}){
  const[country,setCountry]=useState(user.country||'');
  const[lang,setLang]=useState(user.native_language||'');
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState('');
  const save=async()=>{
    if(!country.trim()||!lang.trim()){setErr('Both fields are required.');return;}
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${API_URL}/api/user/update`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user.id,nickname:user.nickname,english_level:user.english_level,bio:user.bio,avatar_url:user.avatar_url,country:country.trim(),native_language:lang.trim()})});
      const d=await r.json();
      if(d.success){const u={...user,country:country.trim(),native_language:lang.trim()};localStorage.setItem('chatter3_user',JSON.stringify(u));onComplete(u);}
      else setErr('Failed to save.');
    }catch{setErr('Network error.');}finally{setLoading(false);}
  };
  return(
    <div className="profile-gate-overlay">
      <div className="profile-gate-card">
        <div style={{fontSize:'2.75rem',marginBottom:'.75rem'}}>🌍</div>
        <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.25rem',fontWeight:800,color:'#1a1a2e',margin:'0 0 .4rem'}}>One quick thing…</h2>
        <p style={{color:'#6b7280',fontSize:'.88rem',marginBottom:'1.25rem',lineHeight:1.5}}>Tell us where you're from and your native language — we use this to find you better conversation partners.</p>
        {err&&<div className="error-message">{err}</div>}
        <input className="profile-gate-input" placeholder="Country of origin (e.g. Japan)" value={country} onChange={e=>setCountry(e.target.value)}/>
        <input className="profile-gate-input" placeholder="Native language (e.g. Japanese)" value={lang} onChange={e=>setLang(e.target.value)}/>
        <button className="profile-gate-submit" onClick={save} disabled={loading}>{loading?'Saving…':'Save & Find a Partner →'}</button>
        <button onClick={onDismiss} style={{marginTop:'.6rem',background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'.82rem'}}>Maybe later</button>
      </div>
    </div>
  );
}

// ── RP→FP Exchange Modal ────────────────────────────────────────
function ExchangeModal({user,onClose,onDone}){
  const[qty,setQty]=useState(1);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState('');
  const cost=qty*RP_TO_FP;
  const canAfford=(user.rp_balance||0)>=cost;
  const exchange=async()=>{
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${API_URL}/api/user/exchange-rp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,quantity:qty})});
      const d=await r.json();
      if(d.success)onDone(d.fp,d.rp);
      else setErr(d.error||'Exchange failed.');
    }catch{setErr('Network error.');}finally{setLoading(false);}
  };
  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-icon">🔄</div>
        <h2>Exchange RP for FP</h2>
        <p>Use your Reward Points to get more call time.<br/><strong>{RP_TO_FP} RP = 1 FP</strong> (5 minutes)</p>
        <div style={{background:'#f8fafc',borderRadius:10,padding:'1rem',marginBottom:'1rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',textAlign:'center'}}>
          <div><div style={{fontSize:'1.5rem',fontWeight:800,color:'#15803d',fontFamily:'Sora,sans-serif'}}>{(user.rp_balance||0).toFixed(1)}</div><div style={{fontSize:'.72rem',color:'#9ca3af'}}>RP Balance</div></div>
          <div><div style={{fontSize:'1.5rem',fontWeight:800,color:'#1d4ed8',fontFamily:'Sora,sans-serif'}}>{user.fp_balance||0}</div><div style={{fontSize:'.72rem',color:'#9ca3af'}}>FP Balance</div></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'.875rem',justifyContent:'center'}}>
          <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:34,height:34,borderRadius:'50%',border:'1.5px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:'Sora,sans-serif',fontSize:'1.4rem',fontWeight:800,color:'#1a1a2e'}}>{qty} FP</div>
            <div style={{fontSize:'.75rem',color:'#9ca3af'}}>costs {cost} RP</div>
          </div>
          <button onClick={()=>setQty(qty+1)} style={{width:34,height:34,borderRadius:'50%',border:'1.5px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
        </div>
        {err&&<div className="error-message">{err}</div>}
        <button className="modal-btn-primary" onClick={exchange} disabled={loading||!canAfford}>
          {loading?'Processing…':canAfford?`Exchange ${cost} RP → ${qty} FP`:`Not enough RP (need ${cost})`}
        </button>
        <button className="modal-btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ── Report Modal ────────────────────────────────────────────────
const REPORT_REASONS=['Inappropriate or offensive language','Harassment or bullying','Spam or scam behavior','Explicit or adult content','Impersonation','Other'];
function ReportModal({targetUser,sessionId,reporterUserId,onClose}){
  const[reason,setReason]=useState('');
  const[submitting,setSubmitting]=useState(false);
  const[done,setDone]=useState(null);
  const submit=async(action)=>{
    if(action!=='block'&&!reason)return;
    setSubmitting(true);
    try{
      if(action==='report'||action==='both')await fetch(`${API_URL}/api/report`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reporter_id:reporterUserId,reported_id:targetUser.id,session_id:sessionId,reason})});
      if(action==='block'||action==='both')await fetch(`${API_URL}/api/block`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({blocker_id:reporterUserId,blocked_id:targetUser.id})});
      setDone(action);
    }catch{setDone(action);}finally{setSubmitting(false);}
  };
  const name=targetUser?.nickname||targetUser?.username||'this user';
  if(done)return(
    <div className="report-overlay" onClick={onClose}>
      <div className="report-card" onClick={e=>e.stopPropagation()}>
        <div className="report-success"><div className="report-success-icon">✅</div>
          <h3 style={{fontFamily:'Sora,sans-serif'}}>{done==='block'?`${name} blocked.`:done==='both'?`${name} reported & blocked.`:'Report submitted.'}</h3>
          <p style={{color:'#6b7280',fontSize:'.83rem',marginTop:'.4rem'}}>{done==='block'?"You won't be matched again.":'Our team will review this. Thank you.'}</p>
          <button className="modal-btn-primary" style={{marginTop:'1rem'}} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
  return(
    <div className="report-overlay" onClick={onClose}>
      <div className="report-card" onClick={e=>e.stopPropagation()}>
        <h3>Report or Block</h3>
        <p>Reporting {name}. Select a reason, then choose an action.</p>
        {REPORT_REASONS.map(r=><button key={r} className={`reason-btn ${reason===r?'sel':''}`} onClick={()=>setReason(r)}>{r}</button>)}
        <div className="report-actions">
          <button className="report-action-btn block" disabled={!reason||submitting} onClick={()=>submit('block')}>🚫 Block</button>
          <button className="report-action-btn report" disabled={!reason||submitting} onClick={()=>submit('both')}>⚑ Report & Block</button>
        </div>
        <button className="report-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ── Admin Dashboard ─────────────────────────────────────────────
function AdminDashboard({user,onBack}){
  const[tab,setTab]=useState('analytics');
  const[stats,setStats]=useState(null);
  const[users,setUsers]=useState([]);
  const[reports,setReports]=useState([]);
  const[searchQ,setSearchQ]=useState('');
  const[reportFilter,setReportFilter]=useState('pending');
  const[loading,setLoading]=useState(false);
  const[selectedUser,setSelectedUser]=useState(null);
  const[adjustFP,setAdjustFP]=useState('');
  const[adjustRP,setAdjustRP]=useState('');
  const[banReason,setBanReason]=useState('');

  const post=(path,body)=>fetch(`${API_URL}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({admin_id:user.id,...body})}).then(r=>r.json());

  useEffect(()=>{
    if(tab==='analytics'){
      setLoading(true);
      post('/api/admin/stats',{}).then(d=>{setStats(d);setLoading(false);}).catch(()=>setLoading(false));
    }
  },[tab]);

  const searchUsers=async()=>{
    setLoading(true);
    const d=await post('/api/admin/users',{query:searchQ});
    setUsers(d.users||[]);setLoading(false);
  };

  const loadReports=async()=>{
    setLoading(true);
    const d=await post('/api/admin/reports',{status:reportFilter});
    setReports(d.reports||[]);setLoading(false);
  };

  useEffect(()=>{if(tab==='reports')loadReports();},[tab,reportFilter]);

  const loadUserDetail=async(uid)=>{
    const d=await post(`/api/admin/user/${uid}`,{});
    setSelectedUser(d);
  };

  const doAdjust=async(uid)=>{
    await post(`/api/admin/user/${uid}/adjust`,{fp_delta:parseFloat(adjustFP)||0,rp_delta:parseFloat(adjustRP)||0});
    alert('Balances updated.'); loadUserDetail(uid); setAdjustFP(''); setAdjustRP('');
  };

  const doBan=async(uid)=>{
    if(!banReason.trim()){alert('Enter a reason.');return;}
    await post(`/api/admin/user/${uid}/ban`,{reason:banReason});
    alert('User banned.'); setBanReason(''); loadUserDetail(uid);
  };

  const doUnban=async(uid)=>{
    await post(`/api/admin/user/${uid}/unban`,{});
    alert('User unbanned.'); loadUserDetail(uid);
  };

  const doReportAction=async(rid,action,note='')=>{
    await post(`/api/admin/report/${rid}/action`,{action,note});
    loadReports();
  };

  const maxSessions=stats?.sessions_by_day?.length?Math.max(...stats.sessions_by_day.map(r=>r.c),1):1;

  return(
    <div className="admin-container">
      <div className="admin-header">
        <button onClick={onBack} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'.85rem',padding:'5px 0'}}>← Back</button>
        <h1>Admin Dashboard</h1>
        <span className="admin-badge">Chatter3 Internal</span>
      </div>

      <div className="admin-tabs">
        {['analytics','users','reports','health'].map(t=>(
          <button key={t} className={`admin-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)} style={{textTransform:'capitalize'}}>{t}</button>
        ))}
      </div>

      {/* ── ANALYTICS ── */}
      {tab==='analytics'&&(
        loading?<p style={{color:'#9ca3af'}}>Loading…</p>:stats?(
          <>
            <div className="kpi-grid">
              <div className="kpi-card"><div className="kpi-val">{stats.total_users?.toLocaleString()}</div><div className="kpi-lbl">Total Users</div><div className="kpi-sub">+{stats.new_users_today} today</div></div>
              <div className="kpi-card"><div className="kpi-val">{stats.dau?.toLocaleString()}</div><div className="kpi-lbl">DAU</div></div>
              <div className="kpi-card"><div className="kpi-val">{stats.mau?.toLocaleString()}</div><div className="kpi-lbl">MAU</div></div>
              <div className="kpi-card"><div className="kpi-val">{stats.total_sessions?.toLocaleString()}</div><div className="kpi-lbl">Completed Calls</div></div>
              <div className="kpi-card"><div className="kpi-val" style={{color:'#22c55e'}}>{stats.active_sessions}</div><div className="kpi-lbl">Live Calls Now</div></div>
              <div className="kpi-card"><div className="kpi-val" style={{color:'#f59e0b'}}>{stats.queue_size}</div><div className="kpi-lbl">In Queue</div></div>
              <div className="kpi-card"><div className="kpi-val" style={{color:'#ef4444'}}>{stats.pending_reports}</div><div className="kpi-lbl">Pending Reports</div></div>
            </div>
            {stats.sessions_by_day?.length>0&&(
              <div className="admin-section">
                <h3>Sessions (Last 30 Days)</h3>
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
          </>
        ):<p style={{color:'#9ca3af'}}>No data.</p>
      )}

      {/* ── USERS ── */}
      {tab==='users'&&(
        <>
          <div className="search-row">
            <input className="search-input" placeholder="Search by username, email, or nickname…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchUsers()}/>
            <button className="search-btn" onClick={searchUsers}>Search</button>
          </div>
          {selectedUser&&(
            <div className="admin-section" style={{marginBottom:'1rem',borderLeft:'3px solid #4f8ef7'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'.5rem'}}>
                <div>
                  <h3 style={{margin:0}}>{selectedUser.user?.nickname||selectedUser.user?.username} <span style={{fontWeight:400,color:'#94a3b8',fontSize:'.82rem'}}>{selectedUser.user?.email}</span></h3>
                  <div style={{display:'flex',gap:.5,flexWrap:'wrap',marginTop:'.4rem'}}>
                    {selectedUser.user?.is_admin&&<span className="badge-pill admin">Admin</span>}
                    {selectedUser.user?.is_banned&&<span className="badge-pill banned">Banned</span>}
                    <span style={{fontSize:'.78rem',color:'#94a3b8'}}>{selectedUser.user?.country} · {selectedUser.user?.english_level}</span>
                  </div>
                </div>
                <button onClick={()=>setSelectedUser(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:.9}}>✕ Close</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.5rem',margin:'.875rem 0',background:'#f8fafc',borderRadius:8,padding:'.75rem'}}>
                <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#1d4ed8'}}>{selectedUser.user?.fp_balance??0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>FP</div></div>
                <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#15803d'}}>{(selectedUser.user?.rp_balance||0).toFixed(1)}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>RP</div></div>
                <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem'}}>{selectedUser.sessions?.length||0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>Sessions</div></div>
                <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1.1rem',color:'#ef4444'}}>{selectedUser.reports_received||0}</div><div style={{fontSize:'.7rem',color:'#94a3b8'}}>Reports</div></div>
              </div>
              <p style={{margin:'0 0 .5rem',fontSize:'.82rem',fontWeight:600,color:'#374151'}}>Adjust Balances</p>
              <div className="inline-form">
                <input placeholder="FP delta (e.g. +2 or -1)" value={adjustFP} onChange={e=>setAdjustFP(e.target.value)}/>
                <input placeholder="RP delta (e.g. +1.5)" value={adjustRP} onChange={e=>setAdjustRP(e.target.value)}/>
                <button onClick={()=>doAdjust(selectedUser.user?.id)}>Apply</button>
              </div>
              {!selectedUser.user?.is_banned?(
                <>
                  <p style={{margin:'.875rem 0 .4rem',fontSize:'.82rem',fontWeight:600,color:'#374151'}}>Ban User</p>
                  <div className="inline-form">
                    <input placeholder="Ban reason (required)" value={banReason} onChange={e=>setBanReason(e.target.value)} style={{flex:2}}/>
                    <button style={{background:'#ef4444'}} onClick={()=>doBan(selectedUser.user?.id)}>Ban</button>
                  </div>
                </>
              ):(
                <button className="act-btn unban" style={{marginTop:'.75rem'}} onClick={()=>doUnban(selectedUser.user?.id)}>✓ Unban User</button>
              )}
            </div>
          )}
          {loading?<p style={{color:'#9ca3af'}}>Searching…</p>:users.length>0&&(
            <div className="admin-section">
              <h3>{users.length} results</h3>
              <div style={{overflowX:'auto'}}>
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Level</th><th>FP</th><th>RP</th><th>Country</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {users.map(u=>(
                      <tr key={u.id}>
                        <td><strong>{u.nickname||u.username}</strong><br/><span style={{color:'#94a3b8',fontSize:'.75rem'}}>{u.email}</span></td>
                        <td style={{textTransform:'capitalize'}}>{u.english_level}</td>
                        <td style={{color:'#1d4ed8',fontWeight:700}}>{u.fp_balance??0}</td>
                        <td style={{color:'#15803d',fontWeight:700}}>{(u.rp_balance||0).toFixed(1)}</td>
                        <td>{u.country||'—'}</td>
                        <td>{u.is_banned?<span className="badge-pill banned">Banned</span>:u.is_admin?<span className="badge-pill admin">Admin</span>:'—'}</td>
                        <td><button className="act-btn adjust" onClick={()=>loadUserDetail(u.id)}>Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {users.length===0&&!loading&&searchQ&&<p style={{color:'#9ca3af',textAlign:'center'}}>No results. Try a different query.</p>}
        </>
      )}

      {/* ── REPORTS ── */}
      {tab==='reports'&&(
        <>
          <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
            {['pending','reviewed','actioned'].map(s=>(
              <button key={s} className={`admin-tab ${reportFilter===s?'active':''}`} style={{textTransform:'capitalize',padding:'6px 14px'}} onClick={()=>setReportFilter(s)}>{s}</button>
            ))}
          </div>
          {loading?<p style={{color:'#9ca3af'}}>Loading…</p>:reports.length===0?<p style={{color:'#9ca3af',textAlign:'center'}}>No {reportFilter} reports.</p>:(
            <div className="admin-section">
              <h3>{reports.length} {reportFilter} reports</h3>
              <div style={{overflowX:'auto'}}>
                <table className="admin-table">
                  <thead><tr><th>Reporter</th><th>Reported</th><th>Reason</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
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
                              <button className="act-btn dismiss" onClick={()=>doReportAction(r.id,'dismiss','Reviewed — no action needed')}>Dismiss</button>
                              <button className="act-btn action" onClick={()=>doReportAction(r.id,'action','User warned')}>Action</button>
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

      {/* ── HEALTH ── */}
      {tab==='health'&&(
        <HealthTab stats={stats} user={user} post={post}/>
      )}
    </div>
  );
}

function HealthTab({user,post}){
  const[health,setHealth]=useState(null);
  useEffect(()=>{
    post('/api/admin/stats',{}).then(setHealth).catch(()=>{});
  },[]);
  return(
    <div>
      <div className="health-grid">
        <div className="health-item"><div className="h-val" style={{color:'#22c55e'}}>{health?.active_sessions??'—'}</div><div className="h-lbl">Active Sessions (Live)</div></div>
        <div className="health-item"><div className="h-val" style={{color:'#f59e0b'}}>{health?.queue_size??'—'}</div><div className="h-lbl">Users in Queue</div></div>
        <div className="health-item"><div className="h-val">{health?.total_users??'—'}</div><div className="h-lbl">Total Registered Users</div></div>
        <div className="health-item"><div className="h-val" style={{color:'#ef4444'}}>{health?.pending_reports??'—'}</div><div className="h-lbl">Pending Reports</div></div>
      </div>
      <div className="admin-section" style={{marginTop:'1rem'}}>
        <h3>System Info</h3>
        <table className="admin-table">
          <tbody>
            <tr><td>Backend</td><td>Cloudflare Workers (api.chatter3.com)</td></tr>
            <tr><td>Database</td><td>Cloudflare D1 (chatter3-db)</td></tr>
            <tr><td>Signaling</td><td>Durable Objects WebSocket</td></tr>
            <tr><td>Email</td><td>Resend API → report@chatter3.com</td></tr>
            <tr><td>Point System</td><td>FP (daily, expires) + RP (permanent)</td></tr>
            <tr><td>FP per Day</td><td>1 FP (reset midnight UTC)</td></tr>
            <tr><td>RP per Completion</td><td>+1 RP (both rate) +0.5 RP if received Good</td></tr>
            <tr><td>Exchange Rate</td><td>3 RP → 1 FP</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────
export default function App(){
  const[view,setView]=useState('auth');
  const[user,setUser]=useState(null);
  const[session,setSession]=useState(null);
  const[callStartedAt,setCallStartedAt]=useState(null);
  const[showOnboarding,setShowOnboarding]=useState(false);
  const[showProfileGate,setShowProfileGate]=useState(false);
  const[showExchange,setShowExchange]=useState(false);

  useEffect(()=>{
    const saved=localStorage.getItem('chatter3_user');
    if(saved){const u=JSON.parse(saved);setUser(u);setView('dashboard');checkSession(u.id);}
  },[]);

  const checkSession=async(uid)=>{
    try{const r=await fetch(`${API_URL}/api/matching/session/${uid}`);const d=await r.json();
      if(d.active_session){setSession(d.session);setCallStartedAt(Date.now());setView('video');}}catch{}
  };

  const refreshUser=async(uid)=>{
    try{const r=await fetch(`${API_URL}/api/user/${uid}`);const d=await r.json();
      if(d.success){const u={...user,...d.user};localStorage.setItem('chatter3_user',JSON.stringify(u));setUser(u);}}catch{}
  };

  const setAndSaveUser=(u)=>{setUser(u);localStorage.setItem('chatter3_user',JSON.stringify(u));};

  const handleLogin=(u)=>{
    setAndSaveUser(u);setView('dashboard');
    if(!localStorage.getItem('chatter3_onboarding_seen'))setShowOnboarding(true);
  };

  const handleLogout=async()=>{
    if(user)try{await fetch(`${API_URL}/api/matching/leave`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id})});}catch{}
    localStorage.removeItem('chatter3_user');setUser(null);setView('auth');
  };

  const handleFindPartner=async()=>{
    if(!user)return;
    if(!user.country||!user.native_language){setShowProfileGate(true);return;}
    // Check FP balance
    try{
      const r=await fetch(`${API_URL}/api/user/balances/${user.id}`);
      const d=await r.json();
      const fp=d.fp??0;const rp=d.rp??0;
      setAndSaveUser({...user,fp_balance:fp,rp_balance:rp});
      if(fp<1){setShowExchange(true);return;}
    }catch{}
    setView('matching');
  };

  return(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-container">
        <style>{STYLES}</style>
        {showOnboarding&&<OnboardingSlider onComplete={()=>{localStorage.setItem('chatter3_onboarding_seen','1');setShowOnboarding(false);}}/>}
        {showProfileGate&&user&&<ProfileGate user={user} onComplete={u=>{setAndSaveUser(u);setShowProfileGate(false);setView('matching');}} onDismiss={()=>setShowProfileGate(false)}/>}
        {showExchange&&user&&<ExchangeModal user={user} onClose={()=>setShowExchange(false)} onDone={(fp,rp)=>{setAndSaveUser({...user,fp_balance:fp,rp_balance:rp});setShowExchange(false);if(fp>=1)setView('matching');}}/>}

        {view==='auth'&&<AuthView onLogin={handleLogin}/>}

        {view!=='auth'&&view!=='video'&&view!=='precall'&&(
          <header className="app-header">
            <div className="app-header-content">
              <div><img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Chatter3" className="header-logo-img"/></div>
              {user&&(
                <div className="user-info">
                  <span style={{fontSize:'.88rem'}}>{user.nickname||user.username}</span>
                  <div className="header-pts">🎫 {user.fp_balance??0} FP &nbsp;·&nbsp; ⭐ {(user.rp_balance||0).toFixed(1)} RP</div>
                  {user.is_admin&&<button className="header-btn btn-admin" onClick={()=>setView('admin')}>⚙ Admin</button>}
                  <button className="header-btn btn-logout" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </header>
        )}

        <main className="app-content">
          {view==='dashboard'&&user&&<DashboardView user={user} onNavigate={setView} onFindPartner={handleFindPartner} onExchange={()=>setShowExchange(true)} onRefreshUser={()=>refreshUser(user.id)}/>}
          {view==='matching'&&user&&<MatchingView user={user} onCancel={()=>setView('dashboard')} onMatch={s=>{setSession(s);setView('precall');}}/>}
          {view==='precall'&&user&&session&&<PreCallView session={session} onStart={()=>{setCallStartedAt(Date.now());setView('video');}} onCancel={async()=>{try{await fetch(`${API_URL}/api/matching/end`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:session.id,user_id:user.id,reason:'cancelled'})});}catch{}setSession(null);setView('matching');}}/>}
          {view==='video'&&user&&session&&<VideoRoomView user={user} session={session} callStartedAt={callStartedAt} onEnd={()=>{setSession(null);setCallStartedAt(null);refreshUser(user.id);setView('dashboard');}}/>}
          {view==='profile'&&user&&<ProfileView user={user} onBack={()=>setView('dashboard')} onUpdate={setAndSaveUser} onShowOnboarding={()=>setShowOnboarding(true)}/>}
          {view==='admin'&&user&&user.is_admin&&<AdminDashboard user={user} onBack={()=>setView('dashboard')}/>}
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// AUTH VIEW
// ─────────────────────────────────────────────────────────────────
function AuthView({onLogin}){
  const[reg,setReg]=useState(false);
  const[loading,setLoading]=useState(false);
  const[terms,setTerms]=useState(false);
  const[form,setForm]=useState({email:'',password:'',username:'',english_level:'beginner',country:'',native_language:''});
  const[err,setErr]=useState('');
  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const submit=async(e)=>{
    e.preventDefault();
    if(reg&&!terms){setErr('Please accept the Terms of Service, Privacy Policy, and Refund Policy.');return;}
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${API_URL}${reg?'/api/auth/register':'/api/auth/login'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const d=await r.json();
      if(d.success)onLogin(d.user);else setErr(d.error||'Authentication failed');
    }catch{setErr('Network error.');}finally{setLoading(false);}
  };

  const googleSuccess=async(cr)=>{
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${API_URL}/api/auth/google`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:cr.credential})});
      const d=await r.json();
      if(d.success)onLogin(d.user);else setErr(d.error||'Google auth failed');
    }catch{setErr('Network error.');}finally{setLoading(false);}
  };

  return(
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Chatter3" className="auth-logo"/>
          <p className="auth-subtitle">Master English with real people</p>
        </div>
        {err&&<div className="error-message">{err}</div>}
        <form onSubmit={submit} className="register-form">
          {reg&&<>
            <div className="form-group"><label>Username</label><input value={form.username} onChange={upd('username')} required/></div>
            <div className="form-group"><label>Country of Origin</label><input value={form.country} onChange={upd('country')} required placeholder="e.g. Japan"/></div>
            <div className="form-group"><label>Native Language</label><input value={form.native_language} onChange={upd('native_language')} required placeholder="e.g. Japanese"/></div>
            <div className="form-group"><label>English Level</label>
              <select value={form.english_level} onChange={upd('english_level')}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
          </>}
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={upd('email')} required/></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={upd('password')} required/></div>
          {reg&&(
            <div className="terms-row">
              <input type="checkbox" id="terms" checked={terms} onChange={e=>setTerms(e.target.checked)}/>
              <label htmlFor="terms">I agree to the <a href="https://chatter3.com/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>, <a href="https://chatter3.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, and <a href="https://chatter3.com/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a>.</label>
            </div>
          )}
          <button type="submit" disabled={loading||(reg&&!terms)} style={{opacity:reg&&!terms?.55:1,cursor:reg&&!terms?'not-allowed':'pointer'}}>
            {loading?'Loading…':reg?'Create Account':'Sign In'}
          </button>
        </form>
        <div className="auth-divider">or</div>
        <div className="google-button-container">
          <GoogleLogin onSuccess={googleSuccess} onError={()=>setErr('Google Sign In was unsuccessful.')}/>
        </div>
        <button className="auth-link" onClick={()=>{setReg(v=>!v);setErr('');setTerms(false);}}>
          {reg?'Already have an account? Sign In':'New to Chatter3? Create Account'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────────────────────────
function DashboardView({user,onNavigate,onFindPartner,onExchange,onRefreshUser}){
  const[online,setOnline]=useState({searching:0,in_call:0,by_level:{}});
  const[balances,setBalances]=useState({fp:user.fp_balance??0,rp:user.rp_balance??0});
  const canCall=balances.fp>=1;

  useEffect(()=>{
    fetch(`${API_URL}/api/stats/online`).then(r=>r.json()).then(setOnline).catch(()=>{});
    fetch(`${API_URL}/api/user/balances/${user.id}`).then(r=>r.json()).then(d=>{
      if(d.success){setBalances({fp:d.fp,rp:d.rp});if(d.fp!==user.fp_balance||d.rp!==user.rp_balance)onRefreshUser();}
    }).catch(()=>{});
  },[user.id]);

  const totalOnline=online.searching+online.in_call;
  const sameLevel=online.by_level?.[user.english_level]||0;

  return(
    <div className="dashboard-container">
      <div className="welcome-message">
        <h2>Ready to start a conversation?</h2>
        <p>Your English practice journey begins here!</p>
        {totalOnline>0&&(
          <div style={{display:'flex',justifyContent:'center',marginBottom:'.75rem'}}>
            <span className="dashboard-online-pill">
              <span className="live-dot"/>
              {totalOnline===1?'1 person online now':`${totalOnline} people online now`}
              {online.searching>0&&<span style={{opacity:.7,fontWeight:400}}>&nbsp;· {online.searching} searching</span>}
            </span>
          </div>
        )}
        <button onClick={onFindPartner} className="start-matching-btn" disabled={false}>
          Find a Conversation Partner
        </button>
        {!canCall&&(
          <p style={{fontSize:'.82rem',color:'#f59e0b',marginTop:'.5rem'}}>
            ⚡ No FP remaining — <button onClick={onExchange} style={{background:'none',border:'none',color:'#4f46e5',fontWeight:700,cursor:'pointer',fontSize:'.82rem',textDecoration:'underline'}}>exchange RP for FP</button> to continue.
          </p>
        )}
      </div>

      <div className="stats-card">
        <h3>Your Balances</h3>
        <div className="balance-grid">
          <div className="balance-tile fp">
            <div className="balance-num fp">{balances.fp}</div>
            <div className="balance-lbl">🎫 Free Points (FP)</div>
            <div style={{fontSize:'.7rem',color:'#6b7280',marginTop:2}}>1 FP = 5 min call · resets daily</div>
          </div>
          <div className="balance-tile rp">
            <div className="balance-num rp">{balances.rp.toFixed(1)}</div>
            <div className="balance-lbl">⭐ Reward Points (RP)</div>
            <div style={{fontSize:'.7rem',color:'#6b7280',marginTop:2}}>Never expires · {RP_TO_FP} RP = 1 FP</div>
          </div>
        </div>
        <button className="exchange-btn" onClick={onExchange}>🔄 Exchange RP → FP</button>

        <h3 style={{marginTop:'1.25rem'}}>Your Stats</h3>
        <div className="stat-row"><span className="stat-label">Level</span><span className="stat-value" style={{textTransform:'capitalize'}}>{user.english_level}</span></div>
        <div className="stat-row"><span className="stat-label">Call Duration</span><span className="stat-value">{user.english_level==='beginner'?'5 mins':'10 mins'}</span></div>
        {totalOnline>0&&sameLevel<=1&&(
          <div className="stat-row"><span className="stat-label" style={{color:'#f59e0b',fontSize:'.8rem'}}>⚠️ No {user.english_level}-level users online right now</span></div>
        )}
        <div className="stat-row" style={{border:'none',paddingTop:'.875rem'}}>
          <button onClick={()=>onNavigate('profile')} style={{width:'100%',padding:'9px',background:'#f5f5f5',border:'1px solid #ddd',borderRadius:'6px',cursor:'pointer',fontSize:'.88rem'}}>
            Profile & Conversation History
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MATCHING VIEW
// ─────────────────────────────────────────────────────────────────
function MatchingView({user,onCancel,onMatch}){
  const[status,setStatus]=useState('Looking for a partner...');
  const[matched,setMatched]=useState(false);
  const[online,setOnline]=useState({searching:0,in_call:0,by_level:{}});
  const[elapsed,setElapsed]=useState(0);
  const[timedOut,setTimedOut]=useState(false);
  const stopRingRef=useRef(null);
  const t0=useRef(Date.now());

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
          const r=await fetch(`${API_URL}/api/matching/join`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,english_level:user.english_level,country:normalizeCountry(user.country),native_language:(user.native_language||'').trim().toLowerCase()})});
          const d=await r.json();
          if(d.error==='insufficient_fp'){stopRingRef.current?.();onCancel();return;}
          if(d.matched){setMatched(true);setStatus('Partner found!');stopRingRef.current?.();}
        }
        const sr=await fetch(`${API_URL}/api/matching/session/${user.id}`);
        const sd=await sr.json();
        if(sd.active_session){clearInterval(polling);setStatus('Connecting…');onMatch(sd.session);}
      }catch{setStatus('Connection error. Retrying…');}
    };
    search();polling=setInterval(search,3000);
    return()=>clearInterval(polling);
  },[matched,timedOut]);

  const cancel=async()=>{
    stopRingRef.current?.();
    try{await fetch(`${API_URL}/api/matching/leave`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id})});}catch{}
    onCancel();
  };

  const total=online.searching+online.in_call;
  const sameLevel=online.by_level?.[user.english_level]||0;
  const noLevel=total>0&&sameLevel<=1;

  if(timedOut){
    return(
      <div className="matching-screen">
        <div style={{fontSize:'2.8rem',marginBottom:'.875rem'}}>😔</div>
        <p className="match-status">No match found</p>
        <p className="match-sub" style={{maxWidth:300,textAlign:'center'}}>
          {noLevel?`${total} user${total!==1?'s':''} online, but none at the ${user.english_level} level right now. Try again soon!`
            :"Unfortunately we couldn't find a match. Please try again later — new users join throughout the day."}
        </p>
        <button onClick={cancel} className="start-matching-btn" style={{marginTop:'1.25rem'}}>Back to Dashboard</button>
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
      <p className="match-sub">Finding a <span style={{fontWeight:600,textTransform:'capitalize'}}>{user.english_level}</span> level partner…</p>
      <div className="level-badge">📊 {user.english_level} · {user.english_level==='beginner'?'5':'10'} min sessions</div>
      {total>0&&<div className="online-badge"><span className="online-dot"/>{total===1?'1 person online':`${total} people online now`}</div>}
      {elapsed>=15&&noLevel&&<p style={{fontSize:'.78rem',color:'#f59e0b',maxWidth:260,textAlign:'center',margin:'.4rem 0'}}>⚠️ No {user.english_level}-level users available. Continuing to search…</p>}
      <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,(elapsed/MATCH_TIMEOUT)*100)}%`,background:elapsed>60?'#f59e0b':'#4f8ef7'}}/></div>
      <p style={{fontSize:'.72rem',color:'#9ca3af',margin:'0 0 .875rem'}}>{MATCH_TIMEOUT-elapsed}s remaining</p>
      <button onClick={cancel} className="cancel-btn">Cancel Search</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRE-CALL VIEW
// ─────────────────────────────────────────────────────────────────
function PreCallView({session,onStart,onCancel}){
  const FROM=5;
  const[cd,setCd]=useState(FROM);
  const partner=session.partner||{};
  const name=partner.nickname||partner.username||'Your partner';
  const tip=STARTERS[Math.floor(Math.random()*STARTERS.length)](name);
  const LEVEL={beginner:'🟢 Beginner',intermediate:'🟡 Intermediate',advanced:'🔵 Advanced'};
  useEffect(()=>{playSound('match');},[]);
  useEffect(()=>{if(cd<=0){onStart();return;}const t=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(t);},[cd]);
  const R=27,C=2*Math.PI*R,offset=C*(1-cd/FROM);
  const stroke=cd>2?'#4f8ef7':cd>1?'#f59e0b':'#ef4444';
  return(
    <div className="precall-overlay">
      <div className="precall-bg"/>
      <div className="precall-card">
        <div className="precall-tag">You've been matched</div>
        <div className="precall-avatar-wrap">
          <div className="precall-avatar-ring"/>
          <div className="precall-avatar-inner">
            {partner.avatar_url?<img src={partner.avatar_url} alt={name}/>:<span style={{fontFamily:'Sora,sans-serif',fontSize:'2.2rem',fontWeight:800,color:'white'}}>{name.charAt(0).toUpperCase()}</span>}
          </div>
        </div>
        <h2 className="precall-name">{name}</h2>
        <div className="precall-chips">
          {partner.country&&<span className="chip country">{getFlag(partner.country)} {partner.country}</span>}
          {partner.native_language&&<span className="chip lang">🗣️ {partner.native_language}</span>}
          {partner.english_level&&<span className="chip level">{LEVEL[partner.english_level]||partner.english_level}</span>}
        </div>
        <div className="precall-starter"><strong>💡 Conversation Starter</strong>{tip}</div>
        <div className="precall-countdown">
          <div style={{display:'flex',alignItems:'center',gap:'1.25rem',justifyContent:'center'}}>
            <div className="countdown-ring">
              <svg width="66" height="66" style={{transform:'rotate(-90deg)'}}>
                <circle cx="33" cy="33" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3"/>
                <circle cx="33" cy="33" r={R} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} style={{transition:'stroke-dashoffset .9s linear,stroke .3s'}}/>
              </svg>
              <span className="countdown-num" style={{color:stroke}}>{cd}</span>
            </div>
            <button className="precall-start-btn" onClick={onStart}>Start Now →</button>
          </div>
          <p style={{color:'rgba(255,255,255,.28)',fontSize:'.75rem',margin:'.65rem 0 0'}}>Auto-starts in {cd}s</p>
        </div>
        <button className="precall-back-btn" onClick={onCancel}>↩ Go back to search</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// VIDEO ROOM VIEW
// ─────────────────────────────────────────────────────────────────
function VideoRoomView({user,session,callStartedAt,onEnd}){
  const total=session.english_level==='beginner'?300:600;
  const[timeLeft,setTimeLeft]=useState(total);
  const[connStatus,setConnStatus]=useState('new');
  const[showRating,setShowRating]=useState(false);
  const[showDisc,setShowDisc]=useState(false);
  const[showReport,setShowReport]=useState(false);
  const[endReason,setEndReason]=useState(null);
  const[partnerEndedScreen,setPartnerEndedScreen]=useState(false);
  const[err,setErr]=useState('');
  const lv=useRef(null),rv=useRef(null),pc=useRef(null),ws=useRef(null);
  const remStream=useRef(null),lcQ=useRef([]),rcQ=useRef([]),negRef=useRef(false),streamRef=useRef(null);
  const discTimer=useRef(null),autoTimer=useRef(null);

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
        p.onicecandidate=ev=>{if(ev.candidate){const pl=JSON.stringify({type:'candidate',candidate:ev.candidate});ws.current?.readyState===1?ws.current.send(pl):lcQ.current.push(pl);}};
        p.onconnectionstatechange=()=>{
          const s=p.connectionState;setConnStatus(s);
          if(s==='connected'){playSound('start');clearTimeout(discTimer.current);clearTimeout(autoTimer.current);setShowDisc(false);}
          if(s==='disconnected'||s==='failed'){
            discTimer.current=setTimeout(()=>setShowDisc(true),3000);
            autoTimer.current=setTimeout(async()=>{setEndReason('network');setShowDisc(false);await fetch(`${API_URL}/api/matching/end`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:session.id,user_id:user.id,reason:'network_disconnect'})}).catch(()=>{});cleanup();playSound('end');setShowRating(true);},15000);
          }
        };
        pc.current=p;
        const sock=new WebSocket(`${WS_URL}/api/signal?sessionId=${session.id}`);
        ws.current=sock;
        sock.onopen=()=>{setConnStatus('checking');while(lcQ.current.length>0)sock.send(lcQ.current.shift());sock.send(JSON.stringify({type:'join'}));};
        sock.onmessage=async(msg)=>{
          const data=JSON.parse(msg.data);
          if(data.type==='bye'){cleanup();playSound('end');setEndReason('partner');setPartnerEndedScreen(true);setTimeout(()=>{setPartnerEndedScreen(false);setShowRating(true);},3000);}
          else if(data.type==='join'){sock.send(JSON.stringify({type:'join_ack'}));if(user.id===session.user1_id&&!negRef.current)neg();}
          else if(data.type==='join_ack'){if(user.id===session.user1_id&&!negRef.current)neg();}
          else if(data.type==='offer'){negRef.current=true;await p.setRemoteDescription(new RTCSessionDescription(data.sdp));flushRC();const a=await p.createAnswer();await p.setLocalDescription(a);sock.send(JSON.stringify({type:'answer',sdp:a}));}
          else if(data.type==='answer'){await p.setRemoteDescription(new RTCSessionDescription(data.sdp));flushRC();}
          else if(data.type==='candidate'){const c=new RTCIceCandidate(data.candidate);p.remoteDescription?.type?await p.addIceCandidate(c):rcQ.current.push(c);}
        };
        const neg=async()=>{negRef.current=true;const o=await p.createOffer();await p.setLocalDescription(o);sock.send(JSON.stringify({type:'offer',sdp:o}));};
      }catch{setErr('Could not access camera/microphone');}
    };
    const flushRC=async()=>{if(!pc.current)return;while(rcQ.current.length>0)try{await pc.current.addIceCandidate(rcQ.current.shift());}catch{}};
    const beforeUnload=()=>{ws.current?.readyState===1&&ws.current.send(JSON.stringify({type:'bye'}));};
    window.addEventListener('beforeunload',beforeUnload);
    const t0=callStartedAt||Date.now();
    const tick=()=>{const el=Math.floor((Date.now()-t0)/1000);const rem=Math.max(0,total-el);setTimeLeft(rem);return rem;};
    tick();init();
    const timer=setInterval(()=>{if(tick()<=0)hangup();},1000);
    return()=>{clearInterval(timer);clearTimeout(discTimer.current);clearTimeout(autoTimer.current);window.removeEventListener('beforeunload',beforeUnload);};
  },[]);

  const hangup=async()=>{
    ws.current?.readyState===1&&ws.current.send(JSON.stringify({type:'bye'}));
    try{await fetch(`${API_URL}/api/matching/end`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:session.id,user_id:user.id,reason:'hangup'})});}catch{}
    playSound('end');cleanup();setShowRating(true);
  };

  const rate=async(rating)=>{
    try{
      const r=await fetch(`${API_URL}/api/matching/rate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:session.id,user_id:user.id,rating})});
      const d=await r.json();
      if(d.rp_awarded)playSound('points');
    }catch{}
    onEnd();
  };

  const fmt=s=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const tc=timeLeft>60?'normal':timeLeft>30?'warning':'critical';
  const SM={new:{l:'Initializing',c:'new'},checking:{l:'Connecting…',c:'checking'},connecting:{l:'Connecting…',c:'connecting'},connected:{l:'Connected',c:'connected'},disconnected:{l:'Reconnecting…',c:'disconnected'},failed:{l:'Connection failed',c:'failed'},closed:{l:'Ended',c:'closed'}};
  const si=SM[connStatus]||SM.new;

  if(err)return <div className="matching-screen"><p style={{color:'red'}}>{err}</p><button onClick={onEnd} className="cancel-btn">Go Back</button></div>;

  return(
    <div className="video-call-interface">
      <div className="video-compact-header">
        <img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Chatter3"/>
        <span className="video-compact-pts">🎫 {user.fp_balance??0} FP &nbsp;·&nbsp; ⭐ {(user.rp_balance||0).toFixed(1)} RP</span>
      </div>
      {showReport&&<ReportModal targetUser={session.partner} sessionId={session.id} reporterUserId={user.id} onClose={()=>setShowReport(false)}/>}
      <div className="video-container">
        <video ref={rv} autoPlay playsInline className="video-el"/>
        <video ref={lv} autoPlay playsInline muted className="video-el local"/>
        <div className="timer-overlay">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tc==='normal'?'white':tc==='warning'?'#fbbf24':'#f87171'} strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className={`timer-display ${tc}`}>{fmt(timeLeft)}</span>
        </div>
        <div className={`status-badge ${si.c}`}><span className="s-dot"/>{si.l}</div>
        {partnerEndedScreen&&<div className="ended-overlay"><div style={{fontSize:'2.25rem',marginBottom:'.65rem'}}>📵</div><h3>Your partner ended the call</h3><p>Taking you to the rating screen…</p></div>}
        {showDisc&&!showRating&&!partnerEndedScreen&&(
          <div className="disconnect-overlay">
            <div className="spinner"/>
            <h3>Connection Lost</h3>
            <p>Trying to reconnect… will end automatically if this persists.</p>
            <button className="disc-end-btn" onClick={hangup}>End Call Now</button>
          </div>
        )}
        {showRating&&(
          <div className="rating-overlay">
            {endReason==='network'&&<div className="context-note warning">⚠️ The call ended due to a network issue.</div>}
            {endReason==='partner'&&<div className="context-note muted">Your partner ended the call.</div>}
            <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.3rem',fontWeight:800,margin:'0 0 .4rem'}}>Rate your partner</h2>
            <p style={{color:'rgba(255,255,255,.6)',margin:0,fontSize:'.88rem'}}>How was your conversation with {session.partner?.username}?</p>
            <p style={{color:'rgba(255,255,255,.38)',fontSize:'.78rem',margin:'.5rem 0 0'}}>Both users rating = +1 RP each · Receiving Good = +0.5 RP bonus</p>
            <div className="rating-buttons">
              <button className="rating-btn good" onClick={()=>rate('good')}>👍 Good</button>
              <button className="rating-btn meh" onClick={()=>rate('meh')}>😐 Meh</button>
            </div>
          </div>
        )}
      </div>
      {!showRating&&(
        <div className="call-controls">
          <div>
            <p style={{fontSize:'.82rem',color:'#999',margin:0}}>Talking to</p>
            <p style={{fontWeight:700,fontSize:'1rem',margin:0}}>{session.partner?.username}</p>
            {session.partner?.country&&<p style={{fontSize:'.78rem',color:'#6b7280',margin:'1px 0 0'}}>{getFlag(session.partner.country)} {session.partner.country}</p>}
            <button className="report-btn" onClick={()=>setShowReport(true)}>⚑ Report</button>
          </div>
          <button onClick={hangup} className="control-btn-end"><PhoneOff style={{width:17,height:17}}/> End Call</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PROFILE VIEW
// ─────────────────────────────────────────────────────────────────
function ProfileView({user,onBack,onUpdate,onShowOnboarding}){
  const[form,setForm]=useState({nickname:user.nickname||user.username||'',country:user.country||'',native_language:user.native_language||'',english_level:user.english_level||'beginner',bio:user.bio||'',avatar_url:user.avatar_url||''});
  const[history,setHistory]=useState([]);
  const fileRef=useRef(null);
  useEffect(()=>{
    fetch(`${API_URL}/api/user/history`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id})}).then(r=>r.json()).then(d=>{if(d.success)setHistory(d.history);});
  },[]);
  const upd=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const onFile=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();const rd=new FileReader();rd.onload=ev=>{img.onload=()=>{const M=800;let{width:w,height:h}=img;if(w>M||h>M){const r=Math.min(M/w,M/h);w=Math.round(w*r);h=Math.round(h*r);}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);setForm(p=>({...p,avatar_url:c.toDataURL('image/jpeg',.75)}));};img.src=ev.target.result;};rd.readAsDataURL(f);};
  const save=async()=>{const r=await fetch(`${API_URL}/api/user/update`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user.id,...form})});const d=await r.json();if(d.success){const u={...user,...d.user};localStorage.setItem('chatter3_user',JSON.stringify(u));onUpdate(u);alert('Profile Saved!');}};
  return(
    <div className="dashboard-container">
      <div style={{textAlign:'center',marginBottom:'1.25rem'}}><h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.3rem',fontWeight:800,color:'#1a1a2e',margin:0}}>Edit Profile</h2></div>
      <div className="profile-section">
        <div className="profile-avatar">
          {form.avatar_url?<img src={form.avatar_url} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} alt="Profile"/>:(form.nickname||user.username).charAt(0).toUpperCase()}
        </div>
        <div style={{textAlign:'center',marginBottom:'1.1rem'}}>
          <input type="file" accept="image/*" onChange={onFile} style={{display:'none'}} ref={fileRef}/>
          <button className="upload-btn" onClick={()=>fileRef.current.click()}><UploadIcon style={{width:13,height:13,marginRight:4}}/> Upload Picture</button>
          <p style={{fontSize:'.72rem',color:'#9ca3af',margin:'3px 0 0'}}>Auto-compressed on upload.</p>
        </div>
        <div className="form-group"><label>Nickname</label><input value={form.nickname} onChange={upd('nickname')}/></div>
        <div className="form-group"><label>Country</label><input value={form.country} onChange={upd('country')} placeholder="e.g. Japan"/></div>
        <div className="form-group"><label>Native Language</label><input value={form.native_language} onChange={upd('native_language')} placeholder="e.g. Japanese"/></div>
        <div className="form-group"><label>English Level</label>
          <select value={form.english_level} onChange={upd('english_level')}>
            <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
          </select>
        </div>
        <button className="save-btn" onClick={save}>Save Profile</button>
        <button onClick={onShowOnboarding} style={{marginTop:9,padding:'9px',width:'100%',background:'#f0f4ff',border:'1px solid #c7d7fc',borderRadius:'6px',cursor:'pointer',color:'#4f46e5',fontSize:'.88rem'}}>👋 View Introduction Again</button>
        <button onClick={onBack} style={{marginTop:9,padding:'9px',width:'100%',background:'#f5f5f5',border:'1px solid #ddd',borderRadius:'6px',cursor:'pointer',fontSize:'.88rem'}}>Back</button>
      </div>
      <div className="history-list">
        <h3 style={{fontFamily:'Sora,sans-serif',fontSize:'.95rem',color:'#1a1a2e',margin:'0 0 .875rem'}}>Recent Conversations</h3>
        {history.length===0&&<p style={{color:'#9ca3af',fontSize:'.88rem'}}>No calls yet. Find a partner to get started!</p>}
        {history.map(h=>(
          <div key={h.id} className="history-item">
            <div className="history-avatar">
              {h.partner_avatar?<img src={h.partner_avatar} style={{width:'100%',height:'100%',borderRadius:'50%'}} alt=""/>:(h.partner_name||'?').charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <strong style={{fontSize:'.9rem'}}>{h.partner_name||'Unknown'}</strong>
              <div style={{fontSize:'.76rem',color:'#9ca3af',marginTop:1}}>{new Date(h.created_at).toLocaleDateString()}</div>
              {h.points_earned!=null&&<span className="history-points">⭐ +{parseFloat(h.points_earned).toFixed(1)} RP</span>}
            </div>
            <div style={{textAlign:'right',fontSize:'.82rem',color:'#6b7280',flexShrink:0}}>
              {h.duration?Math.floor(h.duration/60)+'m '+(h.duration%60)+'s':'Incomplete'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

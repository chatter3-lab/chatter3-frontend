import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// --- Configuration ---
const API_URL = 'https://api.chatter3.com';
const WS_URL = 'wss://api.chatter3.com';
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";

// --- SOUND ASSETS ---
const SOUNDS = {
  match: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  start: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  end: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
};

const playSound = (type) => {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {}
};

// --- ONBOARDING SLIDES ---
const ONBOARDING_SLIDES = [
  { id: 1, emoji: '🌐', accentColor: '#4f8ef7', headline: 'Connect with real people, instantly.', body: 'Get matched 1-on-1 with learners around the world. No scheduling. No profiles to browse.', tag: 'CONNECT' },
  { id: 2, emoji: '🗣️', accentColor: '#7c3aed', headline: 'Just speak. That\'s how you learn.', body: 'Short, real conversations build real confidence. No lessons. No teachers. Just practice.', tag: 'SPEAK' },
  { id: 3, emoji: '⭐', accentColor: '#059669', headline: 'Your conversations earn value.', body: 'Speak, get feedback, and earn points. Use them to keep talking.', tag: 'EARN', note: 'Points are awarded as standard points.' },
];

// --- Country → Flag emoji ---
const COUNTRY_FLAGS = {
  'japan': '🇯🇵', 'korea': '🇰🇷', 'south korea': '🇰🇷', 'china': '🇨🇳',
  'united states': '🇺🇸', 'usa': '🇺🇸', 'us': '🇺🇸', 'america': '🇺🇸',
  'brazil': '🇧🇷', 'mexico': '🇲🇽', 'germany': '🇩🇪', 'france': '🇫🇷',
  'spain': '🇪🇸', 'italy': '🇮🇹', 'india': '🇮🇳', 'indonesia': '🇮🇩',
  'vietnam': '🇻🇳', 'thailand': '🇹🇭', 'philippines': '🇵🇭', 'taiwan': '🇹🇼',
  'russia': '🇷🇺', 'turkey': '🇹🇷', 'portugal': '🇵🇹', 'colombia': '🇨🇴',
  'argentina': '🇦🇷', 'bangladesh': '🇧🇩', 'pakistan': '🇵🇰', 'egypt': '🇪🇬',
  'nigeria': '🇳🇬', 'saudi arabia': '🇸🇦', 'uae': '🇦🇪', 'canada': '🇨🇦',
  'australia': '🇦🇺', 'uk': '🇬🇧', 'united kingdom': '🇬🇧', 'netherlands': '🇳🇱',
  'poland': '🇵🇱', 'sweden': '🇸🇪', 'norway': '🇳🇴', 'denmark': '🇩🇰',
  'finland': '🇫🇮', 'switzerland': '🇨🇭', 'austria': '🇦🇹', 'belgium': '🇧🇪',
  'greece': '🇬🇷', 'ukraine': '🇺🇦', 'malaysia': '🇲🇾', 'singapore': '🇸🇬',
  'hong kong': '🇭🇰', 'peru': '🇵🇪', 'chile': '🇨🇱', 'venezuela': '🇻🇪',
  'morocco': '🇲🇦', 'kenya': '🇰🇪', 'ethiopia': '🇪🇹', 'ghana': '🇬🇭',
  'iran': '🇮🇷', 'iraq': '🇮🇶', 'israel': '🇮🇱', 'nepal': '🇳🇵',
  'sri lanka': '🇱🇰', 'myanmar': '🇲🇲', 'cambodia': '🇰🇭',
};
const getFlag = (country) => {
  if (!country) return '🌍';
  return COUNTRY_FLAGS[country.trim().toLowerCase()] || '🌍';
};

// Conversation starter tips
const STARTERS = [
  (p) => `Ask ${p} what the most popular food is in their country!`,
  (p) => `Ask ${p} what music or shows are trending where they live!`,
  (p) => `Ask ${p} what they enjoy doing on weekends!`,
  (p) => `Ask ${p} what made them want to learn English!`,
  (p) => `Ask ${p} to describe something unique about their hometown!`,
];

// --- INLINE STYLES ---
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

* { box-sizing: border-box; }
body, html { margin: 0; padding: 0; width: 100%; font-family: 'DM Sans', -apple-system, sans-serif; background-color: #f5f5f5; }
#root { width: 100%; margin: 0; padding: 0; }

.app-container { display: flex; flex-direction: column; min-height: 100vh; width: 100%; }
.app-content { flex: 1; display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* Header */
.app-header { background: white; padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.app-header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.logo-container { display: flex; align-items: center; gap: 0.5rem; }
.header-logo-img { height: 100px; width: auto; object-fit: contain; }
.user-info { display: flex; gap: 1rem; align-items: center; }
.user-info span { font-weight: 500; }
.user-info button { padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }

/* Auth */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; }
.auth-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; width: 100%; max-width: 500px; }
.auth-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
.auth-logo { width: 100%; max-width: 400px; height: auto; object-fit: contain; margin-bottom: 1rem; }
.auth-subtitle { color: #666; margin-bottom: 0.5rem; font-size: 1.1rem; }
.auth-divider { margin: 1.5rem 0; color: #999; position: relative; }
.auth-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #eee; }
.google-button-container { display: flex; justify-content: center; margin: 1rem 0; width: 100%; }
.auth-link { color: #4285f4; background: none; border: none; cursor: pointer; margin-top: 1rem; display: block; width: 100%; }
.error-message { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #c62828; text-align: left; }

/* Forms */
.register-form { text-align: left; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box; }
.register-form button[type="submit"] { width: 100%; padding: 12px; background: #4285f4; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 1rem; }
.back-button { width: 100%; padding: 12px; background: white; color: #4285f4; border: 2px solid #4285f4; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 0.5rem; }

/* Dashboard */
.dashboard-container { padding: 2rem 1rem; text-align: center; }
.welcome-message h2 { color: #333; margin-bottom: 1rem; font-size: 2rem; }
.welcome-message p { color: #666; font-size: 1.2rem; margin-bottom: 2rem; }
.start-matching-btn { padding: 12px 24px; background: #4285f4; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s; }
.user-stats { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 600px; text-align: left; }
.user-stats h3 { margin-bottom: 1rem; color: #333; }
.stat-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.stat-item:last-child { border-bottom: none; }

/* Profile */
.profile-section { max-width: 600px; margin: 0 auto; text-align: left; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.profile-avatar { width: 100px; height: 100px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; object-fit: cover; margin: 0 auto 1.5rem; }
.upload-btn { background: #eee; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; display: inline-block; }
.save-btn { background: #10b981; color: white; border: none; padding: 12px; width: 100%; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 1rem; }
.history-list { margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eee; }
.history-avatar { width: 40px; height: 40px; border-radius: 50%; background: #eee; margin-right: 10px; object-fit: cover; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #555; font-size: 1.2rem; }

/* ============================================================
   ONBOARDING SLIDER
   ============================================================ */
.onboarding-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: #0d0d1a; overflow: hidden; }
.onboarding-bg-gradient { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 60% 80%, rgba(5,150,105,0.1) 0%, transparent 60%); pointer-events: none; }
.onboarding-stars { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.onboarding-star { position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%; opacity: 0.3; animation: twinkle 3s infinite alternate; }
@keyframes twinkle { 0% { opacity: 0.1; transform: scale(1); } 100% { opacity: 0.6; transform: scale(1.5); } }
.onboarding-card { position: relative; width: 100%; max-width: 420px; margin: 0 1.5rem; z-index: 1; }
.onboarding-skip { position: fixed; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; z-index: 10000; font-family: 'DM Sans', sans-serif; }
.onboarding-logo { text-align: center; margin-bottom: 2.5rem; }
.onboarding-logo img { height: 60px; width: auto; filter: brightness(0) invert(1); opacity: 0.9; }
.slides-wrapper { overflow: hidden; position: relative; }
.slides-track { display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.slide { flex: 0 0 100%; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 0.5rem; }
.slide-tag { font-family: 'Sora', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 1.5rem; display: inline-block; }
.slide-emoji-wrap { width: 100px; height: 100px; border-radius: 28px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 2rem; position: relative; }
.slide-headline { font-family: 'Sora', sans-serif; font-size: 1.65rem; font-weight: 800; color: white; line-height: 1.25; margin-bottom: 1rem; letter-spacing: -0.02em; }
.slide-body { font-size: 1rem; color: rgba(255,255,255,0.65); line-height: 1.65; max-width: 320px; }
.slide-note { margin-top: 1rem; font-size: 0.78rem; color: rgba(255,255,255,0.35); font-style: italic; }
.onboarding-dots { display: flex; justify-content: center; gap: 8px; margin: 2.5rem 0 2rem; }
.onboarding-dot { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.25); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: none; padding: 0; }
.onboarding-dot.active { background: white; }
.onboarding-cta { width: 100%; padding: 15px; border: none; border-radius: 14px; font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.25s; }
.onboarding-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(0,0,0,0.4); }

/* ============================================================
   PROFILE GATE MODAL
   ============================================================ */
.profile-gate-overlay { position: fixed; inset: 0; z-index: 8888; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
.profile-gate-card { background: white; border-radius: 20px; padding: 2.5rem 2rem; width: 100%; max-width: 420px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); text-align: center; animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.profile-gate-icon { font-size: 3rem; margin-bottom: 1rem; }
.profile-gate-card h2 { font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 800; color: #1a1a2e; margin: 0 0 0.5rem; }
.profile-gate-card p { color: #6b7280; font-size: 0.95rem; margin-bottom: 1.75rem; line-height: 1.5; }
.profile-gate-input { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; margin-bottom: 0.75rem; transition: border-color 0.2s; box-sizing: border-box; outline: none; text-align: left; }
.profile-gate-input:focus { border-color: #4f8ef7; }
.profile-gate-submit { width: 100%; padding: 13px; background: linear-gradient(135deg, #4f8ef7, #7c3aed); color: white; border: none; border-radius: 10px; font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; transition: opacity 0.2s, transform 0.2s; }
.profile-gate-submit:hover { opacity: 0.9; transform: translateY(-1px); }
.profile-gate-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* ============================================================
   MATCHING VIEW — enhanced with sonar + online count
   ============================================================ */
.matching-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem 1rem;
  text-align: center;
}

.sonar-container {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
}

.sonar-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #4f8ef7;
  animation: sonarPulse 2.4s ease-out infinite;
  opacity: 0;
}
.sonar-ring:nth-child(1) { width: 60px; height: 60px; animation-delay: 0s; }
.sonar-ring:nth-child(2) { width: 100px; height: 100px; animation-delay: 0.8s; }
.sonar-ring:nth-child(3) { width: 140px; height: 140px; animation-delay: 1.6s; }

@keyframes sonarPulse {
  0% { opacity: 0.8; transform: scale(0.6); }
  100% { opacity: 0; transform: scale(1); }
}

.sonar-core {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f8ef7, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 0 0 4px rgba(79,142,247,0.2), 0 4px 20px rgba(79,142,247,0.4);
  z-index: 1;
  position: relative;
}

.matching-status-text {
  font-family: 'Sora', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.matching-sub-text {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.matching-level-badge {
  display: inline-block;
  padding: 5px 14px;
  background: #f0f4ff;
  border: 1px solid #c7d7fc;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4f46e5;
  text-transform: capitalize;
  margin-bottom: 1.5rem;
}

.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #15803d;
  margin-bottom: 2rem;
}

.online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  animation: onlinePulse 1.5s ease-in-out infinite;
}

@keyframes onlinePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.cancel-btn {
  padding: 10px 28px;
  background: white;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}
.cancel-btn:hover { border-color: #f44336; color: #f44336; background: #fff5f5; }

/* ============================================================
   PRE-CALL VIEW — partner profile reveal before call starts
   ============================================================ */
.precall-overlay {
  position: fixed;
  inset: 0;
  z-index: 7777;
  background: #0d0d1a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.precall-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 40%, rgba(79,142,247,0.12) 0%, transparent 55%),
              radial-gradient(ellipse at 70% 60%, rgba(124,58,237,0.12) 0%, transparent 55%);
  pointer-events: none;
}

.precall-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: precallReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

@keyframes precallReveal {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.precall-matched-tag {
  font-family: 'Sora', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #a78bfa;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.precall-matched-tag::before,
.precall-matched-tag::after {
  content: '';
  display: block;
  width: 30px;
  height: 1px;
  background: rgba(167,139,250,0.4);
}

/* Partner Avatar */
.precall-avatar-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 1.5rem;
}

.precall-avatar-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #4f8ef7, #7c3aed, #4f8ef7);
  animation: avatarSpin 4s linear infinite;
}

@keyframes avatarSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.precall-avatar-inner {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: #0d0d1a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1;
}

.precall-avatar-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.precall-avatar-initial {
  font-family: 'Sora', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
}

/* Partner name */
.precall-name {
  font-family: 'Sora', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

/* Info chips */
.precall-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 1rem 0 1.5rem;
}

.precall-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 13px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  border: 1px solid;
}

.precall-chip.country { background: rgba(79,142,247,0.12); border-color: rgba(79,142,247,0.3); color: #93c5fd; }
.precall-chip.language { background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.3); color: #c4b5fd; }
.precall-chip.level { background: rgba(5,150,105,0.12); border-color: rgba(5,150,105,0.3); color: #6ee7b7; }

/* Conversation starter */
.precall-starter {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 2rem;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
}

.precall-starter strong {
  display: block;
  color: rgba(255,255,255,0.35);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

/* Countdown ring */
.precall-countdown-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.countdown-svg {
  transform: rotate(-90deg);
}

.countdown-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 3; }
.countdown-fg { fill: none; stroke-width: 3; stroke-linecap: round; transition: stroke-dashoffset 0.9s linear, stroke 0.3s; }

.countdown-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Sora', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
}

.precall-countdown-container {
  position: relative;
  width: 70px;
  height: 70px;
}

.precall-start-btn {
  background: linear-gradient(135deg, #4f8ef7, #7c3aed);
  color: white;
  border: none;
  padding: 13px 32px;
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(79,142,247,0.4);
}
.precall-start-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,142,247,0.5); }

.precall-cancel-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  font-size: 0.82rem;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.2s;
}
.precall-cancel-btn:hover { color: rgba(255,255,255,0.6); }

/* ============================================================
   VIDEO CALL — enhanced status + timer + disconnect
   ============================================================ */
.video-call-interface { display: flex; flex-direction: column; height: 80vh; gap: 1rem; padding: 1rem; position: relative; }
.video-container { position: relative; flex: 1; background: #1a1a1a; border-radius: 12px; overflow: hidden; min-height: 400px; display: flex; justify-content: center; align-items: center; }
.video-element { width: 100%; height: 100%; object-fit: cover; }
.video-element.local { position: absolute; bottom: 20px; right: 20px; width: 150px; height: 200px; border: 2px solid white; border-radius: 8px; z-index: 10; object-fit: cover; background: #333; }
.call-controls { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
.control-btn { background: #f44336; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }

/* Timer overlay */
.timer-overlay {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  padding: 7px 18px;
  border-radius: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 5;
  border: 1px solid rgba(255,255,255,0.1);
  transition: background 0.4s;
}

.timer-display {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: color 0.4s;
}

.timer-display.normal { color: #ffffff; }
.timer-display.warning { color: #fbbf24; }
.timer-display.critical { color: #f87171; animation: timerPulse 1s ease-in-out infinite; }

@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

/* Connection status badge */
.status-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  z-index: 20;
  backdrop-filter: blur(6px);
  transition: background 0.4s, border-color 0.4s;
  border: 1px solid transparent;
}

.status-badge.connected {
  background: rgba(16,185,129,0.2);
  border-color: rgba(16,185,129,0.4);
  color: #6ee7b7;
}
.status-badge.connecting {
  background: rgba(251,191,36,0.2);
  border-color: rgba(251,191,36,0.3);
  color: #fcd34d;
}
.status-badge.failed, .status-badge.disconnected {
  background: rgba(239,68,68,0.2);
  border-color: rgba(239,68,68,0.3);
  color: #fca5a5;
}
.status-badge.new, .status-badge.closed {
  background: rgba(156,163,175,0.2);
  border-color: rgba(156,163,175,0.2);
  color: #d1d5db;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.status-badge.connected .status-dot { background: #10b981; }
.status-badge.connecting .status-dot { background: #f59e0b; animation: onlinePulse 1s infinite; }
.status-badge.failed .status-dot, .status-badge.disconnected .status-dot { background: #ef4444; }
.status-badge.new .status-dot, .status-badge.closed .status-dot { background: #9ca3af; }

/* Disconnection overlay */
.disconnect-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 40;
  border-radius: 12px;
  text-align: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.disconnect-overlay h3 {
  font-family: 'Sora', sans-serif;
  color: white;
  font-size: 1.3rem;
  margin: 1rem 0 0.5rem;
}
.disconnect-overlay p { color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 2rem; }

.reconnect-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.disconnect-end-btn {
  padding: 10px 28px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.disconnect-end-btn:hover { background: #dc2626; }

/* Rating Modal */
.rating-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 50; border-radius: 12px; color: white; text-align: center; }
.rating-buttons { display: flex; gap: 1rem; margin-top: 2rem; }
.rating-btn { padding: 1rem 2rem; font-size: 1.2rem; border-radius: 8px; border: none; cursor: pointer; transition: transform 0.2s; }
.rating-btn.good { background: #10b981; color: white; }
.rating-btn.meh { background: #6b7280; color: white; }
.rating-btn:hover { transform: scale(1.05); }

/* Mobile */
@media (max-width: 768px) {
  .app-header-content { flex-direction: column; gap: 1rem; }
  .user-info { flex-direction: column; }
  .auth-box { margin: 1rem; width: auto; }
  .profile-section { padding: 1.5rem; width: auto; margin: 1rem; }
  .video-element.local { width: 50px !important; height: 75px !important; bottom: 10px !important; right: 10px !important; }
  .slide-headline { font-size: 1.4rem; }
  .precall-name { font-size: 1.5rem; }
  .precall-card { padding: 0 0.5rem; }
}
`;

// --- Icons ---
const Icon = ({ children, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', ...style }}>
    {children}
  </svg>
);
const PhoneOff = ({ style }) => <Icon style={style}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></Icon>;
const Clock = ({ style }) => <Icon style={style}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const Star = ({ style }) => <Icon style={style}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
const Upload = ({ style }) => <Icon style={style}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Icon>;

// ============================================================
// ONBOARDING SLIDER
// ============================================================
function OnboardingSlider({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const stars = useRef(Array.from({ length: 40 }, (_, i) => ({
    id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`, size: Math.random() > 0.7 ? 3 : 2,
  }))).current;

  const goTo = (idx) => { if (idx !== current) setCurrent(idx); };
  const next = () => current < ONBOARDING_SLIDES.length - 1 ? goTo(current + 1) : onComplete();
  const slide = ONBOARDING_SLIDES[current];
  const isLast = current === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-bg-gradient" />
      <div className="onboarding-stars">
        {stars.map(s => <div key={s.id} className="onboarding-star" style={{ top: s.top, left: s.left, animationDelay: s.delay, width: s.size, height: s.size }} />)}
      </div>
      <button className="onboarding-skip" onClick={onComplete}>Skip</button>
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Chatter3" />
        </div>
        <div className="slides-wrapper">
          <div className="slides-track" style={{ transform: `translateX(-${current * 100}%)` }}>
            {ONBOARDING_SLIDES.map(s => (
              <div key={s.id} className="slide">
                <span className="slide-tag" style={{ background: `${s.accentColor}22`, color: s.accentColor, border: `1px solid ${s.accentColor}44` }}>{s.tag}</span>
                <div className="slide-emoji-wrap" style={{ background: `linear-gradient(135deg, ${s.accentColor}33, ${s.accentColor}11)`, boxShadow: `0 0 40px ${s.accentColor}33` }}>
                  <span>{s.emoji}</span>
                </div>
                <h2 className="slide-headline">{s.headline}</h2>
                <p className="slide-body">{s.body}</p>
                {s.note && <p className="slide-note">* {s.note}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="onboarding-dots">
          {ONBOARDING_SLIDES.map((s, i) => (
            <button key={s.id} className={`onboarding-dot ${i === current ? 'active' : ''}`} style={{ width: i === current ? 24 : 6 }} onClick={() => goTo(i)} />
          ))}
        </div>
        <button className="onboarding-cta" onClick={next} style={{ background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}cc)`, color: 'white', boxShadow: `0 4px 20px ${slide.accentColor}55` }}>
          {isLast ? '🚀 Start Talking' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE GATE MODAL
// ============================================================
function ProfileCompletionModal({ user, onComplete, onDismiss }) {
  const [country, setCountry] = useState(user.country || '');
  const [nativeLanguage, setNativeLanguage] = useState(user.native_language || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!country.trim() || !nativeLanguage.trim()) { setError('Both fields are required to find a match.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/user/update`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, nickname: user.nickname, english_level: user.english_level, bio: user.bio, avatar_url: user.avatar_url, country: country.trim(), native_language: nativeLanguage.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, country: country.trim(), native_language: nativeLanguage.trim() };
        localStorage.setItem('chatter3_user', JSON.stringify(updated));
        onComplete(updated);
      } else { setError('Failed to save. Please try again.'); }
    } catch (e) { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="profile-gate-overlay">
      <div className="profile-gate-card">
        <div className="profile-gate-icon">🌍</div>
        <h2>One quick thing…</h2>
        <p>Tell us where you're from and your native language. We use this to find you better conversation partners.</p>
        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
        <input className="profile-gate-input" placeholder="Country of origin (e.g. Japan)" value={country} onChange={e => setCountry(e.target.value)} />
        <input className="profile-gate-input" placeholder="Native language (e.g. Japanese)" value={nativeLanguage} onChange={e => setNativeLanguage(e.target.value)} />
        <button className="profile-gate-submit" onClick={handleSave} disabled={loading}>{loading ? 'Saving…' : 'Save & Find a Partner →'}</button>
        <button onClick={onDismiss} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem' }}>Maybe later</button>
      </div>
    </div>
  );
}

// ============================================================
// PRE-CALL VIEW — partner profile reveal + countdown
// ============================================================
function PreCallView({ session, onStart, onCancel }) {
  const COUNTDOWN_FROM = 5;
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const partner = session.partner || {};
  const displayName = partner.nickname || partner.username || 'Your partner';
  const flag = getFlag(partner.country);
  const starterTip = STARTERS[Math.floor(Math.random() * STARTERS.length)](displayName);

  // Countdown → auto start
  useEffect(() => {
    playSound('match');
  }, []);

  useEffect(() => {
    if (countdown <= 0) { onStart(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // SVG ring values
  const R = 28;
  const CIRC = 2 * Math.PI * R; // ~175.9
  const progress = countdown / COUNTDOWN_FROM;
  const dashOffset = CIRC * (1 - progress);
  const strokeColor = countdown > 2 ? '#4f8ef7' : countdown > 1 ? '#f59e0b' : '#ef4444';

  const levelLabel = { beginner: '🟢 Beginner', intermediate: '🟡 Intermediate', advanced: '🔵 Advanced' };

  return (
    <div className="precall-overlay">
      <div className="precall-bg" />
      <div className="precall-card">
        <div className="precall-matched-tag">You've been matched</div>

        {/* Partner avatar */}
        <div className="precall-avatar-wrap">
          <div className="precall-avatar-ring" />
          <div className="precall-avatar-inner">
            {partner.avatar_url
              ? <img src={partner.avatar_url} alt={displayName} />
              : <span className="precall-avatar-initial">{displayName.charAt(0).toUpperCase()}</span>
            }
          </div>
        </div>

        <h2 className="precall-name">{displayName}</h2>

        {/* Info chips */}
        <div className="precall-chips">
          {partner.country && (
            <span className="precall-chip country">{flag} {partner.country}</span>
          )}
          {partner.native_language && (
            <span className="precall-chip language">🗣️ {partner.native_language}</span>
          )}
          {partner.english_level && (
            <span className="precall-chip level">{levelLabel[partner.english_level] || partner.english_level}</span>
          )}
        </div>

        {/* Conversation starter */}
        <div className="precall-starter">
          <strong>💡 Conversation Starter</strong>
          {starterTip}
        </div>

        {/* Countdown ring + start button */}
        <div className="precall-countdown-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
            <div className="precall-countdown-container">
              <svg width="70" height="70" className="countdown-svg">
                <circle className="countdown-bg" cx="35" cy="35" r={R} />
                <circle
                  className="countdown-fg"
                  cx="35" cy="35" r={R}
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  stroke={strokeColor}
                />
              </svg>
              <span className="countdown-center" style={{ color: strokeColor }}>{countdown}</span>
            </div>
            <button className="precall-start-btn" onClick={onStart}>Start Now →</button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', margin: '0.75rem 0 0' }}>
            Call starts automatically in {countdown}s
          </p>
        </div>

        <button className="precall-cancel-btn" onClick={onCancel}>↩ Go back to search</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [callStartedAt, setCallStartedAt] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileGate, setShowProfileGate] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('chatter3_user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setView('dashboard');
      checkActiveSession(u.id);
    }
  }, []);

  const checkActiveSession = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/matching/session/${userId}`);
      const data = await res.json();
      if (data.active_session) {
        setCurrentSession(data.session);
        setCallStartedAt(Date.now());
        setView('video');
      }
    } catch (e) {}
  };

  const refreshUserData = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, ...data.user };
        localStorage.setItem('chatter3_user', JSON.stringify(updated));
        setUser(updated);
      }
    } catch (e) {}
  };

  const handleLoginSuccess = (u) => {
    localStorage.setItem('chatter3_user', JSON.stringify(u));
    setUser(u);
    setView('dashboard');
    if (!localStorage.getItem('chatter3_onboarding_seen')) setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('chatter3_onboarding_seen', '1');
    setShowOnboarding(false);
  };

  const handleLogout = async () => {
    if (user) {
      try {
        await fetch(`${API_URL}/api/matching/leave`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id }) });
      } catch (e) {}
    }
    localStorage.removeItem('chatter3_user');
    setUser(null);
    setView('auth');
  };

  const handleFindPartner = () => {
    if (!user) return;
    if (!user.country || !user.native_language) { setShowProfileGate(true); return; }
    setView('matching');
  };

  const handleProfileGateComplete = (updatedUser) => {
    setUser(updatedUser);
    setShowProfileGate(false);
    setView('matching');
  };

  // Called from MatchingView when a session is found → go to pre-call
  const handleMatch = (session) => {
    setCurrentSession(session);
    setView('precall');
  };

  // Called from PreCallView when user clicks Start (or countdown ends)
  const handleCallStart = () => {
    setCallStartedAt(Date.now());
    setView('video');
  };

  // Called from PreCallView "go back" — end the session and return to matching
  const handlePreCallCancel = async () => {
    if (currentSession) {
      try {
        await fetch(`${API_URL}/api/matching/end`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: currentSession.id, user_id: user.id, reason: 'cancelled' })
        });
      } catch (e) {}
    }
    setCurrentSession(null);
    setView('matching');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-container">
        <style>{STYLES}</style>

        {showOnboarding && <OnboardingSlider onComplete={handleOnboardingComplete} />}

        {showProfileGate && user && (
          <ProfileCompletionModal user={user} onComplete={handleProfileGateComplete} onDismiss={() => setShowProfileGate(false)} />
        )}

        {view === 'auth' && <AuthView onLogin={handleLoginSuccess} />}

        {view !== 'auth' && (
          <header className="app-header">
            <div className="app-header-content">
              <div className="logo-container">
                <img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Chatter3" className="header-logo-img" />
              </div>
              {user && (
                <div className="user-info">
                  <span>Welcome, {user.nickname || user.username}</span>
                  <span style={{ color: '#4285f4', fontWeight: 'bold' }}>{user.points} PTS</span>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </header>
        )}

        <main className="app-content">
          {view === 'dashboard' && user && (
            <DashboardView user={user} onNavigate={setView} onFindPartner={handleFindPartner} />
          )}
          {view === 'matching' && user && (
            <MatchingView user={user} onCancel={() => setView('dashboard')} onMatch={handleMatch} />
          )}
          {view === 'precall' && user && currentSession && (
            <PreCallView session={currentSession} onStart={handleCallStart} onCancel={handlePreCallCancel} />
          )}
          {view === 'video' && user && currentSession && (
            <VideoRoomView user={user} session={currentSession} callStartedAt={callStartedAt} onEnd={() => { setCurrentSession(null); setCallStartedAt(null); refreshUserData(user.id); setView('dashboard'); }} />
          )}
          {view === 'profile' && user && (
            <ProfileView user={user} onBack={() => setView('dashboard')} onUpdate={(u) => { setUser(u); localStorage.setItem('chatter3_user', JSON.stringify(u)); }} onLogout={handleLogout} onShowOnboarding={() => setShowOnboarding(true)} />
          )}
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

// ============================================================
// AUTH VIEW
// ============================================================
function AuthView({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '', english_level: 'beginner', country: '', native_language: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}${isRegistering ? '/api/auth/register' : '/api/auth/login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) onLogin(data.user); else setError(data.error || 'Authentication failed');
    } catch { setError('Network error.'); } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (cr) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: cr.credential }) });
      const data = await res.json();
      if (data.success) onLogin(data.user); else setError(data.error || 'Google auth failed');
    } catch { setError('Network error during Google Login'); } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Chatter3" className="auth-logo" />
          <p className="auth-subtitle">Master English with native speakers</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="register-form">
          {isRegistering && (
            <>
              <div className="form-group"><label>Username</label><input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required /></div>
              <div className="form-group"><label>Country of Origin</label><input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} required placeholder="e.g. Japan" /></div>
              <div className="form-group"><label>Native Language</label><input type="text" value={formData.native_language} onChange={e => setFormData({ ...formData, native_language: e.target.value })} required placeholder="e.g. Japanese" /></div>
              <div className="form-group"><label>English Level</label>
                <select value={formData.english_level} onChange={e => setFormData({ ...formData, english_level: e.target.value })}>
                  <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required /></div>
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}</button>
        </form>
        <div className="auth-divider">or</div>
        <div className="google-button-container">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign In was unsuccessful.')} />
        </div>
        <button className="auth-link" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Sign In' : 'New to Chatter3? Create Account'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD VIEW
// ============================================================
function DashboardView({ user, onNavigate, onFindPartner }) {
  return (
    <div className="dashboard-container">
      <div className="welcome-message">
        <h2>Ready to start a conversation?</h2>
        <p>Your English practice journey begins here!</p>
        <button onClick={onFindPartner} className="start-matching-btn">Find a Conversation Partner</button>
        <div className="user-stats">
          <h3>Your Stats</h3>
          <div className="stat-item"><span>Balance</span><span style={{ fontWeight: 'bold', color: '#4285f4' }}>{user.points} PTS</span></div>
          <div className="stat-item"><span>Level</span><span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{user.english_level}</span></div>
          <div className="stat-item"><span>Call Duration</span><span>{user.english_level === 'beginner' ? '5 mins' : '10 mins'}</span></div>
          <button onClick={() => onNavigate('profile')} style={{ marginTop: '1rem', padding: '10px', width: '100%', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
            Profile and Conversation History
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MATCHING VIEW — sonar animation + online count
// ============================================================
function MatchingView({ user, onCancel, onMatch }) {
  const [status, setStatus] = useState('Looking for a partner...');
  const [isMatched, setIsMatched] = useState(false);
  const [onlineStats, setOnlineStats] = useState({ searching: 0, in_call: 0 });

  // Fetch online stats once on mount
  useEffect(() => {
    fetch(`${API_URL}/api/stats/online`)
      .then(r => r.json())
      .then(d => setOnlineStats({ searching: d.searching || 0, in_call: d.in_call || 0 }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let polling;
    const performSearch = async () => {
      try {
        if (!isMatched) {
          const joinRes = await fetch(`${API_URL}/api/matching/join`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, english_level: user.english_level })
          });
          const joinData = await joinRes.json();
          if (joinData.matched) { setIsMatched(true); setStatus('Partner found!'); }
        }
        const sessRes = await fetch(`${API_URL}/api/matching/session/${user.id}`);
        const sessData = await sessRes.json();
        if (sessData.active_session) {
          clearInterval(polling);
          setStatus('Connecting…');
          onMatch(sessData.session);
        }
      } catch { setStatus('Connection error. Retrying…'); }
    };
    performSearch();
    polling = setInterval(performSearch, 3000);
    return () => clearInterval(polling);
  }, [isMatched]);

  const handleCancel = async () => {
    try {
      await fetch(`${API_URL}/api/matching/leave`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id }) });
    } catch {}
    onCancel();
  };

  const totalOnline = onlineStats.searching + onlineStats.in_call;

  return (
    <div className="matching-screen">
      {/* Sonar animation */}
      <div className="sonar-container">
        <div className="sonar-ring" />
        <div className="sonar-ring" />
        <div className="sonar-ring" />
        <div className="sonar-core">🔍</div>
      </div>

      <p className="matching-status-text">{status}</p>
      <p className="matching-sub-text">Finding you a <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user.english_level}</span> level partner…</p>

      <div className="matching-level-badge">
        📊 {user.english_level} · {user.english_level === 'beginner' ? '5 min' : '10 min'} sessions
      </div>

      {totalOnline > 0 && (
        <div className="online-badge">
          <span className="online-dot" />
          {onlineStats.searching > 1 ? `${onlineStats.searching} people searching now` : onlineStats.in_call > 0 ? `${totalOnline} people online` : 'Searching…'}
        </div>
      )}

      <button onClick={handleCancel} className="cancel-btn">Cancel Search</button>
    </div>
  );
}

// ============================================================
// VIDEO ROOM VIEW — color-coded status, timer states, disconnect overlay
// ============================================================
function VideoRoomView({ user, session, callStartedAt, onEnd }) {
  const totalDuration = (session.english_level === 'beginner' ? 300 : 600);
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [connectionStatus, setConnectionStatus] = useState('new');
  const [showRating, setShowRating] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [error, setError] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localCandidatesQueue = useRef([]);
  const remoteCandidatesQueue = useRef([]);
  const negotiatingRef = useRef(false);
  const streamRef = useRef(null);
  const disconnectTimerRef = useRef(null);

  const cleanupMedia = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
  };

  useEffect(() => {
    const initConnection = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ice-servers`);
        const iceData = await res.json();
        startCall(iceData.iceServers || [{ urls: 'stun:stun.l.google.com:19302' }]);
      } catch {
        startCall([{ urls: 'stun:stun.l.google.com:19302' }]);
      }
    };

    const startCall = async (iceServers) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        remoteStreamRef.current = new MediaStream();
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;

        const pc = new RTCPeerConnection({ iceServers });
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          const s = event.streams?.[0] || remoteStreamRef.current;
          if (!event.streams?.[0]) remoteStreamRef.current.addTrack(event.track);
          if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = s; remoteVideoRef.current.play().catch(() => {}); }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const payload = JSON.stringify({ type: 'candidate', candidate: event.candidate });
            wsRef.current?.readyState === WebSocket.OPEN ? wsRef.current.send(payload) : localCandidatesQueue.current.push(payload);
          }
        };

        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          setConnectionStatus(state);
          if (state === 'connected') {
            playSound('start');
            clearTimeout(disconnectTimerRef.current);
            setShowDisconnect(false);
          }
          if (state === 'disconnected' || state === 'failed') {
            // Show disconnect overlay after 3s grace period
            disconnectTimerRef.current = setTimeout(() => setShowDisconnect(true), 3000);
          }
        };
        pcRef.current = pc;

        const ws = new WebSocket(`${WS_URL}/api/signal?sessionId=${session.id}`);
        wsRef.current = ws;

        ws.onopen = async () => {
          setConnectionStatus('checking');
          while (localCandidatesQueue.current.length > 0) ws.send(localCandidatesQueue.current.shift());
          ws.send(JSON.stringify({ type: 'join' }));
        };

        ws.onmessage = async (msg) => {
          const data = JSON.parse(msg.data);
          if (data.type === 'bye') { cleanupMedia(); playSound('end'); setShowRating(true); }
          else if (data.type === 'join') {
            ws.send(JSON.stringify({ type: 'join_ack' }));
            if (user.id === session.user1_id && !negotiatingRef.current) startNegotiation();
          }
          else if (data.type === 'join_ack') {
            if (user.id === session.user1_id && !negotiatingRef.current) startNegotiation();
          }
          else if (data.type === 'offer') {
            negotiatingRef.current = true;
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            processRemoteCandidates();
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
          }
          else if (data.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            processRemoteCandidates();
          }
          else if (data.type === 'candidate') {
            const candidate = new RTCIceCandidate(data.candidate);
            pc.remoteDescription?.type ? await pc.addIceCandidate(candidate) : remoteCandidatesQueue.current.push(candidate);
          }
        };

        const startNegotiation = async () => {
          negotiatingRef.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
        };

      } catch (err) { setError('Could not access camera/microphone'); }
    };

    const processRemoteCandidates = async () => {
      if (!pcRef.current) return;
      while (remoteCandidatesQueue.current.length > 0) {
        try { await pcRef.current.addIceCandidate(remoteCandidatesQueue.current.shift()); } catch {}
      }
    };

    const handleBeforeUnload = () => {
      wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ type: 'bye' }));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Timer based on callStartedAt (passed from PreCallView confirmation)
    const startTime = callStartedAt || Date.now();
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalDuration - elapsed);
      setTimeLeft(remaining);
      return remaining;
    };
    updateTimer();
    initConnection();

    const timer = setInterval(() => {
      const remaining = updateTimer();
      if (remaining <= 0) handleHangup();
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(disconnectTimerRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleHangup = async () => {
    wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ type: 'bye' }));
    try {
      await fetch(`${API_URL}/api/matching/end`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, user_id: user.id, reason: 'hangup' })
      });
    } catch {}
    playSound('end');
    cleanupMedia();
    setShowRating(true);
  };

  const handleRate = async (rating) => {
    try {
      const res = await fetch(`${API_URL}/api/matching/rate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, user_id: user.id, rating })
      });
      const data = await res.json();
      if (data.points_awarded) { playSound('points'); alert(`You earned ${data.points_awarded} points!`); }
      else alert("Rating submitted. Points will be awarded when your partner rates you.");
    } catch {}
    onEnd();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Timer color state
  const timerClass = timeLeft > 60 ? 'normal' : timeLeft > 30 ? 'warning' : 'critical';

  // Status badge label + class
  const STATUS_MAP = {
    new: { label: 'Initializing', cls: 'new' },
    checking: { label: 'Connecting…', cls: 'connecting' },
    connecting: { label: 'Connecting…', cls: 'connecting' },
    connected: { label: 'Connected', cls: 'connected' },
    disconnected: { label: 'Reconnecting…', cls: 'disconnected' },
    failed: { label: 'Connection failed', cls: 'failed' },
    closed: { label: 'Ended', cls: 'closed' },
  };
  const statusInfo = STATUS_MAP[connectionStatus] || STATUS_MAP.new;

  if (error) return (
    <div className="matching-screen">
      <p style={{ color: 'red' }}>{error}</p>
      <button onClick={onEnd} className="cancel-btn">Go Back</button>
    </div>
  );

  return (
    <div className="video-call-interface">
      <div className="video-container">
        <video ref={remoteVideoRef} autoPlay playsInline className="video-element" />
        <video ref={localVideoRef} autoPlay playsInline muted className="video-element local" />

        {/* Timer overlay */}
        <div className="timer-overlay">
          <Clock style={{ width: 15, height: 15, stroke: timerClass === 'normal' ? 'white' : timerClass === 'warning' ? '#fbbf24' : '#f87171', flexShrink: 0 }} />
          <span className={`timer-display ${timerClass}`}>{formatTime(timeLeft)}</span>
        </div>

        {/* Connection status badge */}
        <div className={`status-badge ${statusInfo.cls}`}>
          <span className="status-dot" />
          {statusInfo.label}
        </div>

        {/* Disconnection overlay */}
        {showDisconnect && !showRating && (
          <div className="disconnect-overlay">
            <div className="reconnect-spinner" />
            <h3>Connection Lost</h3>
            <p>Trying to reconnect to your partner…</p>
            <button className="disconnect-end-btn" onClick={handleHangup}>End Call</button>
          </div>
        )}

        {/* Rating overlay */}
        {showRating && (
          <div className="rating-overlay">
            <h2>Rate your partner</h2>
            <p>How was your conversation with {session.partner?.username}?</p>
            <div className="rating-buttons">
              <button className="rating-btn good" onClick={() => handleRate('good')}>
                <Star style={{ width: 18, height: 18, marginRight: 6 }} /> Good
              </button>
              <button className="rating-btn meh" onClick={() => handleRate('meh')}>Meh</button>
            </div>
          </div>
        )}
      </div>

      {!showRating && (
        <div className="call-controls">
          <div>
            <p style={{ fontSize: '0.85rem', color: '#999', margin: 0 }}>Talking to</p>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{session.partner?.username}</p>
            {session.partner?.country && (
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '2px 0 0' }}>
                {getFlag(session.partner.country)} {session.partner.country}
              </p>
            )}
          </div>
          <button onClick={handleHangup} className="control-btn">
            <PhoneOff style={{ width: 18, height: 18 }} /> End Call
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROFILE VIEW
// ============================================================
function ProfileView({ user, onBack, onUpdate, onLogout, onShowOnboarding }) {
  const [formData, setFormData] = useState({
    nickname: user.nickname || user.username || '',
    country: user.country || '',
    native_language: user.native_language || '',
    english_level: user.english_level || 'beginner',
    bio: user.bio || '',
    avatar_url: user.avatar_url || ''
  });
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/user/history`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id }) })
      .then(r => r.json()).then(d => { if (d.success) setHistory(d.history); });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) { const r = Math.min(MAX / width, MAX / height); width = Math.round(width * r); height = Math.round(height * r); }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        setFormData(prev => ({ ...prev, avatar_url: canvas.toDataURL('image/jpeg', 0.75) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const res = await fetch(`${API_URL}/api/user/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, ...formData }) });
    const data = await res.json();
    if (data.success) {
      const updated = { ...user, ...data.user };
      localStorage.setItem('chatter3_user', JSON.stringify(updated));
      onUpdate(updated);
      alert('Profile Saved!');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="auth-header"><h2>Edit Profile</h2></div>
      <div className="profile-section">
        <div className="profile-avatar">
          {formData.avatar_url
            ? <img src={formData.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" />
            : (formData.nickname || user.username).charAt(0).toUpperCase()
          }
        </div>
        <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} ref={fileInputRef} />
          <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
            <Upload style={{ width: 14, height: 14, marginRight: 4 }} /> Upload Picture
          </button>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0' }}>Auto-compressed to optimize upload size.</p>
        </div>
        <div className="form-group"><label>Nickname / Display Name</label><input value={formData.nickname} onChange={e => setFormData({ ...formData, nickname: e.target.value })} /></div>
        <div className="form-group"><label>Country of Origin</label><input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="e.g. Japan" /></div>
        <div className="form-group"><label>Native Language</label><input value={formData.native_language} onChange={e => setFormData({ ...formData, native_language: e.target.value })} placeholder="e.g. Japanese" /></div>
        <div className="form-group"><label>English Level</label>
          <select value={formData.english_level} onChange={e => setFormData({ ...formData, english_level: e.target.value })}>
            <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
          </select>
        </div>
        <button className="save-btn" onClick={handleSave}>Save Profile</button>
        <button onClick={onShowOnboarding} style={{ marginTop: '10px', padding: '10px', width: '100%', background: '#f0f4ff', border: '1px solid #c7d7fc', borderRadius: '4px', cursor: 'pointer', color: '#4f46e5', fontSize: '0.95rem' }}>
          👋 View App Introduction Again
        </button>
        <button onClick={onBack} style={{ marginTop: '10px', padding: '10px', width: '100%', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
      </div>

      <div className="history-list">
        <h3>Recent Conversations</h3>
        {history.length === 0 && <p style={{ color: '#999' }}>No calls yet. Find a partner to get started!</p>}
        {history.map(h => (
          <div key={h.id} className="history-item">
            <div>
              <strong>{h.partner_name || 'Unknown'}</strong><br />
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(h.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
              {h.duration ? Math.floor(h.duration / 60) + 'm' : 'Incomplete'}
            </div>
            <div className="history-avatar">
              {h.partner_avatar ? <img src={h.partner_avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} alt="" /> : (h.partner_name || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

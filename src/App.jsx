import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// --- Configuration ---
const API_URL = 'https://api.chatter3.com'; 
const WS_URL = 'wss://api.chatter3.com';
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";
const LOGO_URL = "https://i.postimg.cc/Z5qYw3Hs/service-logo.png";

// --- RESTORED SOUNDS ---
const SOUNDS = {
  match: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', 
  start: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', 
  end: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',   
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' 
};

const playSound = (type) => {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Catch browser autoplay blocks
  } catch (e) { console.error("Sound error", e); }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth'); 
  const [session, setSession] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('chatter3_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('chatter3_user', JSON.stringify(userData));
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chatter3_user');
    setView('auth');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* CENTRAL LAYOUT ENGINE: 
          Using min-height and flex-center on the body wrapper 
      */}
      <div style={{ 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Centers horizontally
        justifyContent: (view === 'auth') ? 'center' : 'flex-start', // Vertical center for login
        margin: 0
      }}>
        
        {/* HEADER */}
        {user && view !== 'call' && (
          <header style={{ 
            width: '100%', backgroundColor: 'white', borderBottom: '1px solid #ddd', 
            padding: '10px 0', display: 'flex', justifyContent: 'center', marginBottom: '30px' 
          }}>
            <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={LOGO_URL} alt="Logo" style={{ height: '35px' }} />
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Chatter3</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#4285f4', fontWeight: 'bold' }}>{user.points} PTS</span>
                <button onClick={handleLogout} style={{ cursor: 'pointer', padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc' }}>Logout</button>
              </div>
            </div>
          </header>
        )}

        <main style={{ width: '100%', maxWidth: (view === 'call') ? '900px' : '420px', padding: '20px', boxSizing: 'border-box' }}>
          {view === 'auth' && <AuthView onLogin={handleLogin} />}
          {view === 'dashboard' && <DashboardView user={user} onNavigate={setView} />}
          {view === 'matching' && <MatchingView user={user} onCancel={() => setView('dashboard')} onMatch={(s) => { playSound('match'); setSession(s); setView('call'); }} />}
          {view === 'call' && <VideoRoomView user={user} session={session} onEnd={() => { playSound('end'); setSession(null); setView('dashboard'); }} />}
          {view === 'profile' && <ProfileView user={user} onBack={() => setView('dashboard')} onUpdate={(u) => { setUser(u); localStorage.setItem('chatter3_user', JSON.stringify(u)); }} />}
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

// --- VIEWS ---

function AuthView({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '', country: '', native_language: '', english_level: 'beginner' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) onLogin(data.user); else setError(data.error);
  };

  return (
    <div style={{ background: 'white', padding: '35px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <img src={LOGO_URL} alt="Logo" style={{ height: '70px', marginBottom: '15px' }} />
      <h2 style={{ margin: '0 0 20px 0' }}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        {isRegistering && (
          <>
            <input placeholder="Username" style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={e => setFormData({...formData, username: e.target.value})} />
            <input placeholder="Country" style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={e => setFormData({...formData, country: e.target.value})} />
            <input placeholder="Native Language" style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={e => setFormData({...formData, native_language: e.target.value})} />
          </>
        )}
        <input placeholder="Email" style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <button type="submit" style={{ width: '100%', padding: '14px', background: '#4285f4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {isRegistering ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div style={{ margin: '20px 0' }}>OR</div>
      <GoogleLogin onSuccess={(res) => console.log(res)} />

      <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#4285f4', cursor: 'pointer' }}>
        {isRegistering ? 'Have an account? Login' : 'New here? Register'}
      </button>
    </div>
  );
}

// Note: VideoRoomView and MatchingView are similar to before but with playSound calls 
// during the signaling 'join' and 'bye' events.
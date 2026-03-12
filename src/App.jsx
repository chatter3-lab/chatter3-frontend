import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.chatter3.com'; 
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://api.chatter3.com';
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";

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
      {/* Outer wrapper: Ensures everything is centered in the viewport */}
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        minHeight: '100vh', 
        width: '100vw', 
        backgroundColor: '#f9f9f9', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        margin: 0,
        padding: 0,
        overflowX: 'hidden'
      }}>
        
        {/* HEADER / LOGO */}
        {user && view !== 'call' && (
          <header style={{ width: '100%', backgroundColor: 'white', borderBottom: '1px solid #eee', padding: '10px 0', marginBottom: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="https://i.postimg.cc/Z5qYw3Hs/service-logo.png" alt="Chatter3" style={{ height: '40px' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>Chatter3</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#4285f4', fontWeight: 'bold' }}>{user.points} PTS</span>
                <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area: Centered horizontally */}
        <main style={{ width: '100%', maxWidth: '450px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
          {view === 'auth' && <AuthView onLogin={handleLogin} />}
          {view === 'dashboard' && <DashboardView user={user} onNavigate={setView} />}
          {view === 'matching' && <MatchingView user={user} onCancel={() => setView('dashboard')} onMatch={(s) => { setSession(s); setView('call'); }} />}
          {view === 'call' && <VideoRoomView user={user} session={session} onEnd={() => { setSession(null); setView('dashboard'); }} />}
          {view === 'profile' && <ProfileView user={user} onBack={() => setView('dashboard')} onUpdate={(u) => { setUser(u); localStorage.setItem('chatter3_user', JSON.stringify(u)); }} />}
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

function AuthView({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '', english_level: 'beginner', country: '', native_language: '' });
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: 'google_user', google_token: credentialResponse.credential }) 
      });
      const data = await res.json();
      if (data.success) onLogin(data.user);
    } catch (err) { setError('Google Login failed'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) onLogin(data.user);
      else setError(data.error || 'Authentication failed');
    } catch (err) { setError('Network error.'); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
      
      {/* SERVICE LOGO REPLACED HERE */}
      <img src="https://i.postimg.cc/Z5qYw3Hs/service-logo.png" alt="Chatter3" style={{ height: '80px', marginBottom: '15px' }} />
      
      <h2 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>{isRegistering ? 'Join Chatter3' : 'Welcome Back'}</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Connect, Speak, Earn.</p>

      {error && <div style={{ color: '#d93025', backgroundColor: '#fdecea', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        {isRegistering && (
          <>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.9rem', color: '#555' }}>Username</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}/></div>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.9rem', color: '#555' }}>Country</label><input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}/></div>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.9rem', color: '#555' }}>Native Language</label><input type="text" value={formData.native_language} onChange={e => setFormData({...formData, native_language: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}/></div>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.9rem', color: '#555' }}>English Level</label>
               <select value={formData.english_level} onChange={e => setFormData({...formData, english_level: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}>
                 <option value="beginner">Beginner</option>
                 <option value="intermediate">Intermediate</option>
                 <option value="advanced">Advanced</option>
               </select>
            </div>
          </>
        )}
        <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.9rem', color: '#555' }}>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}/></div>
        <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '0.9rem', color: '#555' }}>Password</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}/></div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#4285f4', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
        <span style={{ color: '#999', fontSize: '0.8rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Auth Failed')} />
      </div>
      
      <button onClick={() => setIsRegistering(!isRegistering)} style={{ width: '100%', marginTop: '20px', background: 'none', border: 'none', color: '#4285f4', cursor: 'pointer', fontSize: '0.9rem' }}>
        {isRegistering ? 'Already have an account? Sign In' : 'New to Chatter3? Create Account'}
      </button>
    </div>
  );
}
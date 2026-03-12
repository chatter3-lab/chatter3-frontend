import React, { useState, useEffect, useRef } from 'react';

// Use env vars or fallback to hardcoded for local testing
const API_URL = import.meta.env.VITE_API_URL || 'https://api.chatter3.com'; 
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://api.chatter3.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth'); 
  const [session, setSession] = useState(null);

  // Initialize from LocalStorage
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
    <div className="app-container">
      {user && view !== 'call' && (
        <header className="app-header">
          <div className="app-header-content">
             <div className="logo-container">
               <span className="logo-text">Chatter3</span>
             </div>
             <div className="user-info">
               <span>{user.username}</span>
               <span style={{color: '#4285f4', fontWeight: 'bold'}}>{user.points} PTS</span>
               <button onClick={handleLogout}>Logout</button>
             </div>
          </div>
        </header>
      )}

      <main className="app-content">
        {view === 'auth' && <AuthView onLogin={handleLogin} />}
        {view === 'dashboard' && <DashboardView user={user} onNavigate={setView} />}
        {view === 'matching' && <MatchingView user={user} onCancel={() => setView('dashboard')} onMatch={(s) => { setSession(s); setView('call'); }} />}
        {view === 'call' && <VideoRoomView user={user} session={session} onEnd={() => { setSession(null); setView('dashboard'); }} />}
        {view === 'profile' && <ProfileView user={user} onBack={() => setView('dashboard')} onUpdate={(u) => { setUser(u); localStorage.setItem('chatter3_user', JSON.stringify(u)); }} />}
      </main>
    </div>
  );
}

// --- VIEWS ---

function AuthView({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  // ADDED: country and native_language to state
  const [formData, setFormData] = useState({ email: '', password: '', username: '', english_level: 'beginner', country: '', native_language: '' });
  const [error, setError] = useState('');

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
    <div className="auth-container" style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>
      <div className="auth-box" style={{background:'white', padding:'2rem', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'400px'}}>
        <h2 style={{textAlign:'center'}}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        {error && <div style={{color:'red', marginBottom:'1rem'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div className="form-group"><label>Username</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={{width:'100%', padding:'8px', margin:'5px 0'}}/></div>
              <div className="form-group"><label>Country of Origin</label><input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required style={{width:'100%', padding:'8px', margin:'5px 0'}}/></div>
              <div className="form-group"><label>Native Language</label><input type="text" value={formData.native_language} onChange={e => setFormData({...formData, native_language: e.target.value})} required style={{width:'100%', padding:'8px', margin:'5px 0'}}/></div>
              <div className="form-group"><label>English Level</label>
                 <select value={formData.english_level} onChange={e => setFormData({...formData, english_level: e.target.value})} style={{width:'100%', padding:'8px', margin:'5px 0'}}>
                   <option value="beginner">Beginner</option>
                   <option value="intermediate">Intermediate</option>
                   <option value="advanced">Advanced</option>
                 </select>
              </div>
            </>
          )}
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{width:'100%', padding:'8px', margin:'5px 0'}}/></div>
          <div className="form-group"><label>Password</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{width:'100%', padding:'8px', margin:'5px 0'}}/></div>
          
          <button type="submit" disabled={loading} style={{width:'100%', padding:'10px', background:'#4285f4', color:'white', border:'none', borderRadius:'4px', marginTop:'10px'}}>
            {loading ? 'Loading...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <button onClick={() => setIsRegistering(!isRegistering)} style={{width:'100%', marginTop:'15px', background:'none', border:'none', color:'#4285f4', cursor:'pointer'}}>
          {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}

function DashboardView({ user, onNavigate }) {
  return (
    <div style={{textAlign: 'center', marginTop: '50px'}}>
      <h2>Ready to start a conversation?</h2>
      <button onClick={() => onNavigate('matching')} style={{padding:'12px 24px', background:'#4285f4', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'16px'}}>Find a Partner</button>
      <div style={{marginTop:'30px'}}>
         <button onClick={() => onNavigate('profile')} style={{padding:'10px 20px', background:'#eee', border:'1px solid #ccc', borderRadius:'4px', cursor:'pointer'}}>Edit Profile & History</button>
      </div>
    </div>
  );
}

function MatchingView({ user, onCancel, onMatch }) {
  const [status, setStatus] = useState('Looking for a partner...');
  const [isMatched, setIsMatched] = useState(false);

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
            if (joinData.matched) { setIsMatched(true); setStatus('Partner found! Preparing session...'); }
        }
        const sessRes = await fetch(`${API_URL}/api/matching/session/${user.id}`);
        const sessData = await sessRes.json();
        if (sessData.active_session) {
            clearInterval(polling);
            setStatus('Connecting...');
            onMatch(sessData.session);
        }
      } catch (e) { setStatus('Retrying...'); }
    };
    performSearch();
    polling = setInterval(performSearch, 3000);
    return () => clearInterval(polling);
  }, [isMatched]);

  const handleCancel = async () => {
    await fetch(`${API_URL}/api/matching/leave`, { method: 'POST', body: JSON.stringify({ user_id: user.id }) });
    onCancel();
  };

  return (
    <div style={{textAlign: 'center', marginTop: '100px'}}>
      <h2>{status}</h2>
      <button onClick={handleCancel} style={{padding:'10px', background:'#f44336', color:'white', border:'none', borderRadius:'4px'}}>Cancel</button>
    </div>
  );
}

function VideoRoomView({ user, session, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(session.english_level === 'beginner' ? 300 : 600);
  const [showRating, setShowRating] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const initConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        const res = await fetch(`${API_URL}/api/ice-servers`);
        const { iceServers } = await res.json();
        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;

        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };

        const ws = new WebSocket(`${WS_URL}/api/signal?sessionId=${session.id}`);
        wsRef.current = ws;

        pc.onicecandidate = (e) => {
          if (e.candidate && ws.readyState === WebSocket.OPEN) {
             ws.send(JSON.stringify({ type: 'candidate', candidate: e.candidate }));
          }
        };

        ws.onopen = () => ws.send(JSON.stringify({ type: 'join' }));

        ws.onmessage = async (msg) => {
          const data = JSON.parse(msg.data);
          // BUG FIX: Receive the 'bye' broadcast and clean up immediately
          if (data.type === 'bye') {
             triggerEndSequence();
          } else if (data.type === 'join') {
             ws.send(JSON.stringify({ type: 'join_ack' }));
             if (user.id === session.user1_id) {
               const offer = await pc.createOffer();
               await pc.setLocalDescription(offer);
               ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
             }
          } else if (data.type === 'join_ack') {
             if (user.id === session.user1_id) {
               const offer = await pc.createOffer();
               await pc.setLocalDescription(offer);
               ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
             }
          } else if (data.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
          } else if (data.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          } else if (data.type === 'candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        };
      } catch (e) { console.error(e); }
    };
    initConnection();
    
    const timer = setInterval(() => {
       setTimeLeft(prev => {
         if (prev <= 1) { clearInterval(timer); handleHangup(); return 0; }
         return prev - 1;
       });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const cleanupMedia = () => {
    if (localVideoRef.current?.srcObject) localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
    if (pcRef.current) pcRef.current.close();
    if (wsRef.current) wsRef.current.close();
  };

  const triggerEndSequence = () => {
    cleanupMedia();
    setShowRating(true);
  };

  const handleHangup = async () => {
    // BUG FIX: Send the bye signal, wait 100ms for it to transmit, then cleanup.
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
       wsRef.current.send(JSON.stringify({ type: 'bye' }));
    }
    
    await fetch(`${API_URL}/api/matching/end`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id })
    });
    
    setTimeout(() => {
      triggerEndSequence();
    }, 100);
  };

  const handleRate = async (rating) => {
    await fetch(`${API_URL}/api/matching/rate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, user_id: user.id, rating })
    });
    onEnd();
  };

  if (showRating) return (
    <div style={{textAlign:'center', marginTop:'100px'}}>
      <h2>Rate your conversation</h2>
      <button onClick={() => handleRate('good')} style={{padding:'10px', background:'#10b981', color:'white', marginRight:'10px'}}>Good (2 pts)</button>
      <button onClick={() => handleRate('meh')} style={{padding:'10px', background:'#6b7280', color:'white'}}>Meh (1 pt)</button>
    </div>
  );

  return (
    <div style={{position: 'relative', width: '100%', height: '80vh', background: '#222', display:'flex', flexDirection:'column'}}>
      <div style={{color:'white', textAlign:'center', padding:'10px'}}>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      <video ref={remoteVideoRef} autoPlay playsInline style={{flex:1, objectFit:'cover'}} />
      <video ref={localVideoRef} autoPlay playsInline muted style={{position:'absolute', bottom:'20px', right:'20px', width:'150px', height:'200px', objectFit:'cover', border:'2px solid white'}} />
      <button onClick={handleHangup} style={{position:'absolute', bottom:'20px', left:'50%', transform:'translateX(-50%)', padding:'15px 30px', background:'#f44336', color:'white', border:'none', borderRadius:'30px', cursor:'pointer'}}>End Call</button>
    </div>
  );
}

function ProfileView({ user, onBack, onUpdate }) {
  const [formData, setFormData] = useState({
    nickname: user.nickname || user.username || '',
    country: user.country || '',
    native_language: user.native_language || '',
    english_level: user.english_level || 'beginner'
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/user/history`, {
       method: 'POST', headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ user_id: user.id })
    }).then(r => r.json()).then(d => { if(d.success) setHistory(d.history); });
  }, []);

  const handleSave = async () => {
    const res = await fetch(`${API_URL}/api/user/update`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, ...formData })
    });
    const data = await res.json();
    if(data.success) { onUpdate(data.user); alert("Saved!"); }
  };

  return (
    <div style={{maxWidth: '600px', margin: '20px auto', background:'white', padding:'20px', borderRadius:'8px'}}>
      <h2>Profile</h2>
      <div className="form-group"><label>Nickname</label><input value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} style={{width:'100%', padding:'8px'}}/></div>
      <div className="form-group"><label>Country</label><input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} style={{width:'100%', padding:'8px'}}/></div>
      <div className="form-group"><label>Native Language</label><input value={formData.native_language} onChange={e => setFormData({...formData, native_language: e.target.value})} style={{width:'100%', padding:'8px'}}/></div>
      <button onClick={handleSave} style={{padding:'10px', background:'#4285f4', color:'white', border:'none', width:'100%', marginTop:'10px'}}>Save Settings</button>
      <button onClick={onBack} style={{padding:'10px', width:'100%', marginTop:'10px'}}>Back</button>

      <h3 style={{marginTop:'30px'}}>History</h3>
      {history.map(h => (
         <div key={h.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
            <span>{h.partner_name || 'Unknown'} - {new Date(h.created_at).toLocaleDateString()}</span>
            <span>{h.duration ? Math.floor(h.duration / 60) + 'm' : '0m'}</span>
         </div>
      ))}
    </div>
  );
}
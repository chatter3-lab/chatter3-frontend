import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';

const API_URL = 'https://api.chatter3.com';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      setAuthError('Authentication failed');
    }
  };

  const handleEmailRegister = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError('Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return (
      <GoogleOAuthProvider clientId="935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com">
        <div className="auth-container">
          <div className="auth-box">
            <h1>💬 Welcome to Chatter3</h1>
            <p>Practice English with native speakers</p>
            
            {authError && <div className="error-message">{authError}</div>}
            
            {!showRegister ? (
              <>
                <div className="google-button-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setAuthError('Google login failed')}
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>
                <div className="auth-divider">or</div>
                <button 
                  onClick={() => setShowRegister(true)}
                  className="email-register-btn"
                >
                  Sign up with Email
                </button>
              </>
            ) : (
              <EmailRegisterForm 
                onSubmit={handleEmailRegister}
                onBack={() => setShowRegister(false)}
              />
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // Main app after authentication
  return (
    <div className="app">
      <header className="app-header">
        <h1>💬 Chatter3</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <span>Points: {user.points}</span>
          <span>Level: {user.english_level}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <main>
        <div className="welcome-message">
          <h2>Ready to start a conversation?</h2>
          <p>Your English practice journey begins here!</p>
          <button className="start-matching-btn">
            Find a Conversation Partner
          </button>
        </div>
      </main>
    </div>
  );
}

// Email Registration Form Component
function EmailRegisterForm({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    english_level: 'beginner'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h3>Create Account</h3>
      
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Username:</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>English Level:</label>
        <select
          value={formData.english_level}
          onChange={(e) => setFormData({...formData, english_level: e.target.value})}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      <button type="submit">Register</button>
      <button type="button" onClick={onBack} className="back-button">
        Back to Google Sign In
      </button>
    </form>
  );
}

export default App;
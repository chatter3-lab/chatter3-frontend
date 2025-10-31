import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';

const API_URL = 'https://api.chatter3.com';

// Login Form Component for existing users
function LoginForm({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Enter your password"
          required
        />
      </div>
      
      <button type="submit">Login with Email</button>
      <button type="button" onClick={onSwitchToRegister} className="switch-auth-btn">
        Don't have an account? Sign up
      </button>
    </form>
  );
}

// Email Registration Form Component
function EmailRegisterForm({ onSubmit, onBack, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    english_level: 'beginner'
  });

  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordError('');
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
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Confirm Password:</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
        {passwordError && <div className="password-error">{passwordError}</div>}
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
      <button type="button" onClick={onSwitchToLogin} className="switch-auth-btn">
        Already have an account? Login
      </button>
    </form>
  );
}

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
      console.log('Google auth response:', credentialResponse);
      
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
      console.log('Backend response:', data);
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      setAuthError('Authentication failed - check console for details');
    }
  };

  const handleGoogleError = () => {
    setAuthError('Google login failed');
  };

  const handleEmailLogin = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Login failed - please try again');
    }
  };

  const handleEmailRegister = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          english_level: formData.english_level
        }),
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
            {/* Chatter3 Logo */}
            <div className="logo-container">
              <img 
                src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" 
                alt="Chatter3 Logo" 
                className="app-logo"
              />
            </div>
            <h1>Welcome to Chatter3</h1>
            <p>Practice English with native speakers</p>
            
            {authError && <div className="error-message">{authError}</div>}
            
            {!showRegister ? (
              <>
                <div className="google-button-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="filled_blue"
                    size="large"
                    text="continue_with"
                  />
                </div>
                <div className="auth-divider">or</div>
                
                {/* Login Form for Existing Users */}
                <LoginForm 
                  onLogin={handleEmailLogin}
                  onSwitchToRegister={() => setShowRegister(true)}
                />
              </>
            ) : (
              <EmailRegisterForm 
                onSubmit={handleEmailRegister}
                onBack={() => {
                  setShowRegister(false);
                  setAuthError('');
                }}
                onSwitchToLogin={() => setShowRegister(false)}
              />
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // Main app after authentication
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <div className="header-logo">
            <img 
              src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" 
              alt="Chatter3 Logo" 
              className="header-logo-img"
            />
            <h1>Chatter3</h1>
          </div>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <span>Points: {user.points}</span>
            <span>Level: {user.english_level}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
      
      <main className="app-content">
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

export default App;
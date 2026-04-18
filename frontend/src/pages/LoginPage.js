import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const themeStorageKey = 'app-theme';
  const [role, setRole] = useState('admin');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(themeStorageKey) === 'dark');

  useEffect(() => {
    localStorage.setItem(themeStorageKey, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        role,
        name,
        code
      });

      onLoginSuccess(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş xətası baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${isDarkMode ? 'login-dark-theme' : ''}`}>
      <div className="login-background-glow login-background-glow-left" />
      <div className="login-background-glow login-background-glow-right" />
      <div className="login-card">
        <div className="login-topbar">
          <div>
            <p className="login-eyebrow">Kargo System</p>
            <h1>Hesabına daxil ol</h1>
          </div>
          <button
            type="button"
            className="login-theme-toggle"
            onClick={() => setIsDarkMode((currentValue) => !currentValue)}
          >
            <span>{isDarkMode ? '☀' : '☾'}</span>
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        <div className="login-intro">
          <strong>Modern SaaS giriş paneli</strong>
          <p>Admin, mağaza və ya kuryer hesabınızla təhlükəsiz şəkildə davam edin.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="role">Rol Seçin:</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="input"
            >
              <option value="admin">Admin</option>
              <option value="store">Mağaza</option>
              <option value="courier">Kuryer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Ad:</label>
            <input 
              type="text" 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınızı daxil edin"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Kod:</label>
            <input 
              type="password" 
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Kodu daxil edin"
              className="input"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Yüklənir...' : 'Giriş'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

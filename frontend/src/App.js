import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StoreDashboard from './pages/StoreDashboard';
import CourierDashboard from './pages/CourierDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route 
          path="/admin" 
          element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/store" 
          element={user && user.role === 'store' ? <StoreDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/courier" 
          element={user && user.role === 'courier' ? <CourierDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/" 
          element={user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;

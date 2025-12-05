import React, { useState } from 'react';
import { login, logout, selectIsAuthenticated } from '../../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuthenticated);
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = await dispatch(login({ email, password }));
    if (login.fulfilled.match(r)) {
      nav('/chatinfo'); // wohin nach Login
    } else {
      alert('Login fehlgeschlagen');
    }
  }

  if (isAuth) {
    return (
      <div style={{ maxWidth: 360, margin: '2rem auto' }}>
        <p>Bereits eingeloggt.</p>
        <button
          onClick={async () => {
            await dispatch(logout());
            nav('/login');
          }}
          style={{ marginTop: 12, width: '100%' }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: '2rem auto' }}>
      <h3>Login</h3>
      <label style={{ display: 'block', marginTop: 12 }}>
        E-Mail
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%' }}
          autoFocus
        />
      </label>
      <label style={{ display: 'block', marginTop: 12 }}>
        Passwort
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%' }}
        />
      </label>
      <button type="submit" style={{ marginTop: 16, width: '100%' }}>
        Einloggen
      </button>
    </form>
  );
};

export default LoginPage;

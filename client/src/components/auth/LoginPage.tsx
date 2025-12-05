import './LoginPage.css';

import type { AppDispatch, RootState } from '../../store/store';
import React, { useState } from 'react';
import {
  login,
  logout,
  selectAuthUser,
  selectIsAuthenticated,
} from '../../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = await dispatch(login({ email, password }));
    if (login.fulfilled.match(r)) {
      nav('/login');
    } else {
      alert('Login fehlgeschlagen');
    }
  }

  if (isAuth) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h3 className="auth-title">
            {user?.userName
              ? `Hallo, ${user.userName}`
              : user?.email
                ? `Hallo, ${user.email}`
                : 'Bereits eingeloggt'}
          </h3>
          <div className="auth-actions">
            <button
              className="btn btn-secondary"
              onClick={() => nav('/chatinfo')}
            >
              Weiter zur Chatinfo
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await dispatch(logout());
                nav('/login');
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h3 className="auth-title">Login</h3>

        {error ? <div className="auth-error">{error}</div> : null}

        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            className="auth-input"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoFocus
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            className="auth-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="auth-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            Einloggen
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;

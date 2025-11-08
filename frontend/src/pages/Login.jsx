import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Login.css';

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      onLoggedIn?.(res.user);
      navigate('/');
    } catch (error) {
      setErr(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={submit} noValidate>
        <h2 className="auth__title">Login</h2>

        {err && <div className="auth__error">{err}</div>}

        <label htmlFor="email" className="auth__label">
          Email
        </label>
        <input
          id="email"
          className="input"
          type="email"
          placeholder="you@university.edu"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" className="auth__label">
          Password
        </label>
        <input
          id="password"
          className="input"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="button button--primary auth__submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth__hint">
          New here?{' '}
          <a className="link" href="/register">
            Create an account
          </a>
        </p>
      </form>
    </main>
  );
}

Login.propTypes = {
  onLoggedIn: PropTypes.func,
};

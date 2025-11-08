import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Register.css';

export default function Register({ onRegistered }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    major: '',
    gradYear: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        ...form,
        gradYear: Number(form.gradYear || 0),
      });
      onRegistered?.(res.user);
      navigate('/');
    } catch (error) {
      setErr(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={submit} noValidate>
        <h2 className="auth__title">Register</h2>

        {err && <div className="auth__error">{err}</div>}

        <label htmlFor="username" className="auth__label">
          Username
        </label>
        <input
          id="username"
          className="input"
          value={form.username}
          onChange={(e) => update('username', e.target.value)}
          required
        />

        <label htmlFor="email" className="auth__label">
          Email (.edu required)
        </label>
        <input
          id="email"
          className="input"
          type="email"
          placeholder="you@university.edu"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
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
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          required
        />

        <div className="auth__row">
          <div>
            <label htmlFor="major" className="auth__label">
              Major
            </label>
            <input
              id="major"
              className="input"
              value={form.major}
              onChange={(e) => update('major', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="gradYear" className="auth__label">
              Graduation Year
            </label>
            <input
              id="gradYear"
              className="input"
              type="number"
              min="1900"
              max="2100"
              value={form.gradYear}
              onChange={(e) => update('gradYear', e.target.value)}
            />
          </div>
        </div>

        <button
          className="button button--primary auth__submit"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth__hint">
          Already have an account?{' '}
          <a className="link" href="/login">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}

Register.propTypes = {
  onRegistered: PropTypes.func,
};

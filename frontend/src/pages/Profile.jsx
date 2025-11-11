// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import './Profile.css';

function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {action}
    </div>
  );
}
EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  action: PropTypes.node,
};

export default function Profile() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  // local UI state
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('updated');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg('');

        // 1) who am I?
        const { userId } = await api.get('/api/auth/me');
        if (!alive) return;

        if (!userId) {
          navigate('/login');
          return;
        }

        // Fetch user + listings in parallel
        const [userRes, listingsRes] = await Promise.all([
          api.get(`/api/users/${userId}`),
          // Prefer dedicated route; if it 404s, we’ll try providerId below
          api
            .get('/api/services/mine')
            .catch(() =>
              api.get(`/api/services?providerId=${encodeURIComponent(userId)}`)
            ),
        ]);
        if (!alive) return;

        setMe(userRes.user || null);

        // handle shape { items, total, ... } or plain array
        const items = Array.isArray(listingsRes)
          ? listingsRes
          : listingsRes.items || [];
        setMine(items);
      } catch (e) {
        // Handle auth errors cleanly
        if (e?.message && /401|403/i.test(e.message)) {
          navigate('/login');
          return;
        }
        // Show a compact banner, not raw error text in the page flow
        setErrMsg('Could not load your profile or listings.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const filtered = useMemo(() => {
    let arr = mine;
    const v = (q || '').trim().toLowerCase();
    if (v) {
      arr = arr.filter(
        (s) =>
          s.title?.toLowerCase().includes(v) ||
          s.description?.toLowerCase().includes(v) ||
          s.category?.toLowerCase().includes(v) ||
          s.location?.toLowerCase().includes(v)
      );
    }
    if (sort === 'updated') {
      arr = [...arr].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0)
      );
    } else if (sort === 'rateAsc') {
      arr = [...arr].sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    } else if (sort === 'rateDesc') {
      arr = [...arr].sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    }
    return arr;
  }, [mine, q, sort]);

  return (
    <div className="profile">
      {/* Inline banner if something failed */}
      {errMsg && <div className="alert">{errMsg}</div>}

      <section className="profile__header">
        {loading ? (
          <div className="skeleton skeleton--profile" />
        ) : me ? (
          <div className="profile__card">
            <div className="avatar" aria-hidden="true">
              {me.username?.[0]?.toUpperCase()}
            </div>
            <div className="profile__meta">
              <h2>{me.username}</h2>
              <p className="muted">{me.email}</p>
              <p className="muted">
                {me.major ? `${me.major}` : '—'}{' '}
                {me.gradYear ? `• Class of ${me.gradYear}` : ''}
              </p>
              {me.isVerified && <span className="badge">Verified Student</span>}
            </div>
          </div>
        ) : null}
      </section>

      <section className="profile__listings">
        <header className="profile__toolbar">
          <h3>My Listings</h3>
          <div className="toolbar__controls">
            <input
              className="input"
              placeholder="Filter my listings…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Filter my listings"
            />
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort"
            >
              <option value="updated">Recently updated</option>
              <option value="rateAsc">Rate: Low → High</option>
              <option value="rateDesc">Rate: High → Low</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="grid">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No listings yet"
            subtitle="Create your first service on the Home page."
            action={
              <Link to="/" className="btn btn--primary">
                Create a Service
              </Link>
            }
          />
        ) : (
          <div className="grid">
            {filtered.map((svc) => (
              <ServiceCard
                key={svc._id}
                service={svc}
                hideActions // ⟵ add this line
                onClick={() => (window.location.href = `/services/${svc._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// src/pages/ServiceList.jsx
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import ServiceCard from '../components/ServiceCard';

export default function ServiceList({
  query,
  category,
  min,
  max,
  refreshId = 0,
}) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (category) p.set('category', category);
    if (min) p.set('min', min);
    if (max) p.set('max', max);
    p.set('page', '1');
    p.set('limit', '12');
    return p.toString();
  }, [query, category, min, max]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr('');
      setLoading(true);
      try {
        const data = await api.get(`/api/services?${qs}`); // NOTE: /api/services
        if (!cancelled) setItems(data.items || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Failed to load services');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qs, refreshId]); // 👈 refetch when refreshId changes

  if (loading) {
    return (
      <div className="grid">
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
      </div>
    );
  }

  if (err) return <div className="alert">{err}</div>;
  if (!items.length)
    return <div className="text-weak">No results. Try different filters.</div>;

  return (
    <div className="grid">
      {items.map((svc) => (
        <ServiceCard
          key={svc._id}
          service={svc}
          onClick={() => (window.location.href = `/services/${svc._id}`)}
        />
      ))}
    </div>
  );
}

ServiceList.propTypes = {
  query: PropTypes.string,
  category: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refreshId: PropTypes.number,
};

// src/pages/ServiceList.jsx
import { useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import ServiceCard from '../components/ServiceCard';

export default function ServiceList({
  query,
  category,
  school,
  min,
  max,
  page = 1,
  limit = 20,
  refreshId = 0,
  providerFilter,
}) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (category) p.set('category', category);
    if (school) p.set('location', school);
    if (min) p.set('min', min);
    if (max) p.set('max', max);
    if (providerFilter) p.set('providerId', providerFilter);
    p.set('page', String(page));
    p.set('limit', String(limit));
    return p.toString();
  }, [query, category, school, min, max, providerFilter, page, limit]);

  // Track previous query string (filters) to detect filter changes
  const prevQs = useRef(qs);

  // Helper to parse query string into object (excluding page)
  function parseQs(qs) {
    const params = new URLSearchParams(qs);
    const obj = {};
    for (const [key, value] of params.entries()) {
      if (key !== 'page') obj[key] = value;
    }
    return JSON.stringify(obj);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr('');
      setLoading(true);
      try {
        const data = await api.get(`/api/services?${qs}`);
        if (!cancelled) {
          // Compare filters robustly (ignore page param)
          const filters = parseQs(qs);
          const prevFilters = parseQs(prevQs.current);
          if (filters !== prevFilters) {
            setItems(data.items || []);
            prevQs.current = qs;
          } else if (page > 1) {
            setItems((old) => [...old, ...(data.items || [])]);
            prevQs.current = qs;
          } else {
            setItems(data.items || []);
            prevQs.current = qs;
          }
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Failed to load services');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qs, page, refreshId]);

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
        <ServiceCard key={svc._id} service={svc} />
      ))}
    </div>
  );
}

ServiceList.propTypes = {
  query: PropTypes.string,
  category: PropTypes.string,
  school: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  page: PropTypes.number,
  limit: PropTypes.number,
  refreshId: PropTypes.number,
  providerFilter: PropTypes.string,
};

import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import Loading from '../components/Loading';
import './ServiceList.css';

export default function ServiceList({
  query = '',
  category = '',
  min = '',
  max = '',
  onSelect,
}) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const params = useMemo(() => {
    const p = { q: query, page: 1, limit: 12 };
    if (category) p.category = category;
    if (min !== '') p.min = min;
    if (max !== '') p.max = max;
    return p;
  }, [query, category, min, max]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr('');
    api
      .get('/services', params)
      .then((res) => {
        if (alive) setData(res || { items: [], total: 0 });
      })
      .catch((e) => {
        if (alive) setErr(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [params]);

  if (loading) return <Loading label="Loading services…" />;
  if (err)
    return (
      <p className="error" role="alert">
        {err}
      </p>
    );
  if (!data.items.length) return <p>No services found.</p>;

  return (
    <div className="svcList">
      {data.items.map((s) => (
        <ServiceCard key={s._id} service={s} onClick={onSelect} />
      ))}
    </div>
  );
}
ServiceList.propTypes = {
  query: PropTypes.string,
  category: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelect: PropTypes.func,
};

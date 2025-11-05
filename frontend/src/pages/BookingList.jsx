import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import BookingCard from '../components/BookingCard';
import Loading from '../components/Loading';
import './BookingsList.css';

export default function BookingsList({
  role = 'customer',
  status = '',
  page = 1,
  limit = 10,
  onSelect,
}) {
  const [data, setData] = useState({ bookings: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const params = useMemo(() => {
    const p = { role, page, limit };
    if (status) p.status = status;
    return p;
  }, [role, status, page, limit]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr('');
    api
      .get('/bookings', params)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((e) => {
        if (alive) setErr(e.message);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [params]);

  if (loading) return <Loading label="Loading bookings…" />;
  if (err)
    return (
      <p className="error" role="alert">
        {err}
      </p>
    );
  if (!data.bookings.length) return <p>No bookings.</p>;

  return (
    <div className="bkList">
      {data.bookings.map((b) => (
        <BookingCard key={b._id} booking={b} onClick={onSelect} />
      ))}
    </div>
  );
}

BookingsList.propTypes = {
  role: PropTypes.oneOf(['customer', 'provider']),
  status: PropTypes.string,
  page: PropTypes.number,
  limit: PropTypes.number,
  onSelect: PropTypes.func,
};

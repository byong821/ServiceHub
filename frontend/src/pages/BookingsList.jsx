import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import BookingCard from '../components/BookingCard';
import Loading from '../components/Loading';
import './BookingsList.css';

export default function BookingsList({ role, status, onSelect }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    const params = {};
    if (role) params.role = role;
    if (status) params.status = status;

    const query = new URLSearchParams(params).toString();
    api
      .get(`/api/bookings${query ? `?${query}` : ''}`)
      .then((res) => {
        if (alive) setBookings(res.bookings || []);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [role, status]);

  if (loading) return <Loading label="Loading bookings..." />;
  if (error)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  if (!bookings.length) return <p>No bookings found.</p>;

  return (
    <div className="bookingsList">
      {bookings.map((booking) => (
        <BookingCard key={booking._id} booking={booking} onClick={onSelect} />
      ))}
    </div>
  );
}

BookingsList.propTypes = {
  role: PropTypes.oneOf(['customer', 'provider']),
  status: PropTypes.oneOf(['pending', 'confirmed', 'completed', 'cancelled']),
  onSelect: PropTypes.func,
};

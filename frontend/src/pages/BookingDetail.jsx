import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import Loading from '../components/Loading';
import './BookingDetail.css';

export default function BookingDetail({ id, userRole }) {
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setError('');

    api
      .get(`/api/bookings/${id}`)
      .then((res) => {
        if (alive) setBooking(res.booking);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/api/bookings/${id}/status`, { status: newStatus });
      setBooking({ ...booking, status: newStatus });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/api/bookings/${id}/messages`, {
        text: message,
      });
      setBooking({
        ...booking,
        messages: [...(booking.messages || []), res.message],
      });
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!booking && !error) return <Loading label="Loading booking..." />;
  if (error)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  if (!booking) return null;

  return (
    <div className="bookingDetail">
      <header className="bookingDetail__header">
        <h2>Booking Details</h2>
        <span className={`status status--${booking.status}`}>
          {booking.status}
        </span>
      </header>

      <section className="bookingDetail__info">
        <p>
          <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Time:</strong> {booking.time}
        </p>
        <p>
          <strong>Duration:</strong> {booking.duration} hours
        </p>
        <p>
          <strong>Total Price:</strong> ${booking.totalPrice}
        </p>
      </section>

      {userRole === 'provider' && booking.status === 'pending' && (
        <div className="bookingDetail__actions">
          <button
            onClick={() => updateStatus('confirmed')}
            disabled={loading}
            className="btn-confirm"
          >
            Accept
          </button>
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={loading}
            className="btn-cancel"
          >
            Decline
          </button>
        </div>
      )}

      {userRole === 'provider' && booking.status === 'confirmed' && (
        <div className="bookingDetail__actions">
          <button
            onClick={() => updateStatus('completed')}
            disabled={loading}
            className="btn-complete"
          >
            Mark Complete
          </button>
        </div>
      )}

      {userRole === 'customer' && booking.status === 'pending' && (
        <div className="bookingDetail__actions">
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={loading}
            className="btn-cancel"
          >
            Cancel Booking
          </button>
        </div>
      )}

      <section className="bookingDetail__messages">
        <h3>Messages</h3>
        <div className="messages">
          {booking.messages?.length ? (
            booking.messages.map((msg, idx) => (
              <div key={idx} className="message">
                <p>{msg.text}</p>
                <small>{new Date(msg.timestamp).toLocaleString()}</small>
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>

        <form onSubmit={sendMessage} className="messageForm">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !message.trim()}>
            Send
          </button>
        </form>
      </section>
    </div>
  );
}

BookingDetail.propTypes = {
  id: PropTypes.string.isRequired,
  userRole: PropTypes.oneOf(['customer', 'provider']).isRequired,
};

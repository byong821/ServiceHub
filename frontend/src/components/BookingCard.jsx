import PropTypes from 'prop-types';
import './BookingCard.css';

export default function BookingCard({ booking, onClick }) {
  const statusColors = {
    pending: '#ffc107',
    confirmed: '#28a745',
    completed: '#6c757d',
    cancelled: '#dc3545',
  };

  return (
    <article
      className="bookingCard"
      onClick={() => onClick?.(booking)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(booking)}
    >
      <header className="bookingCard__header">
        <h3>{booking.serviceTitle || 'Service'}</h3>
        <span
          className="bookingCard__status"
          style={{ backgroundColor: statusColors[booking.status] }}
        >
          {booking.status}
        </span>
      </header>
      <div className="bookingCard__details">
        <p>
          <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Time:</strong> {booking.time}
        </p>
        <p>
          <strong>Duration:</strong> {booking.duration}h
        </p>
        <p>
          <strong>Total:</strong> ${booking.totalPrice}
        </p>
      </div>
    </article>
  );
}

BookingCard.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    serviceTitle: PropTypes.string,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    totalPrice: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func,
};

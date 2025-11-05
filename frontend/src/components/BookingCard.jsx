import PropTypes from 'prop-types';
import './BookingCard.css';

export default function BookingCard({ booking, onClick }) {
  return (
    <article
      className="bkCard"
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(booking)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(booking)}
    >
      <header className="bkCard__header">
        <h4 className="bkCard__title">
          {new Date(booking.date).toLocaleDateString()} • {booking.time}
        </h4>
        <span className={`bkCard__status bkCard__status--${booking.status}`}>
          {booking.status}
        </span>
      </header>
      <p className="bkCard__meta">
        Duration: {booking.duration}h • Service: {String(booking.serviceId)} •
        Provider: {String(booking.providerId)}
      </p>
    </article>
  );
}

BookingCard.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    serviceId: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
      .isRequired,
    providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
      .isRequired,
  }).isRequired,
  onClick: PropTypes.func,
};

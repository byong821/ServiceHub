// src/components/ServiceCard.jsx
import PropTypes from 'prop-types';
import './ServiceCard.css';

export default function ServiceCard({ service, onClick, hideActions = false }) {
  return (
    <article
      className="svcCard"
      tabIndex={0}
      onClick={() => onClick?.(service)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(service)}
    >
      <header className="svcCard__header">
        <div
          className="svcCard__rating"
          aria-label={`Rating ${service.averageRating ?? 0} of 5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} aria-hidden="true">
              {i < Math.round(service.averageRating ?? 0) ? '★' : '☆'}
            </span>
          ))}
          <span className="svcCard__ratingCount">
            ({service.reviewsCount ?? 0})
          </span>
        </div>

        <h3 className="svcCard__title">{service.title}</h3>
        {service.isEmergency && <span className="svcCard__badge">⚡</span>}
      </header>

      <p className="svcCard__desc">{service.description}</p>

      <div className="svcCard__meta">
        <span className="chip">{service.category || '—'}</span>
        <span className="svcCard__rate">${service.hourlyRate}/hr</span>
        <span className="svcCard__dot" aria-hidden="true">
          •
        </span>
        <span className="svcCard__loc">{service.location || '—'}</span>
      </div>

      {/* remove buttons on owner view */}
      {!hideActions && (
        <footer className="svcCard__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/services/${service._id}`;
            }}
          >
            View
          </button>

          <button
            type="button"
            className="btn btn--primary"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/bookings/new?serviceId=${service._id}`;
            }}
          >
            Quick book
          </button>
        </footer>
      )}
    </article>
  );
}

ServiceCard.propTypes = {
  service: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    hourlyRate: PropTypes.number.isRequired,
    location: PropTypes.string,
    isEmergency: PropTypes.bool,
    averageRating: PropTypes.number,
    reviewsCount: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
  hideActions: PropTypes.bool,
};

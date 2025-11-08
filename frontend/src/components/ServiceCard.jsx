import PropTypes from 'prop-types';
import './ServiceCard.css';

export default function ServiceCard({ service, onClick, onQuickBook }) {
  const rounded = Math.round(service.averageRating ?? 0);
  const ratingLabel =
    service.averageRating != null
      ? `Rating ${service.averageRating.toFixed(1)} of 5`
      : 'No ratings yet';

  return (
    <article
      className="serviceCard card"
      aria-labelledby={`svc-title-${service._id}`}
      onClick={(e) => {
        if (!(e.target.closest('button') || e.target.closest('a'))) {
          onClick?.(service);
        }
      }}
    >
      <header className="serviceCard__top">
        <h3 id={`svc-title-${service._id}`} className="serviceCard__title">
          {service.title}
        </h3>

        <div
          className="serviceCard__price"
          aria-label={`Price ${service.hourlyRate} dollars per hour`}
        >
          ${service.hourlyRate}/hr
        </div>
      </header>

      <div className="serviceCard__meta">
        <span className="tag">{service.category}</span>
        {service.isEmergency && (
          <span className="tag tag--danger">Emergency</span>
        )}
        <span className="serviceCard__rating" aria-label={ratingLabel}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} aria-hidden="true">
              {i < rounded ? '★' : '☆'}
            </span>
          ))}
          <span className="serviceCard__ratingCount">
            {service.averageRating != null
              ? service.averageRating.toFixed(1)
              : '–'}{' '}
            ({service.reviewsCount ?? 0})
          </span>
        </span>
        {service.location && (
          <span className="serviceCard__location">• {service.location}</span>
        )}
      </div>

      {service.description && (
        <p className="serviceCard__desc" title={service.description}>
          {service.description}
        </p>
      )}

      <footer className="serviceCard__footer">
        <a
          className="button button--subtle"
          href={`/services/${service._id}`}
          onClick={(e) => e.stopPropagation()}
        >
          View
        </a>
        <button
          type="button"
          className="button button--primary"
          onClick={(e) => {
            e.stopPropagation();
            onQuickBook?.(service);
          }}
          aria-label={`Quick book ${service.title}`}
        >
          Quick book
        </button>
      </footer>
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
  onQuickBook: PropTypes.func,
};

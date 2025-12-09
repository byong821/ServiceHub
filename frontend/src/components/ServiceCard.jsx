// src/components/ServiceCard.jsx
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

export default function ServiceCard({ service }) {
  return (
    <div className="svcCard">
      <Link to={`/services/${service._id}`} className="svcCard__link">
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
          <span className="svcCard__rate">
            {service.category === 'selling'
              ? `$${service.hourlyRate}`
              : `$${service.hourlyRate}/hr`}
          </span>
          <span className="svcCard__dot">&#8226;</span>
          <span className="svcCard__loc">{service.location}</span>
          {service.category && <span className="chip">{service.category}</span>}
        </div>
      </Link>

      {/* Provider Section */}
      <div className="svcCard__provider">
        <Link
          to={`/providers/${service.providerId}`}
          className="svcCard__providerLink"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="svcCard__providerLabel">By:</span>
          <span className="svcCard__providerName">{service.providerName}</span>
        </Link>
      </div>
    </div>
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
    providerId: PropTypes.string,
    providerName: PropTypes.string,
  }).isRequired,
};

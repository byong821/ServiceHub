import PropTypes from 'prop-types';
import './ServiceCard.css';

export default function ServiceCard({ service, onClick }) {
  return (
    <article
      className="svcCard"
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(service)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(service)}
    >
      <header className="svcCard__header">
        <h3 className="svcCard__title">{service.title}</h3>
        {service.isEmergency && <span className="svcCard__badge">⚡</span>}
      </header>
      <p className="svcCard__desc">{service.description}</p>
      <div className="svcCard__meta">
        <span>{service.category}</span>
        <span>${service.hourlyRate}/hr</span>
        <span>{service.location}</span>
      </div>
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
  }).isRequired,
  onClick: PropTypes.func,
};

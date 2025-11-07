import PropTypes from 'prop-types';
import './ReviewCard.css';

export default function ReviewCard({ review, canRespond, onRespond }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="star" aria-hidden="true">
        {i < rating ? '★' : '☆'}
      </span>
    ));
  };

  return (
    <article className="reviewCard">
      <header className="reviewCard__header">
        <div
          className="reviewCard__rating"
          aria-label={`Rating ${review.rating} of 5`}
        >
          {renderStars(review.rating)}
        </div>
        <time className="reviewCard__date">
          {new Date(review.createdAt).toLocaleDateString()}
        </time>
      </header>

      <p className="reviewCard__comment">{review.comment}</p>

      {review.providerResponse && (
        <div className="reviewCard__response">
          <strong>Provider Response:</strong>
          <p>{review.providerResponse}</p>
        </div>
      )}

      {canRespond && !review.providerResponse && (
        <button
          onClick={() => onRespond?.(review)}
          className="reviewCard__respondBtn"
        >
          Respond
        </button>
      )}
    </article>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    providerResponse: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  canRespond: PropTypes.bool,
  onRespond: PropTypes.func,
};

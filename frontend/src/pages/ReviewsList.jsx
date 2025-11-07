import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import Loading from '../components/Loading';
import './ReviewsList.css';

export default function ReviewsList({
  serviceId,
  providerId,
  canRespond,
  onRespond,
}) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    const endpoint = serviceId
      ? `/api/reviews/service/${serviceId}`
      : `/api/reviews/provider/${providerId}`;

    api
      .get(endpoint)
      .then((res) => {
        if (alive) {
          setReviews(res.reviews || []);
          if (res.averageRating !== undefined) {
            setAverageRating(res.averageRating);
          }
        }
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
  }, [serviceId, providerId]);

  if (loading) return <Loading label="Loading reviews..." />;
  if (error)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );

  return (
    <div className="reviewsList">
      {serviceId && reviews.length > 0 && (
        <div className="reviewsList__summary">
          <div className="averageRating">
            <span className="rating">{averageRating.toFixed(1)}</span>
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="star">
                  {i < Math.round(averageRating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="count">({reviews.length} reviews)</span>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            canRespond={canRespond}
            onRespond={onRespond}
          />
        ))
      )}
    </div>
  );
}

ReviewsList.propTypes = {
  serviceId: PropTypes.string,
  providerId: PropTypes.string,
  canRespond: PropTypes.bool,
  onRespond: PropTypes.func,
};

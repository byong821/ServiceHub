// src/pages/ServiceDetail.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { id } = useParams();

  const [svc, setSvc] = useState(null);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [me, setMe] = useState(null);

  // review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const canSubmit = useMemo(
    () => rating >= 1 && rating <= 5 && comment.trim().length > 0,
    [rating, comment]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr('');
        setLoading(true);

        // who am I? (silent if not logged in)
        try {
          const { userId } = await api.get('/api/auth/me');
          if (alive && userId) {
            const u = await api.get(`/api/users/${userId}`);
            if (alive) setMe(u.user ?? u);
          }
        } catch {
          // ignore; me stays null
        }

        // service (already includes providerEmail and providerName)
        const svcRes = await api.get(`/api/services/${id}`);
        if (!alive) return;
        const service = svcRes?.service ?? svcRes ?? null;
        if (!service) throw new Error('Service not found');
        setSvc(service);

        // Use provider info from service response (no separate API call needed)
        if (service.providerEmail) {
          setProvider({
            email: service.providerEmail,
            username: service.providerName,
          });
        }

        // reviews + average
        const r = await api.get(`/api/reviews/service/${id}`);
        if (!alive) return;
        setReviews(r.reviews ?? []);
        setAvg(r.averageRating ?? 0);
      } catch (e) {
        if (alive) setErr(e?.message || 'Failed to load service');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    if (!canSubmit || !svc) return;

    try {
      await api.post('/api/reviews', {
        serviceId: id,
        providerId: svc.providerId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      const r = await api.get(`/api/reviews/service/${id}`);
      setReviews(r.reviews ?? []);
      setAvg(r.averageRating ?? 0);
      setRating(5);
      setComment('');
    } catch (e) {
      const msg = e?.message || 'Could not submit review';
      if (/401|403/.test(msg)) {
        setErr('You must be signed in and have a completed booking to review.');
      } else {
        setErr(msg);
      }
    }
  }

  if (loading) return <div className="svcDetail--loading">Loading…</div>;
  if (err) return <div className="alert">{err}</div>;
  if (!svc) return null;

  return (
    <div className="svcDetail">
      <header className="svcDetail__header">
        <h1 className="svcDetail__title">{svc.title}</h1>
        <div
          className="svcDetail__rating"
          aria-label={`Average rating ${avg} of 5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} aria-hidden="true">
              {i < Math.round(avg) ? '★' : '☆'}
            </span>
          ))}
          <span className="svcDetail__ratingCount">
            ({reviews?.length ?? 0})
          </span>
        </div>
      </header>

      <p className="svcDetail__desc">{svc.description}</p>

      <dl className="svcDetail__meta">
        <div>
          <dt>Category</dt>
          <dd>{svc.category}</dd>
        </div>
        <div>
          <dt>{svc.category === 'selling' ? 'Item Price' : 'Hourly Rate'}</dt>
          <dd>
            {svc.category === 'selling'
              ? `$${svc.hourlyRate}`
              : `$${svc.hourlyRate}/hr`}
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{svc.location}</dd>
        </div>
      </dl>

      <aside className="svcDetail__contact">
        <h3>Contact me</h3>
        <p className="svcDetail__contactEmail">
          {provider?.email ? (
            <a href={`mailto:${provider.email}`}>{provider.email}</a>
          ) : (
            'Email unavailable'
          )}
        </p>
      </aside>

      <section className="svcDetail__reviews">
        <h3>Reviews</h3>

        {reviews.length === 0 ? (
          <p className="muted">No reviews yet.</p>
        ) : (
          <ul className="reviewList">
            {reviews.map((r, idx) => (
              <li key={r._id || idx} className="reviewItem">
                <div className="reviewItem__stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} aria-hidden="true">
                      {i < r.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <p>{r.comment}</p>
                <span className="reviewItem__date">
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Show form only if logged in */}
        {me ? (
          <form className="reviewForm" onSubmit={submitReview}>
            <label className="reviewForm__label">Your rating</label>
            <select
              className="select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>

            <label className="reviewForm__label" htmlFor="comment">
              Your review
            </label>
            <textarea
              id="comment"
              className="textarea"
              placeholder="Share your experience…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button className="button button--primary" disabled={!canSubmit}>
              Post review
            </button>
          </form>
        ) : (
          <div className="muted" style={{ marginTop: 12 }}>
            <a href="/login">Sign in</a> to leave a review.
          </div>
        )}
      </section>
    </div>
  );
}

ServiceDetail.propTypes = {};

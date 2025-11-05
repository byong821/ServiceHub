import PropTypes from 'prop-types';
import './Loading.css';

export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" /> {label}
    </div>
  );
}
Loading.propTypes = { label: PropTypes.string };

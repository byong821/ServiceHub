import { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import './BookingForm.css';

export default function BookingForm({ service, onSuccess }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 1,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const totalPrice = service.hourlyRate * Number(formData.duration);
      const booking = await api.post('/api/bookings', {
        serviceId: service._id,
        providerId: service.providerId,
        ...formData,
        duration: Number(formData.duration),
        totalPrice,
      });
      onSuccess?.(booking);
      setFormData({ date: '', time: '', duration: 1, message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = service.hourlyRate * Number(formData.duration);

  return (
    <form className="bookingForm" onSubmit={handleSubmit}>
      <h3>Book {service.title}</h3>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <label>
        Date
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </label>

      <label>
        Time
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Duration (hours)
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          min="1"
          max="8"
          required
        />
      </label>

      <label>
        Message (optional)
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="3"
          placeholder="Any special requirements..."
        />
      </label>

      <div className="bookingForm__total">
        <strong>Total:</strong> ${totalPrice}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Book Now'}
      </button>
    </form>
  );
}

BookingForm.propTypes = {
  service: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    hourlyRate: PropTypes.number.isRequired,
    providerId: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func,
};

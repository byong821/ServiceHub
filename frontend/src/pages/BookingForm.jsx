import { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import './BookingForm.css';

export default function BookingForm({ serviceId, providerId, onCreated }) {
  const [form, setForm] = useState({
    date: '',
    time: '',
    duration: 1,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const { booking } = await api.post('/bookings', {
        serviceId,
        providerId,
        date: form.date,
        time: form.time,
        duration: Number(form.duration) || 1,
        message: form.message,
      });
      onCreated?.(booking);
      setForm({ date: '', time: '', duration: 1, message: '' });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="bookForm" onSubmit={submit}>
      <h3>Request booking</h3>
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
      <div className="grid2">
        <label>
          Date
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Time
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={onChange}
            required
          />
        </label>
      </div>
      <label>
        Duration (hours)
        <input
          type="number"
          name="duration"
          min="1"
          max="8"
          value={form.duration}
          onChange={onChange}
        />
      </label>
      <label>
        Message
        <textarea
          name="message"
          rows={3}
          value={form.message}
          onChange={onChange}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}

BookingForm.propTypes = {
  serviceId: PropTypes.string.isRequired,
  providerId: PropTypes.string.isRequired,
  onCreated: PropTypes.func,
};

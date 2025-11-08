// frontend/src/pages/ServiceForm.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import './ServiceForm.css';

export default function ServiceForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'tech',
    hourlyRate: 20,
    location: '',
    isEmergency: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.post('/api/services', {
        ...form,
        hourlyRate: Number(form.hourlyRate),
      });
      setLoading(false);
      setForm({
        title: '',
        description: '',
        category: 'tech',
        hourlyRate: 20,
        location: '',
        isEmergency: false,
      });
      onCreated?.();
    } catch (error) {
      setLoading(false);
      setErr(error.message || 'Failed to create');
    }
  };

  return (
    <form
      className="serviceForm serviceForm__card"
      onSubmit={submit}
      noValidate
    >
      <h3>Create service</h3>

      {err && (
        <div className="serviceForm__hint" style={{ color: 'var(--danger)' }}>
          {err}
        </div>
      )}

      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          placeholder="e.g., iPhone screen repair"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="desc">Description</label>
        <textarea
          id="desc"
          className="textarea"
          placeholder="What’s included? Any requirements?"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <div className="serviceForm__row">
        <div>
          <label htmlFor="cat">Category</label>
          <select
            id="cat"
            className="select"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          >
            <option value="tech">Tech</option>
            <option value="tutoring">Tutoring</option>
            <option value="moving">Moving</option>
            <option value="photo">Photography</option>
          </select>
        </div>

        <div>
          <label htmlFor="rate">Hourly Rate ($)</label>
          <input
            id="rate"
            className="input"
            type="number"
            min="0"
            value={form.hourlyRate}
            onChange={(e) => update('hourlyRate', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="serviceForm__row serviceForm__row--compact">
        <div>
          <label htmlFor="loc">Location</label>
          <input
            id="loc"
            className="input"
            placeholder="e.g., Northeastern"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </div>

        <div className="serviceForm__inline" style={{ alignSelf: 'end' }}>
          <input
            id="urgent"
            type="checkbox"
            checked={form.isEmergency}
            onChange={(e) => update('isEmergency', e.target.checked)}
          />
          <label htmlFor="urgent">Emergency</label>
        </div>
      </div>

      <div className="serviceForm__footer">
        <button
          type="submit"
          className="button button--primary"
          disabled={loading}
        >
          {loading ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  );
}

ServiceForm.propTypes = {
  onCreated: PropTypes.func,
};

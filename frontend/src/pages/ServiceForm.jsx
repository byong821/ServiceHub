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

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const { service } = await api.post('/services', {
        ...form,
        hourlyRate: Number(form.hourlyRate) || 0,
      });
      onCreated?.(service);
      setForm({
        title: '',
        description: '',
        category: 'tech',
        hourlyRate: 20,
        location: '',
        isEmergency: false,
      });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="svcForm" onSubmit={submit}>
      <h2>Create service</h2>
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
      <label>
        Title
        <input name="title" value={form.title} onChange={onChange} required />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={3}
        />
      </label>
      <div className="grid2">
        <label>
          Category
          <select name="category" value={form.category} onChange={onChange}>
            <option value="tech">Tech</option>
            <option value="tutoring">Tutoring</option>
            <option value="moving">Moving</option>
            <option value="photo">Photography</option>
          </select>
        </label>
        <label>
          Hourly Rate ($)
          <input
            type="number"
            name="hourlyRate"
            value={form.hourlyRate}
            onChange={onChange}
            min="0"
          />
        </label>
      </div>
      <div className="grid2">
        <label>
          Location
          <input name="location" value={form.location} onChange={onChange} />
        </label>
        <label className="chk">
          <input
            type="checkbox"
            name="isEmergency"
            checked={form.isEmergency}
            onChange={onChange}
          />{' '}
          Emergency
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Create'}
      </button>
    </form>
  );
}
ServiceForm.propTypes = { onCreated: PropTypes.func };

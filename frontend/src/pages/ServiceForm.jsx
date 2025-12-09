import { useState } from 'react';
import { api } from '../services/api';
import './ServiceForm.css';

const SCHOOLS = [
  'Boston University',
  'Northeastern University',
  'Harvard University',
  'MIT',
  'Tufts University',
  'Boston College',
  'Emerson College',
  'Suffolk University',
  'UMass Boston',
  'Berklee College of Music',
  'Simmons University',
  'Wentworth Institute of Technology',
  'Lesley University',
  'MCPHS University',
  'Bentley University',
  'Brandeis University',
  'Babson College',
  'Olin College of Engineering',
  'Fisher College',
  'Emmanuel College',
  'Wheelock College',
];

export default function ServiceForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'tutoring',
    hourlyRate: 20,
    itemPrice: '',
    school: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const payload = {
        ...form,
        hourlyRate:
          form.category === 'selling'
            ? Number(form.itemPrice || 0)
            : Number(form.hourlyRate || 0),
        location: form.school,
      };
      delete payload.itemPrice;
      delete payload.school;
      const res = await api.post('/api/services', payload);
      if (onCreated) onCreated(res.service);
    } catch (error) {
      setErr(error.message || 'Failed to create listing');
    }
    setLoading(false);
  };

  return (
    <div>
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

        <div>
          <label htmlFor="school">School/College</label>
          <select
            id="school"
            className="select"
            value={form.school}
            onChange={(e) => update('school', e.target.value)}
            required
          >
            <option value="">Select your school</option>
            {SCHOOLS.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>

        <div className="serviceForm__row">
          <div>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="select"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              required
            >
              <option value="tutoring">Tutoring</option>
              <option value="moving">Moving & Delivery</option>
              <option value="tech">Tech Support</option>
              <option value="photo">Photography & Video</option>
              <option value="events">Event Services</option>
              <option value="design">Graphic Design</option>
              <option value="writing">Writing & Editing</option>
              <option value="music">Music Lessons</option>
              <option value="fitness">Fitness & Training</option>
              <option value="petcare">Pet Care</option>
              <option value="home">Home Services</option>
              <option value="auto">Car Services</option>
              <option value="food">Food & Catering</option>
              <option value="admin">Administrative</option>
              <option value="other">Other</option>
              <option value="selling">Selling</option>
            </select>
          </div>
          {form.category === 'selling' ? (
            <div>
              <label htmlFor="itemPrice">Item Price ($)</label>
              <input
                id="itemPrice"
                className="input"
                type="number"
                min="0"
                step="1"
                value={form.itemPrice}
                onChange={(e) => update('itemPrice', e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="hourlyRate">Hourly Rate ($)</label>
              <input
                id="hourlyRate"
                className="input"
                type="number"
                min="0"
                step="1"
                value={form.hourlyRate}
                onChange={(e) => update('hourlyRate', e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <div className="serviceForm__footer">
          <button
            type="submit"
            className="button button--primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}

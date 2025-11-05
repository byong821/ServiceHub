import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import Loading from '../components/Loading';
import './BookingDetail.css';

export default function BookingDetail({ id }) {
  const [bk, setBk] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    let alive = true;
    setErr('');
    api
      .get(`/bookings/${id}`)
      .then((res) => {
        if (alive) setBk(res.booking);
      })
      .catch((e) => setErr(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  async function updateStatus(status) {
    setSaving(true);
    setErr('');
    try {
      await api.put(`/bookings/${id}/status`, { status });
      const { booking } = await api.get(`/bookings/${id}`);
      setBk(booking);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setErr('');
    try {
      await api.post(`/bookings/${id}/messages`, { text });
      const { booking } = await api.get(`/bookings/${id}`);
      setBk(booking);
      setText('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!bk && !err) return <Loading label="Loading booking…" />;
  if (err)
    return (
      <p className="error" role="alert">
        {err}
      </p>
    );
  if (!bk) return null;

  return (
    <section className="bkDetail">
      <h2>Booking Detail</h2>
      <dl className="bkDetail__meta">
        <div>
          <dt>Date</dt>
          <dd>
            {new Date(bk.date).toLocaleDateString()} {bk.time}
          </dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{bk.duration} hour(s)</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className={`status status--${bk.status}`}>{bk.status}</dd>
        </div>
      </dl>

      <div className="bkDetail__actions">
        <button onClick={() => updateStatus('confirmed')} disabled={saving}>
          Mark confirmed (provider)
        </button>
        <button onClick={() => updateStatus('completed')} disabled={saving}>
          Mark completed (provider)
        </button>
        <button onClick={() => updateStatus('cancelled')} disabled={saving}>
          Cancel (customer)
        </button>
      </div>

      <h3>Messages</h3>
      <ul className="bkDetail__msgs">
        {(bk.messages || []).map((m, i) => (
          <li key={i}>
            <time>{new Date(m.timestamp).toLocaleString()}</time>
            <p>{m.text}</p>
          </li>
        ))}
      </ul>

      <form className="bkDetail__send" onSubmit={sendMessage}>
        <input
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={saving || !text.trim()}>
          {saving ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  );
}

BookingDetail.propTypes = { id: PropTypes.string.isRequired };

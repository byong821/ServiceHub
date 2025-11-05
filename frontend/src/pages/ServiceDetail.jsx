import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import Loading from '../components/Loading';
import './ServiceDetail.css';

export default function ServiceDetail({ id, canEdit = false, onDeleted }) {
  const [svc, setSvc] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setErr('');
    api
      .get(`/services/${id}`)
      .then((res) => {
        if (alive) setSvc(res.service);
      })
      .catch((e) => setErr(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  async function update(field, value) {
    if (!canEdit) return;
    setSaving(true);
    setErr('');
    try {
      const { service } = await api.put(`/services/${id}`, { [field]: value });
      setSvc(service);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!canEdit) return;
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      onDeleted?.();
    } catch (e) {
      setErr(e.message);
    }
  }

  if (!svc && !err) return <Loading label="Loading service…" />;
  if (err)
    return (
      <p className="error" role="alert">
        {err}
      </p>
    );
  if (!svc) return null;

  return (
    <section className="svcDetail">
      <h2>{svc.title}</h2>
      <p className="svcDetail__desc">{svc.description}</p>
      <dl className="svcDetail__meta">
        <div>
          <dt>Category</dt>
          <dd>{svc.category}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd>${svc.hourlyRate}/hr</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{svc.location}</dd>
        </div>
      </dl>
      {canEdit && (
        <div className="svcDetail__actions">
          <button
            onClick={() => {
              const v = Number(prompt('New rate?', svc.hourlyRate));
              if (!Number.isNaN(v)) update('hourlyRate', v);
            }}
            disabled={saving}
          >
            Update Rate
          </button>
          <button className="danger" onClick={remove} disabled={saving}>
            Delete
          </button>
        </div>
      )}
    </section>
  );
}
ServiceDetail.propTypes = {
  id: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  onDeleted: PropTypes.func,
};

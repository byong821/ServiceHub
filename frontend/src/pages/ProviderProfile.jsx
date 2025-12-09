import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import ServiceList from './ServiceList';
import Loading from '../components/Loading';
import './Profile.css';

export default function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.get(`/api/users/public/${providerId}`);
        setProvider(user);
      } catch (error) {
        setErr(error.message || 'Failed to load provider profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [providerId]);

  if (loading) return <Loading />;

  if (err || !provider) {
    return (
      <main className="profile">
        <div className="container">
          <div className="profile__empty">
            <p>{err || 'Provider not found'}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile">
      <div className="container">
        {/* Provider Header */}
        <section className="profile__header" style={{ marginBottom: 32 }}>
          <div className="profile__info">
            <h1 className="h2">{provider.username}</h1>
            <p className="text-secondary" style={{ marginTop: 4 }}>
              {provider.major && `${provider.major}`}
              {provider.major && provider.gradYear && ' • '}
              {provider.gradYear && `Class of ${provider.gradYear}`}
            </p>
            <p className="text-tertiary" style={{ marginTop: 8 }}>
              {provider.email}
            </p>
          </div>
        </section>

        {/* Active Listings */}
        <section style={{ marginTop: 40 }}>
          <div className="profile__sectionHeader">
            <h2 className="h2">{provider.username}'s Active Listings</h2>
            <span className="text-muted">
              Browse all services offered by this provider.
            </span>
          </div>

          <ServiceList
            query=""
            category=""
            school=""
            min=""
            max=""
            providerFilter={providerId}
          />
        </section>
      </div>
    </main>
  );
}

ProviderProfile.propTypes = {};

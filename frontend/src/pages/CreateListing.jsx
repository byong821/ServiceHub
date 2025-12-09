import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import ServiceForm from './ServiceForm';
import './CreateListing.css';

export default function CreateListing() {
  const { user, loadingUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser && !user) {
      navigate('/login');
    }
  }, [user, loadingUser, navigate]);

  if (loadingUser) {
    return (
      <main className="createListing">
        <div className="container">
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="createListing">
      <div className="container">
        <div className="createListing__header">
          <h1 className="h1">Create a Listing</h1>
          <p className="text-muted">
            Share your skills and start earning. Fill out the form below to list
            a new service.
          </p>
        </div>

        <div className="createListing__formWrapper">
          <div className="card" style={{ padding: 32 }}>
            <ServiceForm
              onCreated={() => {
                navigate('/me');
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

CreateListing.propTypes = {};

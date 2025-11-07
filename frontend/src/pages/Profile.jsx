import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import './Profile.css';

const Profile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    major: user.major || '',
    gradYear: user.gradYear || '',
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
      const data = await api.put(`/api/users/${user._id}`, formData);
      onUpdate(data.user);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile</h2>
        {error && <div className="profile-error">{error}</div>}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="profile-input"
            />
            <label>Major</label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="profile-input"
            />
            <label>Graduation Year</label>
            <input
              type="number"
              name="gradYear"
              value={formData.gradYear}
              onChange={handleChange}
              className="profile-input"
            />
            <div className="profile-actions">
              <button type="submit" disabled={loading} className="profile-btn">
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="profile-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Major:</strong> {user.major || 'Not set'}
            </p>
            <p>
              <strong>Graduation Year:</strong> {user.gradYear || 'Not set'}
            </p>
            <button onClick={() => setIsEditing(true)} className="profile-btn">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Profile.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    major: PropTypes.string,
    gradYear: PropTypes.number,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default Profile;

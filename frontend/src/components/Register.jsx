import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services/api';
import './Register.css';

const Register = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    major: '',
    gradYear: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.endsWith('.edu')) {
      setError('Must use a .edu email address');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/api/auth/register', formData);
      onRegisterSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="register-error">{error}</div>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="register-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email (.edu required)"
          value={formData.email}
          onChange={handleChange}
          required
          className="register-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
          className="register-input"
        />
        <input
          type="text"
          name="major"
          placeholder="Major"
          value={formData.major}
          onChange={handleChange}
          className="register-input"
        />
        <input
          type="number"
          name="gradYear"
          placeholder="Graduation Year"
          value={formData.gradYear}
          onChange={handleChange}
          min="2024"
          max="2030"
          className="register-input"
        />
        <button type="submit" disabled={loading} className="register-btn">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

Register.propTypes = {
  onRegisterSuccess: PropTypes.func.isRequired,
};

export default Register;

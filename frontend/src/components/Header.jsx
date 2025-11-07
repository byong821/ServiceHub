import React from 'react';
import PropTypes from 'prop-types';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-logo">ServiceHub</h1>
        <nav className="header-nav">
          {user ? (
            <>
              <span className="header-user">Welcome, {user.username}</span>
              <button onClick={onLogout} className="header-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="header-link">
                Login
              </a>
              <a href="/register" className="header-link">
                Register
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

Header.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default Header;

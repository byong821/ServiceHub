// frontend/src/components/Header.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-container container">
        <a className="header-logo" href="/">
          ● ServiceHub
        </a>

        <nav className="header-nav" aria-label="Primary">
          {user ? (
            <>
              <span className="header-user">Hi, {user.username}</span>
              <button onClick={onLogout} className="button button--ghost">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="button button--ghost">
                Log in
              </a>
              <a href="/register" className="button button--primary">
                Join
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

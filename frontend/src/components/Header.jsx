// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './Header.css';

export default function Header() {
  const { user, logout, loadingUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand">
          ServiceHub
        </Link>

        {/* left nav */}
        <nav className="nav">
          <Link to="/" className="nav__link">
            Home
          </Link>
          {user && (
            <Link to="/me" className="nav__link">
              My Listings
            </Link>
          )}
        </nav>

        {/* right side */}
        <div className="header__right">
          {loadingUser ? (
            <div className="header__skeleton" />
          ) : user ? (
            <>
              <span className="greet">Hi, {user.username}</span>
              <button className="btn btn--ghost" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn--primary">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">JobTrack</span>
            <span className="brand-subtitle">Application Tracker</span>
          </div>
        </Link>

        <nav className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/add"
            className={`nav-btn ${location.pathname === '/add' ? 'active' : ''}`}
          >
            <span className="btn-icon">+</span>
            <span>Add Application</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

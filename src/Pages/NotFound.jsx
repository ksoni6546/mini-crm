import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="empty-state" style={{ marginTop: '10vh' }}>
      <div className="empty-state-icon" style={{ fontSize: '80px', marginBottom: '24px' }}>🧭</div>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>404</h1>
      <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Page Not Found</h3>
      <p style={{ marginBottom: '32px' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        ← Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;

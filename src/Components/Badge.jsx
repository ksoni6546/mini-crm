import React from 'react';

const Badge = ({ variant, children, icon }) => {
  // Map our old class names to a cleaner variant system
  const variantMap = {
    active: 'badge-active',
    success: 'badge-active',
    inactive: 'badge-inactive',
    new: 'badge-new',
    prospecting: 'badge-new',
    contacted: 'badge-contacted',
    proposal: 'badge-contacted',
    qualified: 'badge-qualified',
    'closed won': 'badge-qualified',
    lost: 'badge-lost',
    'closed lost': 'badge-lost',
    high: 'badge-high',
    medium: 'badge-medium',
    negotiation: 'badge-medium',
    low: 'badge-low',
    pending: 'badge-pending',
    completed: 'badge-completed',
  };

  const badgeClass = variantMap[variant?.toLowerCase()] || 'badge-inactive';

  return (
    <span className={`badge ${badgeClass}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;

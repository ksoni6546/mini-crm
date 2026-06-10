import React from 'react';

const PageHeader = ({ title, subtitle, action, actionText, isFormOpen }) => {
  return (
    <div className="page-header slide-in-top">
      <div className="page-header-left">
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={action}
          >
            {isFormOpen ? '✕ Cancel' : `➕ ${actionText}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;

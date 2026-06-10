import React from 'react';

const FilterTabs = ({ tabs, activeTab, onTabChange, counts = {} }) => {
  return (
    <div className="filter-tabs">
      {tabs.map(tab => (
        <button 
          key={tab} 
          onClick={() => onTabChange(tab)}
          className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
        >
          {tab} {counts[tab] !== undefined ? `(${counts[tab]})` : ''}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;

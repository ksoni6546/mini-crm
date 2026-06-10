import React from 'react';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder={placeholder}
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
      {value && (
        <button 
          className="search-clear" 
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;

import React from 'react';

export default function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="search-box-container relative">
      <i className="fas fa-search search-icon-inside"></i>
      <input
        type="text"
        className="search-input pr-10"
        placeholder="Player, Captain athava Team name search cheyyuka (e.g. Suhaina, Arjun, Baasha)..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-300/60 hover:text-yellow-200 text-sm p-1"
          title="Clear search"
        >
          <i className="fas fa-times-circle"></i>
        </button>
      )}
    </div>
  );
}


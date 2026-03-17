import React from 'react';
import './Header.css';

const Header = ({ searchQuery, setSearchQuery }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="logo-title">
          <span className="text-gradient">Pokédex</span>
          <span className="dot">.</span>
        </h1>
        
        <div className="search-container glass-panel">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search Pokémon by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

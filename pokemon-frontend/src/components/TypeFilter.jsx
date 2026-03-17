import React from 'react';
import './TypeFilter.css';

const TypeFilter = ({ types, selectedType, onSelectType }) => {
  if (!types || types.length === 0) return null;

  return (
    <div className="type-filter-container">
      <h3 className="filter-title">Filter by Type</h3>
      <div className="type-buttons">
        <button 
          className={`filter-btn ${selectedType === '' ? 'active' : ''}`}
          onClick={() => onSelectType('')}
        >
          All
        </button>
        {types.map(type => (
          <button
            key={type}
            className={`filter-btn type-${type.toLowerCase()} ${selectedType === type ? 'active' : ''}`}
            onClick={() => onSelectType(type)}
            style={selectedType && selectedType !== type ? { opacity: 0.5 } : {}}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeFilter;

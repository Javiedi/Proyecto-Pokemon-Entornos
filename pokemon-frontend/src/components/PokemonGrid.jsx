import React from 'react';
import PokemonCard from './PokemonCard';
import './PokemonGrid.css';

const PokemonGrid = ({ pokemons, loading, onPokemonClick }) => {
  if (loading) {
    return (
      <div className="loader-container">
        <div className="pokeball-loader">
          <div className="pokeball-loader-line"></div>
          <div className="pokeball-loader-center"></div>
        </div>
      </div>
    );
  }

  if (!pokemons || pokemons.length === 0) {
    return (
      <div className="empty-state glass-panel">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>No Pokémon Found</h3>
        <p>Try adjusting your search or filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="pokemon-grid">
      {pokemons.map(pokemon => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} onClick={onPokemonClick} />
      ))}
    </div>
  );
};

export default PokemonGrid;

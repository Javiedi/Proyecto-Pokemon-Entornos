import React, { useState, useEffect } from 'react';
import './PokemonCard.css';

const PokemonCard = ({ pokemon, onClick }) => {
  // Use the primary type to add a subtle tint to the card
  const primaryType = pokemon.type && pokemon.type.length > 0 ? pokemon.type[0].toLowerCase() : 'normal';
  
  // Use animated GIF for older generations (1-5), otherwise use static high-res
  const isAnimatedAvailable = pokemon.id <= 649;
  const spriteUrl = isAnimatedAvailable 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`
    : (pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);

  return (
    <div 
      className={`pokemon-card glass-panel type-tint-${primaryType}`}
      onClick={() => onClick(pokemon)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-header">
        <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
      </div>
      
      <div className="sprite-container">
        <img 
          src={spriteUrl} 
          alt={pokemon.name} 
          className="pokemon-sprite" 
          loading="lazy"
        />
      </div>

      <div className="card-body">
        <h2 className="pokemon-name">{pokemon.name}</h2>
        
        <div className="pokemon-types">
          {pokemon.type.map((t) => (
            <span key={t} className={`type-badge type-${t.toLowerCase()}`}>
              {t}
            </span>
          ))}
        </div>
        
        <div className="pokemon-stats">
          <div className="stat">
            <span className="stat-label">Base XP</span>
            <span className="stat-value">{pokemon.base_experience}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;

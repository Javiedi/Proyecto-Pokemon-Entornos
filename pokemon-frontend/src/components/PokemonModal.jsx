import React, { useEffect, useState } from 'react';
import './PokemonModal.css';

const PokemonModal = ({ pokemon, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/pokemons/${pokemon.id}/details`);
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [pokemon.id]);

  if (!pokemon) return null;

  // Use animated GIF for older generations (1-5), otherwise use static high-res
  const isAnimatedAvailable = pokemon.id <= 649;
  const spriteUrl = isAnimatedAvailable 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`
    : (pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <div className="modal-image-container">
            <img src={spriteUrl} alt={pokemon.name} className="modal-image" />
          </div>
          <div className="modal-title-section">
            <span className="modal-id">#{String(pokemon.id).padStart(3, '0')}</span>
            <h2 className="modal-name">{pokemon.name}</h2>
            {details && <p className="modal-genus">{details.genus}</p>}
            <div className="modal-types">
              {pokemon.type.map(t => (
                <span key={t} className={`type-badge type-${t.toLowerCase()}`}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loader-container"><div className="pokeball-loader"></div></div>
          ) : details ? (
            <>
              <div className="info-section">
                <h3>Información de la Pokedex</h3>
                <p className="description">{details.description}</p>
                
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="label">Altura:</span>
                    <span className="value">{details.height} m</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Peso:</span>
                    <span className="value">{details.weight} kg</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Ataques y Habilidades</h3>
                <div className="tags-container">
                    <strong>Habilidades:</strong>
                    <div className="tags">
                      {details.abilities.map(a => <span key={a} className="tag-ability">{a}</span>)}
                    </div>
                </div>
                <div className="tags-container">
                    <strong>Ataques principales:</strong>
                    <div className="tags">
                      {details.moves.map(m => <span key={m} className="tag-move">{m}</span>)}
                    </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Estadísticas Base</h3>
                <div className="stats-bars">
                  {details.stats.map(s => {
                    const statTranslations = {
                      'hp': 'PS',
                      'attack': 'Ataque',
                      'defense': 'Defensa',
                      'special-attack': 'At. Esp.',
                      'special-defense': 'Def. Esp.',
                      'speed': 'Velocidad'
                    };
                    return (
                      <div key={s.name} className="stat-bar-container">
                        <div className="stat-label">
                          <span>{statTranslations[s.name] || s.name}</span>
                          <span>{s.value}</span>
                        </div>
                        <div className="bar-bg">
                          <div className="bar-fill" style={{ width: `${Math.min(100, (s.value/255)*100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p>Error cargando detalles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonModal;

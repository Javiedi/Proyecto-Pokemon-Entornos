import React, { useState, useEffect } from 'react';
import './HallOfFame.css';

const HallOfFame = () => {
  const [topPokemon, setTopPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopCompetitivo = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/top-competitivo');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setTopPokemon(data);
      } catch (err) {
        console.error("Error fetching top competitivo:", err);
        setError("No se pudo cargar el ranking competitivo.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopCompetitivo();
  }, []);

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankClass = (index) => {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  };

  const statLabels = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    sp_attack: 'SP.ATK',
    sp_defense: 'SP.DEF',
    speed: 'SPD'
  };

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

  if (error) {
    return (
      <div className="empty-state glass-panel">
        <h3 style={{ color: 'var(--color-primary)' }}>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="hall-of-fame">
      <div className="hof-header">
        <h2 className="hof-title">
          <span className="trophy-icon">🏆</span>
          <span className="text-gradient">Salón de la Fama</span>
        </h2>
        <p className="hof-subtitle">Los 10 Pokémon con mejores estadísticas base combinadas</p>
      </div>

      {/* Podium for top 3 */}
      <div className="podium-section">
        {topPokemon.slice(0, 3).map((pokemon, index) => {
          const order = [1, 0, 2]; // Silver, Gold, Bronze display order
          const p = topPokemon[order[index]];
          const rank = order[index];
          const spriteUrl = p.id <= 649
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif`
            : (p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`);

          return (
            <div key={p.id} className={`podium-card glass-panel ${getRankClass(rank)} podium-${rank + 1}`}>
              <div className="podium-medal">{getMedal(rank)}</div>
              <div className="podium-sprite-container">
                <img src={spriteUrl} alt={p.name} className="podium-sprite" loading="lazy" />
              </div>
              <h3 className="podium-name">{p.name}</h3>
              <div className="podium-types">
                {p.type.map(t => (
                  <span key={t} className={`type-badge type-${t.toLowerCase()}`}>{t}</span>
                ))}
              </div>
              <div className="podium-total">
                <span className="total-label">Total</span>
                <span className="total-value">{p.total_stats}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table for all 10 */}
      <div className="ranking-table glass-panel">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Pokémon</th>
              <th>Tipo</th>
              {Object.values(statLabels).map(label => (
                <th key={label}>{label}</th>
              ))}
              <th className="total-col">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {topPokemon.map((p, i) => {
              const spriteUrl = p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
              return (
                <tr key={p.id} className={getRankClass(i)}>
                  <td className="rank-cell">
                    <span className="rank-badge">{getMedal(i)}</span>
                  </td>
                  <td className="pokemon-cell">
                    <img src={spriteUrl} alt={p.name} className="table-sprite" loading="lazy" />
                    <span className="table-name">{p.name}</span>
                  </td>
                  <td className="type-cell">
                    {p.type.map(t => (
                      <span key={t} className={`type-badge type-${t.toLowerCase()}`}>{t}</span>
                    ))}
                  </td>
                  <td>{p.hp}</td>
                  <td>{p.attack}</td>
                  <td>{p.defense}</td>
                  <td>{p.sp_attack}</td>
                  <td>{p.sp_defense}</td>
                  <td>{p.speed}</td>
                  <td className="total-col">
                    <strong>{p.total_stats}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HallOfFame;

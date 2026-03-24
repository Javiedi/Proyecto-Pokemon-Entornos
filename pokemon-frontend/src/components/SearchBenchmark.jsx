import React, { useState, useEffect, useRef } from 'react';
import './SearchBenchmark.css';

const SearchBenchmark = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [responseTime, setResponseTime] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setResponseTime(null);
      setTotal(0);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/pokemons/buscar?nombre=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setResponseTime(data.responseTimeMs);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const getTimeBadgeClass = () => {
    if (responseTime === null) return '';
    if (responseTime < 1) return 'time-fast';
    if (responseTime < 5) return 'time-medium';
    return 'time-slow';
  };

  return (
    <div className="search-benchmark">
      <div className="benchmark-header">
        <h3 className="benchmark-title">
          <span className="search-emoji">⚡</span>
          Buscador con Análisis de Rendimiento
        </h3>
        <p className="benchmark-subtitle">
          Busca Pokémon por nombre y observa el tiempo de respuesta del servidor (con índice SQL)
        </p>
      </div>

      <div className="benchmark-search-container glass-panel">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre (ej: pikachu, char, dragon)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="benchmark-search-input"
          id="benchmark-search-input"
        />
        {responseTime !== null && (
          <div className={`time-badge ${getTimeBadgeClass()}`}>
            <span className="time-icon">⏱</span>
            <span className="time-value">{responseTime} ms</span>
          </div>
        )}
      </div>

      {query && (
        <div className="benchmark-info">
          <span className="result-count">
            {loading ? 'Buscando...' : `${total} resultado${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
          </span>
          {responseTime !== null && (
            <span className="query-info">
              Consulta SQL: <code>SELECT * FROM pokemon WHERE name LIKE '%{query}%'</code>
            </span>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="benchmark-results">
          {results.slice(0, 20).map(p => {
            const spriteUrl = p.id <= 649
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif`
              : (p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`);

            return (
              <div key={p.id} className="benchmark-result-card glass-panel">
                <img src={spriteUrl} alt={p.name} className="result-sprite" loading="lazy" />
                <div className="result-info">
                  <span className="result-id">#{String(p.id).padStart(3, '0')}</span>
                  <span className="result-name">{p.name}</span>
                </div>
                <div className="result-types">
                  {p.type.map(t => (
                    <span key={t} className={`type-badge type-${t.toLowerCase()}`}>{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBenchmark;

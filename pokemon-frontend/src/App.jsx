import { useState, useEffect } from 'react';
import Header from './components/Header';
import TypeFilter from './components/TypeFilter';
import PokemonGrid from './components/PokemonGrid';
import PokemonModal from './components/PokemonModal';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    // Fetch all types exactly once
    const fetchTypes = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/types');
        if (!res.ok) throw new Error('Failed to fetch types');
        const data = await res.json();
        setTypes(data.sort());
      } catch (err) {
        console.error("Error fetching types:", err);
      }
    };
    fetchTypes();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setPokemons([]);
    setHasMore(true);
  }, [searchQuery, selectedType]);

  useEffect(() => {
    // Fetch pokemons based on filters and page
    const fetchPokemons = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedType) params.append('type', selectedType);
        params.append('page', page);
        params.append('limit', 20);
        
        const res = await fetch(`http://localhost:3001/api/pokemons?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch pokemons');
        const data = await res.json();
        
        const newResults = data.results || [];
        setPokemons(prev => page === 1 ? newResults : [...prev, ...newResults]);
        setHasMore(page < data.totalPages);
      } catch (err) {
        console.error("Error fetching pokemons:", err);
        setError("Could not load Pokémon data. Is the backend server running?");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchPokemons();
    }, page === 1 ? 300 : 0); // Only debounce on first page search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedType, page]);

  return (
    <div className="container">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main>
        <TypeFilter 
          types={types} 
          selectedType={selectedType} 
          onSelectType={setSelectedType} 
        />
        
        {error ? (
          <div className="empty-state glass-panel">
            <h3 style={{color: 'var(--color-primary)'}}>Connection Error</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <PokemonGrid 
              pokemons={pokemons} 
              loading={loading && page === 1} 
              onPokemonClick={setSelectedPokemon} 
            />
            
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <button 
                  className={`glass-panel ${loading ? 'loading' : ''}`}
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    cursor: 'pointer',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s'
                  }}
                >
                  {loading ? 'Cargando...' : 'Cargar más Pokémon'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedPokemon && (
        <PokemonModal 
          pokemon={selectedPokemon} 
          onClose={() => setSelectedPokemon(null)} 
        />
      )}
    </div>
  );
}

export default App;

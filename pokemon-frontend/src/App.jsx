import { useState, useEffect } from 'react';
import Header from './components/Header';
import TypeFilter from './components/TypeFilter';
import PokemonGrid from './components/PokemonGrid';
import PokemonModal from './components/PokemonModal';
import HallOfFame from './components/HallOfFame';
import SearchBenchmark from './components/SearchBenchmark';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('pokedex');
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

  useEffect(() => {
    setPage(1);
    setPokemons([]);
    setHasMore(true);
  }, [searchQuery, selectedType]);

  useEffect(() => {
    if (activeTab !== 'pokedex') return;

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
    }, page === 1 ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedType, page, activeTab]);

  return (
    <div className="container">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Navigation Tabs */}
      <nav className="tab-navigation glass-panel" id="main-navigation">
        <button
          className={`tab-button ${activeTab === 'pokedex' ? 'active' : ''}`}
          onClick={() => setActiveTab('pokedex')}
          id="tab-pokedex"
        >
          <span className="tab-icon">📱</span>
          Pokédex
        </button>
        <button
          className={`tab-button ${activeTab === 'hallOfFame' ? 'active' : ''}`}
          onClick={() => setActiveTab('hallOfFame')}
          id="tab-hall-of-fame"
        >
          <span className="tab-icon">🏆</span>
          Salón de la Fama
        </button>
        <button
          className={`tab-button ${activeTab === 'benchmark' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmark')}
          id="tab-benchmark"
        >
          <span className="tab-icon">⚡</span>
          Búsqueda Indexada
        </button>
      </nav>
      
      <main>
        {activeTab === 'pokedex' && (
          <>
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
          </>
        )}

        {activeTab === 'hallOfFame' && <HallOfFame />}
        {activeTab === 'benchmark' && <SearchBenchmark />}
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

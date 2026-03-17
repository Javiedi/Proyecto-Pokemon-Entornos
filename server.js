const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Load JSON db
const dataPath = path.join(__dirname, 'data.json');
let db = [];
try {
  const data = fs.readFileSync(dataPath, 'utf8');
  db = JSON.parse(data);
} catch (error) {
  console.error("Failed to load data.json:", error);
}

// Routes
app.get('/', (req, res) => {
    res.send('Pokémon API is running. Access /api/pokemons to see data.');
});

// 1. Get all Pokémon (with optional type filtering and search)
app.get('/api/pokemons', (req, res) => {
    try {
        const { search, type, page = 1, limit = 20 } = req.query;
        let results = [...db];

        if (search) {
            results = results.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }

        if (type) {
            results = results.filter(p => p.type.includes(type.toLowerCase()));
        }
        
        const total = results.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;

        res.json({
            results: results.slice(start, end),
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Get random Pokémon (useful for exploring)
app.get('/api/pokemons/random', (req, res) => {
    try {
        const { count = 6 } = req.query;
        let results = [...db].sort(() => 0.5 - Math.random());
        res.json(results.slice(0, parseInt(count)));
    } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 3. Get detailed Pokémon Info (including description from PokeAPI)
app.get('/api/pokemons/:id/details', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Fetch base data (height, weight, moves, abilities)
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!pokemonRes.ok) return res.status(404).json({ error: "Pokémon not found in PokeAPI" });
        const pokemonData = await pokemonRes.json();

        // 2. Fetch species data (flavor text / description)
        const speciesRes = await fetch(pokemonData.species.url);
        const speciesData = await speciesRes.json();

        // Find the first Spanish description, fallback to English
        const descriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es') || 
                                speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        const description = descriptionEntry?.flavor_text.replace(/\f/g, ' ') || "No hay descripción disponible.";

        // Find genus in Spanish, fallback to English
        const genus = speciesData.genera.find(g => g.language.name === 'es')?.genus || 
                      speciesData.genera.find(g => g.language.name === 'en')?.genus || "Pokémon";

        const result = {
            id: pokemonData.id,
            name: pokemonData.name,
            height: pokemonData.height / 10, // DM to M
            weight: pokemonData.weight / 10, // HG to KG
            description: description,
            abilities: pokemonData.abilities.map(a => a.ability.name),
            stats: pokemonData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
            moves: pokemonData.moves.slice(0, 5).map(m => m.move.name), // Just first 5 moves for brevity
            genus: genus
        };

        res.json(result);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Failed to fetch details from PokeAPI" });
    }
});

// 4. Get all available types
app.get('/api/types', (req, res) => {
    try {
        // Extract unique types explicitly
        const allTypes = new Set();
        db.forEach(p => p.type.forEach(t => allTypes.add(t)));
        res.json(Array.from(allTypes));
    } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Pokémon API server running at http://localhost:${port}`);
});

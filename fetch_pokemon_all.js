const fs = require('fs');
const path = require('path');

const fetchCSV = async (filename) => {
    const url = `https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/${filename}`;
    console.log(`Downloading ${filename}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${filename}`);
    return await response.text();
};

const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i];
        });
        return obj;
    });
};

async function updateDatabase() {
    try {
        console.log('Starting full database update (Forms, Megas, Regions)...');
        
        const pokemonCsv = await fetchCSV('pokemon.csv');
        const typesCsv = await fetchCSV('types.csv');
        const pokemonTypesCsv = await fetchCSV('pokemon_types.csv');

        console.log('Parsing data...');
        const pokemonRaw = parseCSV(pokemonCsv);
        const typesRaw = parseCSV(typesCsv);
        const pokemonTypesRaw = parseCSV(pokemonTypesCsv);

        // Create a map for types
        const typeMap = {};
        typesRaw.forEach(t => {
            typeMap[t.id] = t.identifier;
        });

        // Group types by pokemon_id
        const pokemonToTypes = {};
        pokemonTypesRaw.forEach(pt => {
            if (!pokemonToTypes[pt.pokemon_id]) {
                pokemonToTypes[pt.pokemon_id] = [];
            }
            pokemonToTypes[pt.pokemon_id].push(typeMap[pt.type_id]);
        });

        console.log('Building final Pokémon list...');
        const finalPokemonList = pokemonRaw.map(p => {
            const id = parseInt(p.id);
            return {
                id: id,
                name: p.identifier,
                type: pokemonToTypes[p.id] || ['unknown'],
                base_experience: parseInt(p.base_experience) || 0,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
            };
        });

        // Sort by ID
        finalPokemonList.sort((a, b) => a.id - b.id);

        const dataPath = path.join(__dirname, 'data.json');
        fs.writeFileSync(dataPath, JSON.stringify(finalPokemonList, null, 2), 'utf8');

        console.log(`\n✅ Success! Added ${finalPokemonList.length} Pokémon variations.`);
        console.log('This includes all Mega Evolutions, Regional Forms (Alola, Galar, Hisui, Paldea), and special aspects.');
        console.log('Restart your server to see the changes.');

    } catch (error) {
        console.error('Error updating database:', error);
    }
}

updateDatabase();

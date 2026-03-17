const fs = require('fs');
const path = require('path');

const fetchPokemonData = async () => {
    try {
        console.log('Fetching list of 151 Pokémon from PokeAPI...');
        // Let's fetch the original 151 Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        const results = data.results;

        console.log(`Found ${results.length} Pokémon. Fetching details for each (this may take a moment)...`);
        
        const pokemonList = [];
        
        for (let i = 0; i < results.length; i++) {
            const detailResponse = await fetch(results[i].url);
            const detailData = await detailResponse.json();
            
            // Extract the needed data: id, name, type, and base_experience
            const types = detailData.types.map(t => t.type.name);
            
            pokemonList.push({
                id: detailData.id,
                name: detailData.name,
                type: types,
                base_experience: detailData.base_experience
            });
            
            if ((i + 1) % 10 === 0) {
                console.log(`Fetched ${i + 1} / 151`);
            }
        }

        // Save to data.json
        const dataPath = path.join(__dirname, 'data.json');
        fs.writeFileSync(dataPath, JSON.stringify(pokemonList, null, 2), 'utf8');
        
        console.log(`Successfully saved ${pokemonList.length} Pokémon to data.json!`);
        console.log('You can now restart your server to see them.');
        
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
};

fetchPokemonData();

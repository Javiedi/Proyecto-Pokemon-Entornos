const q = `query { pokemon_v2_pokemon(limit: 10) { id name base_experience pokemon_v2_pokemontypes { pokemon_v2_type { name } } } }`;
fetch("https://beta.pokeapi.co/graphql/v1beta", {
  method: "POST",
  body: JSON.stringify({query: q})
}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d.data.pokemon_v2_pokemon[0]))).catch(console.error);

const fs = require('fs');
const path = require('path');
const { getDb } = require('./database');

// Evolution chains (Gen 1-3 basics)
const EVOLUTION_CHAINS = [
  // Gen 1 Starters
  { from: 1, to: 2, level: 16 },   // Bulbasaur -> Ivysaur
  { from: 2, to: 3, level: 32 },   // Ivysaur -> Venusaur
  { from: 4, to: 5, level: 16 },   // Charmander -> Charmeleon
  { from: 5, to: 6, level: 36 },   // Charmeleon -> Charizard
  { from: 7, to: 8, level: 16 },   // Squirtle -> Wartortle
  { from: 8, to: 9, level: 36 },   // Wartortle -> Blastoise
  // Caterpie line
  { from: 10, to: 11, level: 7 },
  { from: 11, to: 12, level: 10 },
  // Weedle line
  { from: 13, to: 14, level: 7 },
  { from: 14, to: 15, level: 10 },
  // Pidgey line
  { from: 16, to: 17, level: 18 },
  { from: 17, to: 18, level: 36 },
  // Rattata
  { from: 19, to: 20, level: 20 },
  // Pikachu
  { from: 25, to: 26, level: 22 },
  // Nidoran lines
  { from: 29, to: 30, level: 16 },
  { from: 30, to: 31, level: 36 },
  { from: 32, to: 33, level: 16 },
  { from: 33, to: 34, level: 36 },
  // Oddish line
  { from: 43, to: 44, level: 21 },
  { from: 44, to: 45, level: 36 },
  // Poliwag line
  { from: 60, to: 61, level: 25 },
  { from: 61, to: 62, level: 36 },
  // Abra line
  { from: 63, to: 64, level: 16 },
  { from: 64, to: 65, level: 36 },
  // Machop line
  { from: 66, to: 67, level: 28 },
  { from: 67, to: 68, level: 36 },
  // Geodude line
  { from: 74, to: 75, level: 25 },
  { from: 75, to: 76, level: 36 },
  // Gastly line
  { from: 92, to: 93, level: 25 },
  { from: 93, to: 94, level: 36 },
  // Dratini line
  { from: 147, to: 148, level: 30 },
  { from: 148, to: 149, level: 55 },
];

const TRAINER_NAMES = [
  'Ash Ketchum', 'Misty', 'Brock', 'Gary Oak', 'Serena',
  'Lance', 'Cynthia', 'Red', 'Blue', 'Professor Oak'
];

// Reasonable base stats for pokemon that don't have them from PokeAPI
function generateRandomStats() {
  return {
    hp: Math.floor(Math.random() * 150) + 30,
    attack: Math.floor(Math.random() * 150) + 30,
    defense: Math.floor(Math.random() * 150) + 30,
    sp_attack: Math.floor(Math.random() * 150) + 30,
    sp_defense: Math.floor(Math.random() * 150) + 30,
    speed: Math.floor(Math.random() * 150) + 30,
  };
}

async function fetchStatsFromPokeAPI(id) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    const statsMap = {};
    data.stats.forEach(s => {
      const name = s.stat.name;
      if (name === 'hp') statsMap.hp = s.base_stat;
      else if (name === 'attack') statsMap.attack = s.base_stat;
      else if (name === 'defense') statsMap.defense = s.base_stat;
      else if (name === 'special-attack') statsMap.sp_attack = s.base_stat;
      else if (name === 'special-defense') statsMap.sp_defense = s.base_stat;
      else if (name === 'speed') statsMap.speed = s.base_stat;
    });
    return statsMap;
  } catch {
    return null;
  }
}

async function seedDatabase() {
  console.log('🔧 Inicializando base de datos...');
  const db = getDb();

  // Clear existing data
  db.exec('DELETE FROM capturas;');
  db.exec('DELETE FROM evoluciones;');
  db.exec('DELETE FROM entrenadores;');
  db.exec('DELETE FROM pokemon;');

  // 1. Load pokemon from data.json
  const dataPath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const pokemonList = JSON.parse(rawData);

  console.log(`📦 Cargando ${pokemonList.length} Pokémon desde data.json...`);
  console.log('📡 Obteniendo estadísticas de PokeAPI (esto puede tardar unos minutos)...');

  const insertPokemon = db.prepare(`
    INSERT OR REPLACE INTO pokemon (id, name, type1, type2, base_experience, sprite, hp, attack, defense, sp_attack, sp_defense, speed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Fetch stats in batches to avoid rate limiting
  const BATCH_SIZE = 20;
  for (let i = 0; i < pokemonList.length; i += BATCH_SIZE) {
    const batch = pokemonList.slice(i, i + BATCH_SIZE);
    const statsPromises = batch.map(p => {
      // Only fetch from PokeAPI for IDs <= 1025 (real Pokémon)
      if (p.id <= 1025) {
        return fetchStatsFromPokeAPI(p.id);
      }
      return Promise.resolve(null);
    });

    const statsResults = await Promise.all(statsPromises);

    const insertBatch = db.transaction(() => {
      batch.forEach((p, idx) => {
        const stats = statsResults[idx] || generateRandomStats();
        insertPokemon.run(
          p.id,
          p.name,
          p.type[0] || 'normal',
          p.type[1] || null,
          p.base_experience || 0,
          p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
          stats.hp || 50,
          stats.attack || 50,
          stats.defense || 50,
          stats.sp_attack || 50,
          stats.sp_defense || 50,
          stats.speed || 50
        );
      });
    });
    insertBatch();

    if ((i + BATCH_SIZE) % 100 === 0 || i + BATCH_SIZE >= pokemonList.length) {
      console.log(`  ✅ ${Math.min(i + BATCH_SIZE, pokemonList.length)} / ${pokemonList.length} Pokémon procesados`);
    }
  }

  // 2. Insert trainers
  console.log('\n👤 Creando entrenadores...');
  const insertTrainer = db.prepare('INSERT INTO entrenadores (nombre) VALUES (?)');
  const insertTrainers = db.transaction(() => {
    TRAINER_NAMES.forEach(name => insertTrainer.run(name));
  });
  insertTrainers();
  console.log(`  ✅ ${TRAINER_NAMES.length} entrenadores creados`);

  // 3. Insert evolution chains
  console.log('\n🔄 Cargando cadenas de evolución...');
  const insertEvolution = db.prepare('INSERT OR REPLACE INTO evoluciones (pokemon_id, evolucion_id, nivel_requerido) VALUES (?, ?, ?)');
  const insertEvolutions = db.transaction(() => {
    EVOLUTION_CHAINS.forEach(e => insertEvolution.run(e.from, e.to, e.level));
  });
  insertEvolutions();
  console.log(`  ✅ ${EVOLUTION_CHAINS.length} evoluciones registradas`);

  // 4. Bulk insert 1000 captures
  console.log('\n🎯 Generando 1000 registros de capturas...');
  const pokemonCount = db.prepare('SELECT COUNT(*) as count FROM pokemon').get().count;
  const trainerIds = db.prepare('SELECT id FROM entrenadores').all().map(r => r.id);
  const pokemonIds = db.prepare('SELECT id FROM pokemon LIMIT 500').all().map(r => r.id);

  const insertCaptura = db.prepare(`
    INSERT INTO capturas (entrenador_id, pokemon_id, nivel, fecha_captura)
    VALUES (?, ?, ?, datetime('now', '-' || ? || ' days'))
  `);

  const insertCapturas = db.transaction(() => {
    for (let i = 0; i < 1000; i++) {
      const trainerId = trainerIds[Math.floor(Math.random() * trainerIds.length)];
      const pokemonId = pokemonIds[Math.floor(Math.random() * pokemonIds.length)];
      const nivel = Math.floor(Math.random() * 100) + 1;
      const daysAgo = Math.floor(Math.random() * 365);
      insertCaptura.run(trainerId, pokemonId, nivel, daysAgo);
    }
  });
  insertCapturas();
  console.log('  ✅ 1000 capturas generadas');

  // 5. Create the index on name
  console.log('\n📇 Creando índice en pokemon.name...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);');
  console.log('  ✅ Índice idx_pokemon_name creado');

  // Summary
  const stats = {
    pokemon: db.prepare('SELECT COUNT(*) as c FROM pokemon').get().c,
    entrenadores: db.prepare('SELECT COUNT(*) as c FROM entrenadores').get().c,
    capturas: db.prepare('SELECT COUNT(*) as c FROM capturas').get().c,
    evoluciones: db.prepare('SELECT COUNT(*) as c FROM evoluciones').get().c,
  };

  console.log('\n' + '═'.repeat(50));
  console.log('📊 RESUMEN DE LA BASE DE DATOS');
  console.log('═'.repeat(50));
  console.log(`  Pokémon:      ${stats.pokemon}`);
  console.log(`  Entrenadores: ${stats.entrenadores}`);
  console.log(`  Capturas:     ${stats.capturas}`);
  console.log(`  Evoluciones:  ${stats.evoluciones}`);
  console.log('═'.repeat(50));

  // Show top competitivo
  const top3 = db.prepare('SELECT * FROM vista_top_competitivo LIMIT 3').all();
  console.log('\n🏆 Top 3 Competitivo:');
  top3.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} — Total Stats: ${p.total_stats}`);
  });

  console.log('\n✅ ¡Base de datos poblada correctamente!');
  console.log('Ejecuta "node server.js" para iniciar el servidor.');
}

seedDatabase().catch(err => {
  console.error('❌ Error durante el seeding:', err);
  process.exit(1);
});

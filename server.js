const express = require('express');
const cors = require('cors');
const { getDb } = require('./database');
const { performance } = require('perf_hooks');

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize database
const db = getDb();

// ═══════════════════════════════════════════════════
// EXISTING ENDPOINTS (migrated to SQLite)
// ═══════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.send('Pokémon API is running with SQLite. Access /api/pokemons to see data.');
});

// 1. Get all Pokémon (with optional type filtering and search)
app.get('/api/pokemons', (req, res) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${search.toLowerCase()}%`);
    }

    if (type) {
      whereClause += ' AND (type1 = ? OR type2 = ?)';
      params.push(type.toLowerCase(), type.toLowerCase());
    }

    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM pokemon WHERE ${whereClause}`).get(...params);
    const total = totalRow.total;

    const results = db.prepare(`
      SELECT id, name, type1, type2, base_experience, sprite
      FROM pokemon
      WHERE ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset);

    // Transform to match original JSON format
    const formatted = results.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type2 ? [p.type1, p.type2] : [p.type1],
      base_experience: p.base_experience,
      sprite: p.sprite
    }));

    res.json({
      results: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Get random Pokémon
app.get('/api/pokemons/random', (req, res) => {
  try {
    const { count = 6 } = req.query;
    const results = db.prepare('SELECT * FROM pokemon ORDER BY RANDOM() LIMIT ?').all(parseInt(count));
    const formatted = results.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type2 ? [p.type1, p.type2] : [p.type1],
      base_experience: p.base_experience,
      sprite: p.sprite
    }));
    res.json(formatted);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Get detailed Pokémon Info (from PokeAPI)
app.get('/api/pokemons/:id/details', async (req, res) => {
  try {
    const id = req.params.id;

    const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!pokemonRes.ok) return res.status(404).json({ error: "Pokémon not found in PokeAPI" });
    const pokemonData = await pokemonRes.json();

    const speciesRes = await fetch(pokemonData.species.url);
    const speciesData = await speciesRes.json();

    const descriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es') ||
                             speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    const description = descriptionEntry?.flavor_text.replace(/\f/g, ' ') || "No hay descripción disponible.";

    const genus = speciesData.genera.find(g => g.language.name === 'es')?.genus ||
                  speciesData.genera.find(g => g.language.name === 'en')?.genus || "Pokémon";

    const result = {
      id: pokemonData.id,
      name: pokemonData.name,
      height: pokemonData.height / 10,
      weight: pokemonData.weight / 10,
      description: description,
      abilities: pokemonData.abilities.map(a => a.ability.name),
      stats: pokemonData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      moves: pokemonData.moves.slice(0, 5).map(m => m.move.name),
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
    const types = db.prepare(`
      SELECT DISTINCT type1 AS type FROM pokemon
      UNION
      SELECT DISTINCT type2 AS type FROM pokemon WHERE type2 IS NOT NULL
      ORDER BY type
    `).all();
    res.json(types.map(t => t.type));
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════
// CRUD ENDPOINTS
// ═══════════════════════════════════════════════════

// INSERT — Capturar Pokémon
app.post('/api/capturas', (req, res) => {
  try {
    const { pokemon_id, entrenador_id } = req.body;

    if (!pokemon_id || !entrenador_id) {
      return res.status(400).json({ error: 'Se requieren pokemon_id y entrenador_id' });
    }

    // Validate pokemon exists
    const pokemon = db.prepare('SELECT id, name FROM pokemon WHERE id = ?').get(pokemon_id);
    if (!pokemon) {
      return res.status(404).json({ error: `Pokémon con id ${pokemon_id} no encontrado` });
    }

    // Validate trainer exists
    const trainer = db.prepare('SELECT id, nombre FROM entrenadores WHERE id = ?').get(entrenador_id);
    if (!trainer) {
      return res.status(404).json({ error: `Entrenador con id ${entrenador_id} no encontrado` });
    }

    const result = db.prepare(`
      INSERT INTO capturas (entrenador_id, pokemon_id, nivel, fecha_captura)
      VALUES (?, ?, 1, datetime('now'))
    `).run(entrenador_id, pokemon_id);

    res.status(201).json({
      message: `¡${trainer.nombre} ha capturado a ${pokemon.name}!`,
      captura: {
        id: result.lastInsertRowid,
        entrenador_id,
        entrenador_nombre: trainer.nombre,
        pokemon_id,
        pokemon_nombre: pokemon.name,
        nivel: 1
      }
    });
  } catch (error) {
    console.error("Error en captura:", error);
    res.status(500).json({ error: "Error al registrar captura" });
  }
});

// UPDATE — Entrenar/Evolucionar Pokémon
app.put('/api/capturas/:id/entrenar', (req, res) => {
  try {
    const capturaId = parseInt(req.params.id);

    // Get current capture
    const captura = db.prepare(`
      SELECT c.*, p.name as pokemon_name
      FROM capturas c
      JOIN pokemon p ON c.pokemon_id = p.id
      WHERE c.id = ?
    `).get(capturaId);

    if (!captura) {
      return res.status(404).json({ error: `Captura con id ${capturaId} no encontrada` });
    }

    const nuevoNivel = captura.nivel + 1;

    // Check evolution
    const evolution = db.prepare(`
      SELECT e.*, p.name as evolucion_name
      FROM evoluciones e
      JOIN pokemon p ON e.evolucion_id = p.id
      WHERE e.pokemon_id = ? AND e.nivel_requerido <= ?
    `).get(captura.pokemon_id, nuevoNivel);

    let evolved = false;
    let newPokemonId = captura.pokemon_id;
    let newPokemonName = captura.pokemon_name;

    if (evolution) {
      newPokemonId = evolution.evolucion_id;
      newPokemonName = evolution.evolucion_name;
      evolved = true;
    }

    // Update level, stats, and possibly pokemon_id
    db.prepare(`
      UPDATE capturas SET nivel = ?, pokemon_id = ? WHERE id = ?
    `).run(nuevoNivel, newPokemonId, capturaId);

    // Also boost the Pokemon's stats slightly (+2 each)
    db.prepare(`
      UPDATE pokemon SET
        hp = hp + 2,
        attack = attack + 2,
        defense = defense + 2,
        sp_attack = sp_attack + 2,
        sp_defense = sp_defense + 2,
        speed = speed + 2
      WHERE id = ?
    `).run(newPokemonId);

    const response = {
      message: evolved
        ? `¡${captura.pokemon_name} ha evolucionado a ${newPokemonName}! Nivel: ${nuevoNivel}`
        : `¡${captura.pokemon_name} ha subido al nivel ${nuevoNivel}!`,
      captura: {
        id: capturaId,
        pokemon_id: newPokemonId,
        pokemon_nombre: newPokemonName,
        nivel: nuevoNivel,
        evolucionado: evolved
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error en entrenamiento:", error);
    res.status(500).json({ error: "Error al entrenar Pokémon" });
  }
});

// DELETE — Liberar Pokémon
app.delete('/api/capturas/:id', (req, res) => {
  try {
    const capturaId = parseInt(req.params.id);

    // Validate existence
    const captura = db.prepare(`
      SELECT c.*, p.name as pokemon_name, e.nombre as entrenador_name
      FROM capturas c
      JOIN pokemon p ON c.pokemon_id = p.id
      JOIN entrenadores e ON c.entrenador_id = e.id
      WHERE c.id = ?
    `).get(capturaId);

    if (!captura) {
      return res.status(404).json({ error: `Captura con id ${capturaId} no encontrada. No se puede liberar un Pokémon que no existe.` });
    }

    db.prepare('DELETE FROM capturas WHERE id = ?').run(capturaId);

    res.json({
      message: `${captura.entrenador_name} ha liberado a ${captura.pokemon_name}. ¡Adiós, amigo!`,
      liberado: {
        captura_id: capturaId,
        pokemon: captura.pokemon_name,
        entrenador: captura.entrenador_name
      }
    });
  } catch (error) {
    console.error("Error al liberar:", error);
    res.status(500).json({ error: "Error al liberar Pokémon" });
  }
});

// ═══════════════════════════════════════════════════
// VISTA TOP COMPETITIVO
// ═══════════════════════════════════════════════════

app.get('/api/top-competitivo', (req, res) => {
  try {
    const topPokemon = db.prepare('SELECT * FROM vista_top_competitivo').all();
    const formatted = topPokemon.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type2 ? [p.type1, p.type2] : [p.type1],
      hp: p.hp,
      attack: p.attack,
      defense: p.defense,
      sp_attack: p.sp_attack,
      sp_defense: p.sp_defense,
      speed: p.speed,
      total_stats: p.total_stats,
      sprite: p.sprite
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching top competitivo:", error);
    res.status(500).json({ error: "Error al obtener ranking competitivo" });
  }
});

// ═══════════════════════════════════════════════════
// BÚSQUEDA CON MEDICIÓN DE RENDIMIENTO
// ═══════════════════════════════════════════════════

app.get('/api/pokemons/buscar', (req, res) => {
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({ error: 'Se requiere el parámetro "nombre"' });
    }

    const startTime = performance.now();

    const results = db.prepare(`
      SELECT id, name, type1, type2, base_experience, sprite,
             hp, attack, defense, sp_attack, sp_defense, speed
      FROM pokemon
      WHERE name LIKE ?
      ORDER BY id ASC
    `).all(`%${nombre.toLowerCase()}%`);

    const endTime = performance.now();
    const responseTimeMs = parseFloat((endTime - startTime).toFixed(3));

    const formatted = results.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type2 ? [p.type1, p.type2] : [p.type1],
      base_experience: p.base_experience,
      sprite: p.sprite
    }));

    res.json({
      results: formatted,
      total: formatted.length,
      responseTimeMs,
      query: nombre
    });
  } catch (error) {
    console.error("Error en búsqueda:", error);
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

// ═══════════════════════════════════════════════════
// BENCHMARK — Comparar rendimiento con/sin índice
// ═══════════════════════════════════════════════════

app.get('/api/benchmark', (req, res) => {
  try {
    const searchTerm = req.query.nombre || 'char';
    const ITERATIONS = 100;

    // Test WITHOUT index
    db.exec('DROP INDEX IF EXISTS idx_pokemon_name');

    let totalWithout = 0;
    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();
      db.prepare('SELECT * FROM pokemon WHERE name LIKE ?').all(`%${searchTerm}%`);
      totalWithout += performance.now() - start;
    }
    const avgWithoutIndex = parseFloat((totalWithout / ITERATIONS).toFixed(4));

    // Test WITH index
    db.exec('CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name)');

    let totalWith = 0;
    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();
      db.prepare('SELECT * FROM pokemon WHERE name LIKE ?').all(`%${searchTerm}%`);
      totalWith += performance.now() - start;
    }
    const avgWithIndex = parseFloat((totalWith / ITERATIONS).toFixed(4));

    const mejora = avgWithoutIndex > 0
      ? parseFloat(((1 - avgWithIndex / avgWithoutIndex) * 100).toFixed(2))
      : 0;

    res.json({
      searchTerm,
      iterations: ITERATIONS,
      sinIndice: {
        tiempoPromedioMs: avgWithoutIndex,
        sql: `SELECT * FROM pokemon WHERE name LIKE '%${searchTerm}%'`
      },
      conIndice: {
        tiempoPromedioMs: avgWithIndex,
        sql: `CREATE INDEX idx_pokemon_name ON pokemon(name); -- Luego la misma consulta`
      },
      mejoraPercent: mejora,
      conclusion: mejora > 0
        ? `El índice mejoró el rendimiento en un ${mejora}%`
        : 'El índice no mostró mejora significativa (dataset pequeño)'
    });
  } catch (error) {
    console.error("Error en benchmark:", error);
    res.status(500).json({ error: "Error en benchmark" });
  }
});

// ═══════════════════════════════════════════════════
// TRANSACCIONES — Intercambio Seguro (Atomización)
// ═══════════════════════════════════════════════════

app.post('/api/intercambio', (req, res) => {
  try {
    const { entrenador1_id, pokemon1_id, entrenador2_id, pokemon2_id } = req.body;

    if (!entrenador1_id || !pokemon1_id || !entrenador2_id || !pokemon2_id) {
      return res.status(400).json({
        error: 'Se requieren: entrenador1_id, pokemon1_id, entrenador2_id, pokemon2_id'
      });
    }

    // Validate both captures exist and belong to correct trainers
    const captura1 = db.prepare(`
      SELECT c.id, c.entrenador_id, c.pokemon_id, c.nivel, p.name as pokemon_name, e.nombre as entrenador_name
      FROM capturas c
      JOIN pokemon p ON c.pokemon_id = p.id
      JOIN entrenadores e ON c.entrenador_id = e.id
      WHERE c.pokemon_id = ? AND c.entrenador_id = ?
      LIMIT 1
    `).get(pokemon1_id, entrenador1_id);

    const captura2 = db.prepare(`
      SELECT c.id, c.entrenador_id, c.pokemon_id, c.nivel, p.name as pokemon_name, e.nombre as entrenador_name
      FROM capturas c
      JOIN pokemon p ON c.pokemon_id = p.id
      JOIN entrenadores e ON c.entrenador_id = e.id
      WHERE c.pokemon_id = ? AND c.entrenador_id = ?
      LIMIT 1
    `).get(pokemon2_id, entrenador2_id);

    if (!captura1) {
      return res.status(404).json({
        error: `El entrenador ${entrenador1_id} no tiene al Pokémon ${pokemon1_id} capturado`
      });
    }

    if (!captura2) {
      return res.status(404).json({
        error: `El entrenador ${entrenador2_id} no tiene al Pokémon ${pokemon2_id} capturado`
      });
    }

    // Perform the trade inside a TRANSACTION
    // In better-sqlite3, db.transaction() wraps in BEGIN/COMMIT/ROLLBACK automatically
    const trade = db.transaction(() => {
      // Swap trainer IDs
      const update1 = db.prepare('UPDATE capturas SET entrenador_id = ? WHERE id = ?')
        .run(entrenador2_id, captura1.id);

      if (update1.changes !== 1) {
        throw new Error('Fallo al actualizar la captura del entrenador 1 — ROLLBACK');
      }

      const update2 = db.prepare('UPDATE capturas SET entrenador_id = ? WHERE id = ?')
        .run(entrenador1_id, captura2.id);

      if (update2.changes !== 1) {
        throw new Error('Fallo al actualizar la captura del entrenador 2 — ROLLBACK');
      }
    });

    // Execute the transaction — will auto-rollback on error
    trade();

    res.json({
      message: '¡Intercambio completado con éxito!',
      intercambio: {
        entrenador1: {
          nombre: captura1.entrenador_name,
          dio: captura1.pokemon_name,
          recibio: captura2.pokemon_name
        },
        entrenador2: {
          nombre: captura2.entrenador_name,
          dio: captura2.pokemon_name,
          recibio: captura1.pokemon_name
        }
      }
    });
  } catch (error) {
    console.error("Error en intercambio (ROLLBACK ejecutado):", error);
    res.status(500).json({
      error: 'El intercambio ha fallado. La transacción se ha revertido (ROLLBACK). Ningún Pokémon fue intercambiado.',
      detalle: error.message
    });
  }
});

// ═══════════════════════════════════════════════════
// HELPERS — Entrenadores y Capturas
// ═══════════════════════════════════════════════════

// Get all trainers
app.get('/api/entrenadores', (req, res) => {
  try {
    const entrenadores = db.prepare(`
      SELECT e.*, COUNT(c.id) as total_capturas
      FROM entrenadores e
      LEFT JOIN capturas c ON e.id = c.entrenador_id
      GROUP BY e.id
      ORDER BY e.nombre
    `).all();
    res.json(entrenadores);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get captures by trainer
app.get('/api/entrenadores/:id/capturas', (req, res) => {
  try {
    const trainerId = parseInt(req.params.id);
    const capturas = db.prepare(`
      SELECT c.id, c.nivel, c.fecha_captura, p.id as pokemon_id, p.name, p.type1, p.type2, p.sprite,
             p.hp, p.attack, p.defense, p.sp_attack, p.sp_defense, p.speed
      FROM capturas c
      JOIN pokemon p ON c.pokemon_id = p.id
      WHERE c.entrenador_id = ?
      ORDER BY c.nivel DESC
    `).all(trainerId);

    const formatted = capturas.map(c => ({
      captura_id: c.id,
      nivel: c.nivel,
      fecha_captura: c.fecha_captura,
      pokemon: {
        id: c.pokemon_id,
        name: c.name,
        type: c.type2 ? [c.type1, c.type2] : [c.type1],
        sprite: c.sprite
      }
    }));
    res.json(formatted);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Pokémon API server running at http://localhost:${port}`);
  console.log('Endpoints disponibles:');
  console.log('  GET  /api/pokemons          — Listar Pokémon (con filtros)');
  console.log('  GET  /api/pokemons/buscar    — Buscar por nombre (con timing)');
  console.log('  GET  /api/pokemons/random    — Pokémon aleatorios');
  console.log('  GET  /api/pokemons/:id/details — Detalles de PokeAPI');
  console.log('  GET  /api/types             — Tipos disponibles');
  console.log('  GET  /api/top-competitivo   — Vista Top 10 Competitivo');
  console.log('  GET  /api/benchmark         — Benchmark con/sin índice');
  console.log('  POST /api/capturas          — Capturar Pokémon');
  console.log('  PUT  /api/capturas/:id/entrenar — Entrenar/Evolucionar');
  console.log('  DELETE /api/capturas/:id    — Liberar Pokémon');
  console.log('  POST /api/intercambio       — Intercambio atómico');
  console.log('  GET  /api/entrenadores      — Listar entrenadores');
  console.log('  GET  /api/entrenadores/:id/capturas — Capturas de un entrenador');
});

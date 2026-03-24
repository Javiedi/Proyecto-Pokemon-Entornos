const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pokedex.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokemon (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      type1 TEXT NOT NULL,
      type2 TEXT,
      base_experience INTEGER DEFAULT 0,
      sprite TEXT,
      hp INTEGER DEFAULT 0,
      attack INTEGER DEFAULT 0,
      defense INTEGER DEFAULT 0,
      sp_attack INTEGER DEFAULT 0,
      sp_defense INTEGER DEFAULT 0,
      speed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS entrenadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS capturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entrenador_id INTEGER NOT NULL,
      pokemon_id INTEGER NOT NULL,
      nivel INTEGER DEFAULT 1,
      fecha_captura TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
    );

    CREATE TABLE IF NOT EXISTS evoluciones (
      pokemon_id INTEGER NOT NULL,
      evolucion_id INTEGER NOT NULL,
      nivel_requerido INTEGER DEFAULT 16,
      PRIMARY KEY (pokemon_id),
      FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
      FOREIGN KEY (evolucion_id) REFERENCES pokemon(id)
    );
  `);

  // Create view vista_top_competitivo
  db.exec(`
    DROP VIEW IF EXISTS vista_top_competitivo;
    CREATE VIEW vista_top_competitivo AS
    SELECT
      id,
      name,
      type1,
      type2,
      hp,
      attack,
      defense,
      sp_attack,
      sp_defense,
      speed,
      sprite,
      (hp + attack + defense + sp_attack + sp_defense + speed) AS total_stats
    FROM pokemon
    ORDER BY total_stats DESC
    LIMIT 10;
  `);
}

module.exports = { getDb };

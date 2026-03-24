-- Crear índice en la columna 'name' de la tabla 'pokemon'
-- Mejora drásticamente el rendimiento de búsquedas por nombre (WHERE name LIKE '%...%')

-- Para comparar rendimiento ANTES y DESPUÉS:
-- 1. Sin índice: ejecutar SELECT * FROM pokemon WHERE name LIKE '%pikachu%';
-- 2. Crear índice:
CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);
-- 3. Con índice: ejecutar la misma consulta y comparar tiempos

-- El endpoint /api/benchmark del servidor hace esta comparación automáticamente.

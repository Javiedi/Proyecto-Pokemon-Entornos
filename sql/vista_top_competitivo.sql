-- Vista: Top 10 Pokémon Competitivos por suma de estadísticas base
-- Esta vista suma HP + Ataque + Defensa + At.Esp + Def.Esp + Velocidad
-- y devuelve los 10 mejores.

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

-- Ejemplo de uso:
-- SELECT * FROM vista_top_competitivo;

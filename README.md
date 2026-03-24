# 🐉 Pokedex Pro - Sistema de Gestión Pokémon de Alto Rendimiento
Esta aplicación es una versión avanzada de una Pokédex que integra funcionalidades críticas de bases de datos, optimización de consultas y automatización de procesos mediante Gulp. 
---
## Funcionalidades Principales

### 1. Gestión Dinámica (CRUD)
Se han implementado operaciones completas para la gestión del equipo:
* **Capturar (INSERT):** Registro automático de Pokémon asociados a un entrenador.
* **Entrenar y Evolucionar (UPDATE):** Mejora de estadísticas y cambio de especie automático al alcanzar el nivel necesario.
* **Liberar (DELETE):** Eliminación segura de registros con validación de existencia.

### 2. Optimización y Big Data (Índices)
Para simular un entorno real, la base de datos cuenta con **más de 1000 registros**. 
* Se implementó un **Índice B-Tree** en la columna `nombre`.
* **Resultado:** Mejora drástica en la velocidad del buscador en tiempo real, reduciendo el tiempo de respuesta del servidor.

### 3. Transacciones Seguras (Intercambios)
El sistema de intercambio entre entrenadores garantiza la integridad de los datos siguiendo el principio **ACID**:
* Uso de `START TRANSACTION`, `COMMIT` y `ROLLBACK`.
* Si falla la entrega de uno de los Pokémon, la operación se revierte por completo para evitar pérdidas.

### 4. Salón de la Fama (Vistas SQL)
Implementación de la vista `vista_top_competitivo` que calcula el Top 10 de Pokémon basándose en la sumatoria de sus estadísticas base.

---

##  Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React.js & SCSS (Estructura Modular Partials) |
| **Backend** | Node.js / Express |
| **Base de Datos** | MySQL |
| **Automatización** | Gulp (Compilación, Minificación y Watch) |
| **Datos Externos** | XML con validación XSD |

---

## Estructura del Proyecto SASS

Siguiendo las buenas prácticas, los estilos se han dividido de forma modular:
```text
src/scss/
├── base/          # _reset.scss, _variables.scss
├── components/    # _card.scss, _form.scss, _search.scss
├── layout/        # _grid.scss (Dashboard Layout)
└── main.scss      # Archivo maestro de importación

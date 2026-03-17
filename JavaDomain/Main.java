package JavaDomain;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== INICIANDO SIMULACIÓN POKÉMON ===\n");

        // 1. Guardarlos en un catálogo
        CatalogoPokemon pokedex = new CatalogoPokemon(10);

        // 2. Crear objetos Pokémon con Composición (Estadisticas)
        PokemonBase charizard = new PokemonFuego("Charizard", 36, new Estadisticas(120, 84, 78));
        PokemonBase squirtle = new PokemonAgua("Squirtle", 5, new Estadisticas(44, 48, 65));
        PokemonBase magmar = new PokemonFuego("Magmar", 30, new Estadisticas(65, 95, 57));

        pokedex.agregar(charizard);
        pokedex.agregar(squirtle);
        pokedex.agregar(magmar);

        System.out.println("\n--- BÚSQUEDA POR NOMBRE ---");
        // 3. Buscar por nombre
        String nomBuscado = "Squirtle";
        PokemonBase buscado = pokedex.buscarPorNombre(nomBuscado);
        if (buscado != null) {
            System.out.println("Encontrado: " + buscado.getNombre());
            buscado.mostrarInfoResumida(); // 4. Mostrar información resumida
        } else {
            System.out.println("No se encontró a " + nomBuscado);
        }

        System.out.println("\n--- FILTRO POR TIPO ---");
        // 5. Filtrar por tipo
        System.out.println("Buscando todos los tipo Fuego:");
        PokemonBase[] tipoFuego = pokedex.filtrarPorTipo("Fuego");
        for (PokemonBase p : tipoFuego) {
            p.mostrarInfoResumida();
        }

        System.out.println("\n--- CREACIÓN DE EQUIPO ---");
        // 6. Crear un equipo con varios Pokémon
        Entrenador ash = new Entrenador("Ash Ketchum");
        ash.agregarAEquipo(charizard);
        ash.agregarAEquipo(squirtle);
        System.out.println();
        ash.mostrarEquipo();

        System.out.println("\n--- SIMULACIÓN DE COMBATE ---");
        System.out.println(charizard.getNombre() + " dice: " + charizard.getTipoGrito());
        charizard.atacar(squirtle);
    }
}

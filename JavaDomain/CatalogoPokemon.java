package JavaDomain;

public class CatalogoPokemon {
    private PokemonBase[] catalogo;
    private int cantidad;

    public CatalogoPokemon(int maxCapacidad) {
        this.catalogo = new PokemonBase[maxCapacidad];
        this.cantidad = 0;
    }

    public void agregar(PokemonBase p) {
        if (cantidad < catalogo.length) {
            catalogo[cantidad] = p;
            cantidad++;
            System.out.println(p.getNombre() + " añadido al catálogo.");
        } else {
            System.out.println("El catálogo está lleno.");
        }
    }

    public PokemonBase buscarPorNombre(String nombre) {
        for (int i = 0; i < cantidad; i++) {
            if (catalogo[i].getNombre().equalsIgnoreCase(nombre)) {
                return catalogo[i];
            }
        }
        return null;
    }

    public PokemonBase[] filtrarPorTipo(String tipo) {
        int contador = 0;
        for (int i = 0; i < cantidad; i++) {
            if (catalogo[i].getTipo().equalsIgnoreCase(tipo)) {
                contador++;
            }
        }
        
        PokemonBase[] filtrados = new PokemonBase[contador];
        int indice = 0;
        for (int i = 0; i < cantidad; i++) {
            if (catalogo[i].getTipo().equalsIgnoreCase(tipo)) {
                filtrados[indice] = catalogo[i];
                indice++;
            }
        }
        return filtrados;
    }
    
    public void mostrarTodos() {
        System.out.println("=== Catálogo de Pokémon ===");
        for(int i=0; i<cantidad; i++){
            catalogo[i].mostrarInfoResumida();
            System.out.println("-------------------------");
        }
    }
}

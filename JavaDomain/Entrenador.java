package JavaDomain;

public class Entrenador {
    private String nombre;
    private PokemonBase[] equipo; // Asociación/Agregación
    private int cantidadEquipo;

    public Entrenador(String nombre) {
        this.nombre = nombre;
        this.equipo = new PokemonBase[6];
        this.cantidadEquipo = 0;
    }

    public boolean agregarAEquipo(PokemonBase p) {
        if (cantidadEquipo < equipo.length) {
            equipo[cantidadEquipo] = p;
            cantidadEquipo++;
            System.out.println(p.getNombre() + " se ha unido al equipo de " + this.nombre + ".");
            return true;
        } else {
            System.out.println("El equipo de " + this.nombre + " ya está lleno (Máx 6).");
            return false;
        }
    }

    public void mostrarEquipo() {
        System.out.println("=== Equipo de " + nombre + " ===");
        if (cantidadEquipo == 0) {
            System.out.println("El equipo está vacío.");
        } else {
            for (int i = 0; i < cantidadEquipo; i++) {
                equipo[i].mostrarInfoResumida();
            }
        }
    }
}

package JavaDomain;

public class PokemonFuego extends PokemonBase {
    public PokemonFuego(String nombre, int nivel, Estadisticas estadisticas) {
        super(nombre, "Fuego", nivel, estadisticas);
    }

    @Override
    public String getTipoGrito() {
        return "¡Fiuuu, soy de fuego!";
    }
}

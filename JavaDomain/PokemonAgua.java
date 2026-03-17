package JavaDomain;

public class PokemonAgua extends PokemonBase {
    public PokemonAgua(String nombre, int nivel, Estadisticas estadisticas) {
        super(nombre, "Agua", nivel, estadisticas);
    }

    @Override
    public String getTipoGrito() {
        return "¡Glu glu, soy de agua!";
    }
}

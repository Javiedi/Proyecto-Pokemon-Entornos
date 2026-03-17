package JavaDomain;

public abstract class PokemonBase implements ICombatiente {
    private String nombre;
    private String tipo;
    private int nivel;
    private Estadisticas estadisticas;

    public PokemonBase(String nombre, String tipo, int nivel, Estadisticas estadisticas) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.nivel = nivel;
        this.estadisticas = estadisticas;
    }

    public abstract String getTipoGrito();

    public void mostrarInfoResumida() {
        System.out.println("Pokémon: " + nombre + " (Nv. " + nivel + ") - Tipo: " + tipo);
        System.out.println("Stats -> " + estadisticas.toString());
    }

    public String getNombre() { return nombre; }
    public String getTipo() { return tipo; }
    public int getNivel() { return nivel; }
    public Estadisticas getEstadisticas() { return estadisticas; }

    @Override
    public void atacar(PokemonBase objetivo) {
        System.out.println(this.nombre + " ataca a " + objetivo.getNombre() + "!");
        int dano = this.estadisticas.getAtaque();
        objetivo.defender(dano);
    }

    @Override
    public void defender(int dano) {
        int danoReal = dano - (this.estadisticas.getDefensa() / 2);
        if (danoReal < 1) danoReal = 1;
        
        int nuevoHp = this.estadisticas.getHp() - danoReal;
        this.estadisticas.setHp(Math.max(0, nuevoHp));
        
        System.out.println(this.nombre + " recibe " + danoReal + " de daño. HP restante: " + this.estadisticas.getHp());
    }
}

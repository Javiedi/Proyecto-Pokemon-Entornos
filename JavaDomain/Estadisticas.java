package JavaDomain;

public class Estadisticas {
    private int hp;
    private int ataque;
    private int defensa;

    public Estadisticas(int hp, int ataque, int defensa) {
        this.hp = hp;
        this.ataque = ataque;
        this.defensa = defensa;
    }

    public int getHp() { return hp; }
    public void setHp(int hp) { this.hp = hp; }
    public int getAtaque() { return ataque; }
    public int getDefensa() { return defensa; }
    
    @Override
    public String toString() {
        return "HP: " + hp + " | ATQ: " + ataque + " | DEF: " + defensa;
    }
}

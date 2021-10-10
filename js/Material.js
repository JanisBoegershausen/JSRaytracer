class Material {
    constructor(color, roughness) {
        this.color = color;
        this.roughness = roughness;
    }

    static Mirror = new Material(new Color(0, 0, 0, 255), 0);

    static Random() {
        return new Material(Color.Random(), RandomInRange(0, 1));
    }
}
class Material {
    constructor(color, roughness) {
        this.color = color;
        this.roughness = roughness;
    }

    // Static materials
    static Mirror = new Material(new Color(0, 0, 0, 255), 0);

    // Return a random material with a random color and a roughness between 0.25 and 1
    static Random() {
        return new Material(Color.Random(), RandomInRange(0.25, 1));
    }
}
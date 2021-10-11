class Light {
    constructor(position, brightness) {
        this.position = position;
        this.brightness = brightness;
    }
    
    static GetInverseSquare(distanceFromLight) {
        return 1/Math.pow(distanceFromLight, 2);
    }
}
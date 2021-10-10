class Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a != null ? a : 255;
  }

  static Red = new Color(255, 0, 0, 255);
  static Green = new Color(0, 255, 0, 255);
  static Blue = new Color(0, 0, 255, 255);

  static Random() {
    return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 255);
  }

  static Mix(a, b, t) {
    return new Color(Lerp(a.r, b.r, t), Lerp(a.g, b.g, t), Lerp(a.b, b.b, t), Lerp(a.a, b.a, t));
  }
}

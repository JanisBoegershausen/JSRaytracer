class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static forward = new Vector(0, 0, -1);

  normalized() {
    var m = this.mag();
    return new Vector(this.x / m, this.y / m, this.z / m);
  }

  mag() {
    return Math.sqrt(this.sqrtmag());
  }

  sqrtmag() {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
  }

  static Add(a, b) {
    return new Vector(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  static AddFloat(a, f) {
    return new Vector(a.x + f, a.y + f, a.z + f);
  }

  static Sub(a, b) {
    return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static Mult(a, b) {
    return new Vector(a.x * b.x, a.y * b.y, a.z * b.z);
  }

  static Div(a, b) {
    return new Vector(a.x / b.x, a.y / b.y, a.z / b.z);
  }

  static Scale(a, s) {
    return new Vector(a.x * s, a.y * s, a.z * s);
  }

  static Cross(a, b) {
    return new Vector(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  static Dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  // Reflects the given direction on a plane with the given normal and returns the new direction
  static Reflect(inDirection, normal) {
    inDirection = inDirection.normalized();
    normal = normal.normalized();
    return Vector.Sub(inDirection, Vector.Scale(normal, Vector.Dot(inDirection, normal) * 2)).normalized();
  }
}

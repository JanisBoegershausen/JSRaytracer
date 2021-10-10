function Square(a, b, c, d, name) {
  var triangles = [];
  
  triangles.push(new Triangle(a, b, d, { r: 255, g: 0, b: 0, a: 255 }, name));
  triangles.push(new Triangle(b, c, d, { r: 0, g: 255, b: 0, a: 255 }, name));

  var color = Color.Random();

  for(var i = 0; i < triangles.length; i++) {
    triangles[i].color = color;
  }

  return triangles;
}

function CubeFromCorners(a, b, c, d, e, f, g, h, name) {
  var triangles = [];

  triangles = triangles.concat(Square(a, b, c, d, name)); // Front
  triangles = triangles.concat(Square(e, f, g, h, name)); // Back
  triangles = triangles.concat(Square(g, c, b, f, name)); // Right
  triangles = triangles.concat(Square(a, e, h, d, name)); // Left
  triangles = triangles.concat(Square(a, b, f, e, name)); // Up
  triangles = triangles.concat(Square(c, d, h, g, name)); // Down

  return triangles;
}

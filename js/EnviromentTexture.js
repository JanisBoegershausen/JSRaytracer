class EnviromentTexture {
  constructor() {
    this.pixels = [];
    this.width = 0;
    this.height = 0;
  }

  // Load the data of an img element with the given id into this EnviromentTexture.
  LoadFromImage(imgElementId) {
    // Clear the pixels array
    this.pixels = [];

    // Create an invisible canvas and get its context
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    // Get a reference to the img element containing the hdri we want to load
    var img = document.getElementById(imgElementId);

    // Set canvas the canvas size to the size of the image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw the image onto the canvas
    context.drawImage(img, 0, 0);

    // Read the pixels from the canvas
    var imageData = context.getImageData(0, 0, img.naturalWidth, img.naturalHeight);

    // Set the dimensions of this EnviromentTexture
    this.width = imageData.width;
    this.height = imageData.height;

    // Iterate through all the pixel data in the imageData and store it in the pixels array
    for (var x = 0; x < this.width; x += 1) {
      this.pixels[x] = [];
      for (var y = 0; y < this.height; y += 1) {
        var colorStartIndex = this.ImageDataArrayIndexFromTextureCoordinate(x, y);
        this.pixels[x][y] = {
          r: imageData.data[colorStartIndex],
          g: imageData.data[colorStartIndex + 1],
          b: imageData.data[colorStartIndex + 2],
          a: imageData.data[colorStartIndex + 3],
        };
      }
    }
  }

  // Get the index for the red pixel in an int array containing all RGBA values for all pixels from the given coordinates in a range from 0 to width/height
  ImageDataArrayIndexFromTextureCoordinate(x, y) {
    return Math.floor(x + this.width * y) * 4;
  }

  // Get the color in a given direction. 
  Sample(direction) {
    // Normalize direction
    direction = direction.normalized();

    // Calculate angle around the Y Axis using formula for angles of 2d vectors. This way we ignore the z component completly. 
    var a = direction.x * Vector.forward.x + direction.z * Vector.forward.z;
    var b = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.z, 2)) * Math.sqrt(Math.pow(Vector.forward.x, 2) + Math.pow(Vector.forward.z, 2));
    var angleAlongY = a / b;
    angleAlongY = Math.acos(angleAlongY);

    // Convert angle from radians to degrees
    angleAlongY = angleAlongY * (180 / Math.PI);

    // Make angle go from 0 to 360 clockwise instead of from 0 to 180 in both directions
    if (direction.x < 0) {
      angleAlongY = angleAlongY * -1 + 360;
    }

    // Calculate uv in range from 0 to 1
    var uv = {
      x: angleAlongY / 360,
      y: (direction.y + 1) / 2 // This might cause distortion towards the horizon
    };

    // Calculate textureCoordinate in range from 0 to width/height
    var textureCoordinate = {
      x: Math.floor(uv.x * this.width),
      y: Math.floor((1-uv.y) * this.height),
    };

    // Return the sampled color
    return this.pixels[textureCoordinate.x][textureCoordinate.y];
  }
}

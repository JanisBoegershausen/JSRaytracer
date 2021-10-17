// Resolution of the raytracer.
var resolution = { x: 512, y: 512 };

var triangles = [];
var renderWorkers = [];
var enviromentTexture;
var sceneLights = [];

var settings = {
  // Raytracer settings
  useRealtimeMode: false,
  horizontalTileCount: 2,
  verticalTileCount: 2,
  bounces: 5,
  
  // Camera
  cameraPosition: null,
  cameraFovMult: 1.5,
}

function setup() {
  // Create a new canvas which is used by the raytracer
  InitializeNewCanvas();

  // Create and load an EnvriomentTexture using the texture at the bottom of the page
  enviromentTexture = new EnviromentTexture();
  enviromentTexture.LoadFromImage("hdri");

  // Set the camera position to the center of the world
  settings.cameraPosition = new Vector(0, 1, 1);

  // Square facing camera
  triangles = triangles.concat(Square(new Vector(-1, 0, -3), new Vector(-1, 1, -4), new Vector(1, 1, -4), new Vector(1, 0, -3), "Facing Camera"));
  // Square facing right
  triangles = triangles.concat(Square(new Vector(-1, 0, 0), new Vector(-1, 2, 0), new Vector(-1, 2, -3), new Vector(-1, 0, -3), "Facing Right"));
  // Square facing left
  triangles = triangles.concat(Square(new Vector(1, 0, -2), new Vector(1, 1, -2), new Vector(2, 1, -1), new Vector(2, 0, -1), "Facing Left"));
  // Create ground plane
  var groundY = 0;
  triangles = triangles.concat(Square(new Vector(-30, groundY, -30), new Vector(30, groundY, -30), new Vector(30, groundY, 30), new Vector(-30, groundY, 30), "Ground"));

  // Create light
  sceneLights.push(new Light(new Vector(-0.5, 0.5, -1.5), 1));
  sceneLights.push(new Light(new Vector(1.0, 0.5, -0.5), 1));

  // Intitalize the raytracers interface and set the starting values of the inputs
  InitializeInterface();

  // Intitalize the workers and send starting data
  InitializeWorkers();
  SendAllData();

  // Start rendering the scene once
  StartRender();
}

function draw() {
  // Todo: Show info about the renderer using html elements
}

// Tell all workers to render their dedicated area, send the result to be drawn and then wait for new messages.
// If settings.useRealtime == true, this starts a loop
function StartRender() {
  background(0);
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: settings.useRealtimeMode ? "StartLoop" : "RenderOnce",
    });
  }
}

// Called by a renderworker. Pixels is a 2d array of colors (rgba) of the entire screen (resolution.x, resolution.y).
// Only the pixels the worker is tasked to render are set.
function OnRenderWorkerDone(pixels) {
  // Iterate through all pixels in the recieved array
  for (var x = 0; x < resolution.x; x += 1) {
    for (var y = 0; y < resolution.y; y += 1) {
      // Check if the pixel is set
      if (pixels.data[x] != null && pixels.data[x][y] != null) {
        // Only if the pixel is set, draw it. Otherwise don't do anything
        var color = pixels.data[x][y];
        DrawPixel(x, y, color.r, color.g, color.b, color.a, resolution.x, resolution.y);
      }
    }
  }
}

// Draw a rectangle given a point in scaled coordinates and its color. (If resolutionWidth == 10, x = 9 would be at the far right end of the screen)
function DrawPixel(x, y, r, g, b, a, resolutionX, resolutionY) {
  fill(r, g, b, a);
  stroke(r, g, b, a);
  strokeWeight(1);

  posX = (x / resolutionX) * width;
  posY = (y / resolutionY) * height;

  rect(posX, posY, width / resolutionX, width / resolutionY);
}

// Canvas helper functions:

// Create a new canvas and set it to be a child of the rayTracer-canvas element
function InitializeNewCanvas() {
  var sketchHolder = document.getElementById("rayTracer-canvas");
  var canvas = createCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);
  canvas.parent("rayTracer-canvas");
}

// Called when the window is resized
function windowResized() {
  ResizeCanvasToFit();
}

// Resize the canvas to fit the rayTracer-canvas element
function ResizeCanvasToFit() {
  var sketchHolder = document.getElementById("rayTracer-canvas");
  if (sketchHolder.offsetWidth != width || sketchHolder.offsetHeight != height) {
    resizeCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);
  }
}

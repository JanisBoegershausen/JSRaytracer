// Resolution of the raytracer.
var resolution = { x: 500, y: 500 };

// List of all triangles that are rendered
var triangles = [];

// Camera settings and data
var camPos = null;
var cameraFovMult = 1.5;

// Worker settings and data
var renderWorkers = [];
var horizontalTileCount = 1;
var verticalTileCount = 1;

var enviromentTexture;

function setup() {
  // Create a new canvas which is used by the raytracer
  InitializeNewCanvas();

  // Create and load an EnvriomentTexture using the texture at the bottom of the page
  enviromentTexture = new EnviromentTexture();
  enviromentTexture.LoadFromImage("hdri");

  // Set the camera position to the center of the world
  camPos = new Vector(0, 1, 1);

  // Square facing camera
  triangles = triangles.concat(Square(new Vector(-1, 0, -3), new Vector(-1, 1, -4), new Vector(1, 1, -4), new Vector(1, 0, -3), "Facing Camera"));
  // Square facing right
  triangles = triangles.concat(Square(new Vector(-1, 0, 0), new Vector(-1, 2, 0), new Vector(-1, 2, -3), new Vector(-1, 0, -3), "Facing Right"));
  // Square facing left
  triangles = triangles.concat(Square(new Vector(1, 0, -2), new Vector(1, 1, -2), new Vector(2, 1, -1), new Vector(2, 0, -1), "Facing Left"));
  // Create ground plane
  var groundY = 0;
  triangles = triangles.concat(Square(new Vector(-30, groundY, -30), new Vector(30, groundY, -30), new Vector(30, groundY, 30), new Vector(-30, groundY, 30), "Ground"));
  
  // Create one worker for each tile
  var tileWidth = Math.floor(resolution.x / horizontalTileCount);
  var tileHeight = Math.floor(resolution.y / verticalTileCount);
  for (var x = 0; x < horizontalTileCount; x += 1) {
    for (var y = 0; y < verticalTileCount; y += 1) {
      CreateWorker(Math.floor(x * tileWidth), Math.floor(y * tileHeight), tileWidth, tileHeight);
    }
  }

  // Start rendering the scene once
  StartRenderFrame();
}

function draw() {
  // Todo: Show info about the renderer using html elements

  // Rerender using the enter key
  if (keyIsDown(13)) {
    StartRenderFrame();
  }
}

// Tell all workers to render their dedicated area once, send the result to be drawn and then wait for new messages.
function StartRenderFrame() {
  background(0);
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "RenderOnce",
    });
  }
}

// Create a worker which is dedicated to rendering the given rectangle.
function CreateWorker(x, y, w, h) {
  // Create a new worker from the RenderWorker.js script and add it to our list of workers
  var worker = new Worker("js/RenderWorker.js");
  renderWorkers.push(worker);

  // Assign the function which handles messages that are send from the worker to this script
  worker.onmessage = OnRenderWorkerDone;

  // Send resolution to the worker
  worker.postMessage({
    type: "SetResolution",
    resolution: resolution,
  });

  // Send the workers area to the worker
  worker.postMessage({
    type: "AssignArea",
    x: x,
    y: y,
    w: w,
    h: h,
  });

  // Send the enviromentTexture to the worker
  worker.postMessage({
    type: "SetEnviroment",
    enviromentTexture: enviromentTexture,
  });

  // Send the triangles to the worker
  worker.postMessage({
    type: "SetTriangles",
    triangles: triangles,
  });

  // Send the camera data to the worker
  worker.postMessage({
    type: "SetCamData",
    camPos: Vector.Mult(camPos, new Vector(1, 1, 1)), // HERE I INVERT THE VECTOR! THIS IS BECAUSE OTHERWISE THE SCENE IS INVERTED! FIND OUT WHY!!!
    cameraFovMult: cameraFovMult,
  });
}

// Sends the current camera data (position) to all workers
function UpdateCameraDataForAllWorkers() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetCamPos",
      camPos: camPos,
    });
  }
}

// Called by a renderworker. Pixels is a 2d array of colors (rgba) of the entire screen (resolution.x, resolution.y).
// Only the pixels the worker is tasked to render are set.
function OnRenderWorkerDone(pixels) {
  // Iterate through all pixels in the recieved array
  for (var x = 0; x < resolution.x; x += 1) {
    for (var y = 0; y < resolution.x; y += 1) {
      // Check if the pixel is set
      if (pixels.data[x] != null && pixels.data[x][y] != null) {
        // Only if the pixel is set, draw it. Otherwise don't do anything
        var color = pixels.data[x][y];
        DrawPixel(x, y, color.r, color.g, color.b, color.a);
      }
    }
  }
}

// Draw a rectangle given a point in scaled coordinates and its color. (If resolutionWidth == 10, x = 9 would be at the far right end of the screen)
function DrawPixel(x, y, r, g, b, a) {
  fill(r, g, b, a);
  strokeWeight(0);
  noStroke();

  posX = (x / resolution.x) * width;
  posY = (y / resolution.y) * height;

  rect(posX, posY, width / resolution.x, width / resolution.y);
}

// Canvas helper functions:

// Create a new canvas and set it to be a child of the rayTracer-canvas element
function InitializeNewCanvas() {
  var sketchHolder = document.getElementById("rayTracer-canvas");
  var canvas = createCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);
  canvas.parent("rayTracer-canvas");
}

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

// Initializes workers for the current resolution and tile settings
function InitializeWorkers() {
  KillAllWorkers();

  // Create one worker for each tile
  var tileWidth = Math.floor(resolution.x / horizontalTileCount);
  var tileHeight = Math.floor(resolution.y / verticalTileCount);
  for (var x = 0; x < horizontalTileCount; x += 1) {
    for (var y = 0; y < verticalTileCount; y += 1) {
      CreateWorker(Math.floor(x * tileWidth), Math.floor(y * tileHeight), tileWidth, tileHeight);
    }
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
}

function KillAllWorkers() {
  renderWorkers.forEach((worker) => {
    worker.terminate();
  });

  renderWorkers = [];
}

function SendAllData() {
  SendCameraData();
  SendLights();
  SendTriangles();
  SendEnviroment();
}

// Sends the camera data to all workers
function SendCameraData() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetCamData",
      camPos: camPos,
      cameraFovMult: cameraFovMult,
    });
  }
}

// Send the lights to the worker
function SendLights() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetLights",
      lights: sceneLights,
    });
  }
}

// Send the triangles to the worker
function SendTriangles() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetTriangles",
      triangles: triangles,
    });
  }
}

// Send the triangles to the worker
function SendEnviroment() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetEnviroment",
      enviromentTexture: enviromentTexture,
    });
  }
}

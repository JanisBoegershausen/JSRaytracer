// Initializes workers for the current resolution and tile settings
function InitializeWorkers() {
  // Kill all old workers since we are now creating new ones
  KillAllWorkers();

  // Calculate the size of each tile based on resolution and tile count
  var tileWidth = Math.ceil(resolution.x / settings.horizontalTileCount);
  var tileHeight = Math.ceil(resolution.y / settings.verticalTileCount);

  // Create one worker for each tile
  for (var x = 0; x < settings.horizontalTileCount; x += 1) {
    for (var y = 0; y < settings.verticalTileCount; y += 1) {
      CreateWorker(Math.floor(x * tileWidth), Math.floor(y * tileHeight), tileWidth, tileHeight);
    }
  }
}

// Create a worker which is dedicated to rendering the given rectangle
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

  // Send the workers tile-area to the worker
  worker.postMessage({
    type: "AssignArea",
    x: x,
    y: y,
    w: w,
    h: h,
  });
}

// Terminate all worlers and remove them from the renderWorker list
function KillAllWorkers() {
  renderWorkers.forEach((worker) => {
    worker.terminate();
  });

  renderWorkers = [];
}

// Send all data needed by the RenderWorkers to all RenderWorkers
function SendAllData() {
  SendCameraData();
  SendBounceData();
  SendLights();
  SendTriangles();
  SendEnviroment();
}

// Sends the camera data to all workers
function SendCameraData() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetCamData",
      camPos: settings.cameraPosition,
      cameraFovMult: settings.cameraFovMult,
    });
  }
}

// Send the bounce data to all workers
function SendBounceData() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetBounces",
      bounces: settings.bounces
    });
  }
}

// Send the lights to the workers
function SendLights() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetLights",
      lights: sceneLights,
    });
  }
}

// Send the triangles to the workers
function SendTriangles() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetTriangles",
      triangles: triangles,
    });
  }
}

// Send the enviroment to the workers
function SendEnviroment() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetEnviroment",
      enviromentTexture: enviromentTexture,
    });
  }
}
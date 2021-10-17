// Set the interface elements to their starting state
function InitializeInterface() {
  // Set tile selector start value
  document.getElementById("tile-selector").value = "2";

  // Set realtime toggle to false on start
  document.getElementById("realtime-toggle").checked = false;

  // Set bounce slider start value
  document.getElementById("bounce-slider").value = 3;
  OnBounceSliderChange(document.getElementById("bounce-slider"));

  // Set resolution slider start value
  document.getElementById("resolution-slider").value = 70;
  OnResolutionSliderChange(document.getElementById("resolution-slider"));
  document.getElementById("start-render-button").disabled = true;
}

// Callback from "Intitalize Workers" button
function OnInitializeButtonClick(element) {
  InitializeWorkers();
  SendAllData();
  // Enable render button, since we are ready to render
  document.getElementById("start-render-button").disabled = false;
}

// Callback for tile selector
function OnTileSelection() {
  var tileCount = parseInt(document.getElementById("tile-selector").value);
  settings.horizontalTileCount = tileCount;
  settings.verticalTileCount = tileCount;
  // Disable render button, because workers need to be initialized
  document.getElementById("start-render-button").disabled = true;
}

// Callback for FOV slider
function OnFovSliderChange(element) {
  settings.cameraFovMult = Remap(element.value, 0, 100, 0.2, 1.5);
  SendCameraData();
}

// Callback for bounce slider
function OnBounceSliderChange(element) {
  // Save new bounce count setting
  settings.bounces = element.value;
  // Update text next to slider
  document.getElementById("bounce-display").textContent = settings.bounces;
  // Send the new bounce data to the workers
  SendBounceData();
}

// Callback for resolution slider
function OnResolutionSliderChange(element) {
  // Stop any renderWorkers, so there are no conflicts from the resolution change
  KillAllWorkers();
  // Calculate the nearest power of two as the new resolution
  var newRes = max(2, pow(2, ceil(Math.log2(pow(element.value / 100, 2) * 512))));
  resolution = new Vector(newRes, newRes);
  // Update the interace
  document.getElementById("start-render-button").disabled = true;
  document.getElementById("resolution-display").textContent = newRes + "px";
}

function OnRealtimeButtonClick(element) {
  settings.useRealtimeMode = element.checked;
  document.getElementById("start-render-button").disabled = true;
}

// Move the camera by the given vector
function MoveCamera(moveDelta) {
  // Add delta to the current camera position
  settings.cameraPosition = Vector.Add(settings.cameraPosition, moveDelta);
  // Send new position to the workers
  SendCameraData();
}
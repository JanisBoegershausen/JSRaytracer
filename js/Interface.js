// Set the interface elements to their starting state
function InitializeInterface() {
  // Reset tile selector
  document.getElementById("tile-selector").value = "2";

  // Set realtime toggle to false on start
  document.getElementById("realtime-toggle").checked = false;

  // Set resolution slider start value
  document.getElementById("resolution-slider").value = 100;
  OnResolutionSliderChange(document.getElementById("resolution-slider"));
  document.getElementById("start-render-button").disabled = true;
}

function OnInitializeButtonClick(element) {
  InitializeWorkers();
  SendAllData();
  document.getElementById("start-render-button").disabled = false;
}

function OnTileSelection() {
  settings.horizontalTileCount = parseInt(document.getElementById("tile-selector").value);
  settings.verticalTileCount = parseInt(document.getElementById("tile-selector").value);
  document.getElementById("start-render-button").disabled = true;
}

function OnFovSliderChange(element) {
  cameraFovMult = Remap(element.value, 0, 100, 0.2, 1.5);
  SendCameraData();
}

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

function MoveCamera(moveDelta) {
  settings.cameraPosition = Vector.Add(settings.cameraPosition, moveDelta);
  SendCameraData();
}
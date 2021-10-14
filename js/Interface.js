function OnInitializeButtonClick(element) {
  InitializeWorkers();
  SendAllData();
  document.getElementById("start-render-button").disabled = false;
}

function OnResolutionSliderChange(element) {
  // Stop any renderWorkers, so there are no conflicts from the resolution change
  KillAllWorkers();
  // Calculate the nearest power of two as the new resolution
  var newRes = max(2, pow(2, ceil(Math.log2(pow(element.value/100, 2) * 512))));
  resolution = new Vector(newRes, newRes);
  // Update the interace
  document.getElementById("start-render-button").disabled = true;
  document.getElementById("resolution-display").textContent = newRes + "px";
}

function OnRealtimeButtonClick(element) {
  settings.useRealtimeMode = element.checked;
  document.getElementById("start-render-button").disabled = true;
}
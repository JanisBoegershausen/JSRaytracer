function OnInitializeButtonClick(element) {
  InitializeWorkers();
  SendAllData();
  document.getElementById("start-render-button").disabled = false;
}

function OnResolutionSliderChange(element) {
  var newRes = max(2, pow(2, ceil(Math.log2(pow(element.value/100, 2) * 500))));
  resolution = new Vector(newRes, newRes);
  document.getElementById("start-render-button").disabled = true;
  document.getElementById("resolution-display").textContent = newRes + "px";
}

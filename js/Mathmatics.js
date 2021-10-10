// Return random float between minV and maxV
function random(minV, maxV) {
  var num = Math.random();
  return Remap(0, 1, minV, maxV);
}

// Remap x from the range (in_min to in_max) to the range (out_min, out_max)
function Remap(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) / (out_min - in_min)) * (out_max - in_max) + in_max;
}

function Lerp(a, b, t) {
  return a + (b - a) * t;
}
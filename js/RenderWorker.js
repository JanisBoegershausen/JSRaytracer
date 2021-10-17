// Import required scripts
importScripts("https://janisboegershausen.github.io/CommonUtilities.js/Mathmatics.js", "https://janisboegershausen.github.io/CommonUtilities.js/Vector3.js", "https://janisboegershausen.github.io/CommonUtilities.js/Color.js", "Triangle.js", "Light.js", "RayHitInfo.js", "EnviromentTexture.js");

// Settings contains all data the worker needs for rendering
settings = {
  // In realtime mode, pixel-skipping is enabled, which enhances performance, but introduces noise!
  useRealtimeMode: false,

  // List of triangles to be rendered (updated by RayTracer)
  triangles: [],

  lights: [],

  // Camera settings (updated by RayTracer)
  camPos: null,
  cameraFovMult: 1,

  // Current enviroment
  enviromentTexture: null,

  // Area this worker has to render
  area: { x: 0, y: 0, w: 100, h: 100 },
  resolution: new Vector(100, 100, 0),

  bounces: 5,
};

self.addEventListener("message", (e) => {
  if (e.data.type == "AssignArea") {
    console.log(`Setting area to: x: ${e.data.x}, y: ${e.data.y}, w: ${e.data.w}, h: ${e.data.h}. `);
    settings.area = e.data;
  } else if (e.data.type == "StartLoop") {
    // Start rendering loop. Random delay, so that the workers always complete their area at different
    // times and dont block each other when sending the pixels to the main script.
    settings.useRealtimeMode = true;
    setTimeout(StartRenderLoop, RandomInRange(0, 50));
  } else if (e.data.type == "RenderOnce") {
    settings.useRealtimeMode = false;
    setTimeout(RenderFrame, RandomInRange(0, 100));
  } else if (e.data.type == "SetTriangles") {
    SetTrianglesFromObjArray(e.data.triangles);
  } else if (e.data.type == "SetLights") {
    SetLightsFromObjArray(e.data.lights);
  } else if (e.data.type == "SetCamData") {
    settings.camPos = e.data.camPos;
    settings.cameraFovMult = e.data.cameraFovMult;
  } else if (e.data.type == "SetBounces") {
    settings.bounces = e.data.bounces;
  } else if (e.data.type == "SetResolution") {
    settings.resolution = e.data.resolution;
  } else if (e.data.type == "SetEnviroment") {
    settings.enviromentTexture = new EnviromentTexture();
    settings.enviromentTexture.pixels = e.data.enviromentTexture.pixels;
    settings.enviromentTexture.width = e.data.enviromentTexture.width;
    settings.enviromentTexture.height = e.data.enviromentTexture.height;
  }
});

// Start a renderloop on this worker, repeating the RenderFrame function.
function StartRenderLoop() {
  setInterval(RenderFrame, 100);
}

// Since objects loose their type when send to a worker, restore the type of the triangles and store them in the triangles array.
function SetTrianglesFromObjArray(objArray) {
  settings.triangles = [];
  for (var i = 0; i < objArray.length; i += 1) {
    settings.triangles.push(Object.assign(new Triangle(), objArray[i]));
  }
}

// Since objects loose their type when send to a worker, restore the type of the light and store them in the lights array.
function SetLightsFromObjArray(objArray) {
  settings.lights = [];
  for (var i = 0; i < objArray.length; i += 1) {
    settings.lights.push(Object.assign(new Light(), objArray[i]));
  }
}

// Render the dedicated area once and send the result back to RayTracer.js to be drawn.
function RenderFrame() {
  var pixels = [];
  for (var x = settings.area.x; x < settings.area.x + settings.area.w; x += 1) {
    pixels[x] = [];
    for (var y = settings.area.y; y < settings.area.y + settings.area.h; y += 1) {
      pixels[x][y] = RenderPixel(x, y);
    }
  }

  // Once completed, send the pixels to the RayTracer, so they can be drawn on the screen
  this.postMessage(pixels);
}

// Returns the color of a given pixel
function RenderPixel(x, y) {
  if (settings.useRealtimeMode) {
    // Raytracer skips random pixels based on their distance from the center for better performance. (Adds noise!)
    var pixelDistanceFromCenterSqrt = Math.abs((x - settings.resolution.x / 2) / settings.resolution.x) + Math.abs((y - settings.resolution.y / 2) / settings.resolution.y);
    var chanceToSkipPixel = 99.9;
    if (RandomInRange(0, 100) < chanceToSkipPixel * pixelDistanceFromCenterSqrt) {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
      };
    }
  }

  // Calculate the screen coordinate in a range between 0 and 1
  var uv = new Vector(x / settings.resolution.x, y / settings.resolution.y);

  // Get the direciton vector for the current pixel on the screen
  var origin = settings.camPos;
  var direction = GetRayDirection(uv.x, uv.y);

  // Trace the pixel and return the resulting color. The pixel at x=250 and y=400 is beeing logged to the console.
  return Trace(origin, direction, 0, x == 250 && y == 400);
}

// Traces a ray based on settings and returns color
function Trace(origin, direction, iteration, debugLog) {
  // Cast a ray from the origin into the direction
  var hit = CastRay(origin, direction);

  // Calculate the color of the ray
  var rayColor = hit != null ? hit.triangle.material.color : settings.enviromentTexture.Sample(direction);

  // For debugging. This allows printing the path of a single traced pixel
  if (debugLog) {
    console.log({
      origin: origin,
      direction: direction,
      hit: hit,
    });

    // Color the pixel we are debugging red
    rayColor = Color.Red;
  }

  var tracedColor;

  // Reflection using recusion
  if (hit != null) {
    if (iteration < settings.bounces) {
      // Calculate the reflection rays direction
      var newDirection = Vector.Reflect(direction, hit.triangle.GetNormal()).normalized();
      // Trace the reflection and mix the current color with the refleciton color
      var reflectionRayColor = Trace(hit.point, newDirection, iteration + 1, debugLog);
      // Return the mix between the ray and the reflection color based on the triangles roughness
      tracedColor = Color.Mix(rayColor, reflectionRayColor, 1 - hit.triangle.material.roughness);
    } else {
      // If this was the last bounce, set the traced color to the ray color, without tracing reflections
      tracedColor = rayColor;
    }
  } else {
    // If nothing was hit, just return the enviroment color
    return rayColor;
  }

  var brightness = 0;
  for (let i = 0; i < settings.lights.length; i++) {
    const light = settings.lights[i];
    // Cast a ray from the light source to the point in space we are calculating the lighting for
    var lightingRayDirection = Vector.Sub(hit.point, light.position).normalized();
    var lightingRayOrigin = light.position;
    var lightingRayHit = CastRay(lightingRayOrigin, lightingRayDirection);
    // Claculate the distance between the point and the current light
    var distancePointToLight = Vector.Distance(hit.point, light.position);
    // Check if the light form the current light reach the point, by checking if a surface is between the light and the point
    var isLitByLight = lightingRayHit == null || lightingRayHit.distance + 0.001 >= distancePointToLight;
    // If the point is lit, the brightness is calculated using the inverse square law, otherwise the brighness is 0
    brightness += isLitByLight ? Light.GetInverseSquare(distancePointToLight) : 0;
  }

  // Mix the traced color with black, based on the ammount of light hitting the point
  return Color.Mix(new Color(0, 0, 0, 255), tracedColor, brightness);
}

// Cast a ray from an origin in a given direction. If it hits the triangle, returns the hitPoint, otherwise returns null.
function CastRay(origin, direction) {
  // Normalize the direction
  direction = direction.normalized();

  var rayHitInfo = null;
  var currentHitDistance = 1000;

  // Loop through all triangles that need to be rendered
  for (var i = 0; i < settings.triangles.length; i += 1) {
    // Calculate the distance the ray traveled before hitting the plane the triangle is on
    var triangleNormal = settings.triangles[i].GetNormal();

    // Only draw triangles that are facing the camera
    if (Vector.Dot(direction, triangleNormal) > 0) {
      var t = 0;

      var denom = Vector.Dot(triangleNormal, direction);
      if (denom > 0.0001) {
        t = Vector.Dot(Vector.Sub(settings.triangles[i].p0, origin), triangleNormal) / denom;
      }

      // Checks if the ray hits the triangle infront of the camera and not behind it
      if (t > 0 && Math.abs(t) < Math.abs(currentHitDistance)) {
        // Calculate the point where the ray intersects the triangle plane
        var hitPoint = Vector.Add(origin, Vector.Scale(direction, t));
        // Check if the point on the plane we intersected is inside the tringle
        if (InsideOutsideTest(settings.triangles[i], hitPoint)) {
          rayHitInfo = new RayHitInfo(settings.triangles[i], hitPoint, t);
          currentHitDistance = t;
        }
      }
    }
  }

  // If no hit was found, return null
  return rayHitInfo;
}

// Returns a direction vector based on a normalized screenposition (0 -> 1). Forward is the direction the camera is facing
function GetRayDirection(screenX, screenY) {
  // Get point on grid infront of camera
  var direction = new Vector((screenX * 2 - 1) * settings.cameraFovMult, -(screenY * 2 - 1) * settings.cameraFovMult, -1);
  return direction.normalized();
}

// Test if the given triangle contains the given point (which lies on the same plane as the triangle).
function InsideOutsideTest(triangle, point) {
  // Calculate edge vectors
  var edge0 = Vector.Sub(triangle.p1, triangle.p0);
  var edge1 = Vector.Sub(triangle.p2, triangle.p1);
  var edge2 = Vector.Sub(triangle.p0, triangle.p2);

  // Calculate vectors from the point to each corner of the triangle
  var C0 = Vector.Sub(point, triangle.p0);
  var C1 = Vector.Sub(point, triangle.p1);
  var C2 = Vector.Sub(point, triangle.p2);

  // Calculate the normal of the triangle
  var triangleNormal = triangle.GetNormal();

  // If the (cosecant) angle between all sides and the respective point (C0, C1, C2) is positive, the point is within the triangle.
  if (Vector.Dot(triangleNormal, Vector.Cross(edge0, C0)) > 0 && Vector.Dot(triangleNormal, Vector.Cross(edge1, C1)) > 0 && Vector.Dot(triangleNormal, Vector.Cross(edge2, C2)) > 0) {
    return true;
  } else {
    return false;
  }
}

// Rotating dithered globe: Lambert-shaded sphere with a tilted lat/long graticule; the light follows the pointer.
(function () {
  var TAU = Math.PI * 2;
  var STEP = Math.PI / 6;   // 30 degree graticule
  var SPIN = TAU / 12;      // one revolution every 12 s
  var TILT = 0.38;          // spin-axis tilt in radians
  var DEF_LX = -0.55, DEF_LY = 0.6, DEF_LZ = 0.6; // upper-left, slightly toward viewer

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  PixelGrid.register({
    cell: 5,
    fps: 24,
    init: function (g) {
      g.R = Math.max(2, 0.42 * Math.min(g.cols, g.rows));
      g.cx = g.cols / 2;
      g.cy = g.rows / 2;
      g.lx = DEF_LX; g.ly = DEF_LY; g.lz = DEF_LZ; // smoothed light direction, view space
    },
    step: function (g, t, dt) {
      var R = g.R, cx = g.cx, cy = g.cy, cols = g.cols, d = g.data;
      var HW = 0.55 / R; // graticule half-width in radians (about one cell)

      // Light target: follows the pointer when it is over the canvas.
      var tx = DEF_LX, ty = DEF_LY, tz = DEF_LZ;
      var p = g.pointer;
      if (p && p.active) {
        tx = clamp((p.x + 0.5 - cx) / R, -1, 1);
        ty = clamp((cy - p.y - 0.5) / R, -1, 1);
        tz = DEF_LZ;
      }
      var k = 1 - Math.exp(-dt * 4);
      g.lx += (tx - g.lx) * k;
      g.ly += (ty - g.ly) * k;
      g.lz += (tz - g.lz) * k;
      var ln = Math.sqrt(g.lx * g.lx + g.ly * g.ly + g.lz * g.lz);
      var lx = g.lx / ln, ly = g.ly / ln, lz = g.lz / ln;

      // Spin about Y, then tilt about X. The inverse (view -> object) is applied per cell.
      var a = (t * SPIN) % TAU, ca = Math.cos(a), sa = Math.sin(a);
      var c = Math.cos(TILT), s = Math.sin(TILT);

      for (var y = 0; y < g.rows; y++) {
        var py = (cy - (y + 0.5)) / R; // y up
        for (var x = 0; x < cols; x++) {
          var px = (x + 0.5 - cx) / R;
          var r2 = px * px + py * py;
          var v = 0;
          if (r2 <= 1) {
            var nz = Math.sqrt(1 - r2);

            // View normal -> object space
            var ox = ca * px + sa * s * py - sa * c * nz;
            var oy = c * py + s * nz;
            var oz = sa * px - ca * s * py + ca * c * nz;

            var lat = Math.asin(clamp(oy, -1, 1));
            var lon = Math.atan2(ox, oz);
            var cosLat = Math.sqrt(ox * ox + oz * oz);

            // Distance (in radians of arc) to nearest 30-degree latitude / longitude line
            var dLat = Math.abs(lat / STEP - Math.round(lat / STEP)) * STEP;
            var dLon = Math.abs(lon / STEP - Math.round(lon / STEP)) * STEP * cosLat;
            var onLine = dLat < HW || dLon < HW;

            var diff = Math.max(0, px * lx + py * ly + nz * lz);
            if (onLine) {
              v = 0.4 + 0.6 * Math.min(1, diff * 2); // solid on the lit side, dim on the dark side
            } else {
              v = 0.1 + 0.9 * diff;
              if (nz < 0.25) v = Math.max(v, 0.22);   // faint limb so the silhouette reads
            }
          }
          d[y * cols + x] = v;
        }
      }
    }
  });
})();

// Slow dithered plasma: four drifting sine waves summed, pushed through a contrast curve, with a soft pointer glow.
(function () {
  var TAU = 6.283185307;
  var GAIN = 2.6; // contrast around mid-grey; higher = more solid black/white

  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  PixelGrid.register({
    cell: 6,
    fps: 20,
    init: function (g) {
      g.glow = 0; // eased pointer strength, 0..1
    },
    step: function (g, t, dt) {
      var cols = g.cols, rows = g.rows, d = g.data, pointer = g.pointer;
      // Normalise by the longer side so the field keeps one scale at any aspect ratio.
      var s = Math.max(cols, rows) / 2;
      var cx = cols / 2, cy = rows / 2;
      var ph = t * TAU / 12; // one slow drift cycle every ~12s

      // Ease the pointer glow in and out instead of snapping.
      var target = pointer.active ? 1 : 0;
      g.glow += (target - g.glow) * Math.min(1, dt * 3);

      var px = pointer.x, py = pointer.y, glow = g.glow;
      var y, x, u, v, r, sum, c, dx, dy, bump;
      for (y = 0; y < rows; y++) {
        v = (y - cy) / s;
        for (x = 0; x < cols; x++) {
          u = (x - cx) / s;
          r = Math.sqrt(u * u + v * v);
          // Classic demoscene plasma: four waves in different directions and frequencies.
          sum = Math.sin(u * 3.1 + ph)
              + Math.sin(v * 2.7 - ph * 0.7)
              + Math.sin((u + v) * 2.2 + ph * 0.5)
              + Math.sin(r * 4.3 - ph * 1.3);
          c = 0.5 + sum * 0.125;                  // [-4, 4] -> [0, 1]
          c = clamp(0.5 + (c - 0.5) * GAIN);      // contrast curve
          c = c * c * (3 - 2 * c);                // smoothstep for richer dither gradients

          if (glow > 0.001) {                     // soft brighter blob under the pointer
            dx = x - px; dy = y - py;
            bump = Math.exp(-(dx * dx + dy * dy) / 18) * glow * 0.45;
            c = clamp(c + bump);
          }
          d[y * cols + x] = c;
        }
      }
    }
  });
})();

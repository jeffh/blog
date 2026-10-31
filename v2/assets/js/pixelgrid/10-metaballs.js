// Lava-lamp metaballs: drifting blobs merge into gooey shapes with a dithered glow.
(function () {
  var MIN_R = 0.12, MAX_R = 0.22;  // blob radius as a fraction of min(cols, rows)
  var POINTER_R = 0.10;            // pointer blob radius, same units
  var MAX_BLOBS = 6;

  function scaleOf(g) { return Math.min(g.cols, g.rows); }

  function init(g) {
    var m = scaleOf(g), n = 4 + Math.floor(g.rand() * 3), blobs = [];
    for (var i = 0; i < n; i++) {
      var r = (MIN_R + g.rand() * (MAX_R - MIN_R)) * m;
      blobs.push({
        r2: r * r,
        // Lissajous amplitudes keep the blob centre inside the grid, with its radius as margin
        ax: Math.max(0, g.cols / 2 - r - 0.5) * (0.5 + 0.5 * g.rand()),
        ay: Math.max(0, g.rows / 2 - r - 0.5) * (0.5 + 0.5 * g.rand()),
        fx: 0.05 + g.rand() * 0.08,   // slow: periods of roughly 50-120 s
        fy: 0.05 + g.rand() * 0.08,
        px: g.rand() * 6.2832,
        py: g.rand() * 6.2832
      });
    }
    g.myState = {
      blobs: blobs,
      bx: new Float64Array(MAX_BLOBS + 1),
      by: new Float64Array(MAX_BLOBS + 1),
      br2: new Float64Array(MAX_BLOBS + 1),
      ptr: { x: g.cols / 2, y: g.rows / 2, a: 0 } // a = pointer blob strength, eases 0..1
    };
  }

  function step(g, t, dt) {
    var s = g.myState, cols = g.cols, rows = g.rows, d = g.data;
    var cx0 = cols / 2, cy0 = rows / 2, m = scaleOf(g);
    var blobs = s.blobs, n = blobs.length, i, k;

    for (i = 0; i < n; i++) {
      var b = blobs[i];
      var wx = t * b.fx + b.px, wy = t * b.fy + b.py;
      // Lissajous-like path: a fundamental plus a softer harmonic, normalised to [-1, 1]
      s.bx[i] = cx0 + b.ax * (Math.sin(wx) + 0.3 * Math.sin(2.3 * wx)) / 1.3;
      s.by[i] = cy0 + b.ay * (Math.sin(wy) + 0.3 * Math.sin(2.3 * wy)) / 1.3;
      s.br2[i] = b.r2;
    }

    // Pointer blob: eases toward the pointer and shrinks away when the pointer leaves
    var p = s.ptr, pt = g.pointer;
    k = 1 - Math.exp(-dt * 3);
    if (pt.active) {
      p.x += (pt.x + 0.5 - p.x) * k;
      p.y += (pt.y + 0.5 - p.y) * k;
    }
    p.a += ((pt.active ? 1 : 0) - p.a) * k;
    var count = n;
    if (p.a > 0.01) {
      var pr = POINTER_R * m * p.a;
      s.bx[n] = p.x; s.by[n] = p.y; s.br2[n] = pr * pr;
      count = n + 1;
    }

    // Field f = sum(r^2 / d^2): solid inside, dithered glow falling off outside
    var bx = s.bx, by = s.by, br2 = s.br2;
    for (var y = 0; y < rows; y++) {
      var cy = y + 0.5;
      for (var x = 0; x < cols; x++) {
        var cx = x + 0.5, f = 0;
        for (k = 0; k < count; k++) {
          var dx = cx - bx[k], dy = cy - by[k];
          f += br2[k] / (dx * dx + dy * dy + 0.01);
        }
        d[y * cols + x] = f > 1.2 ? 1 : (f > 0.5 ? 0.1 + (f - 0.5) * (0.8 / 0.7) : 0);
      }
    }
  }

  PixelGrid.register({
    cell: 6,
    fps: 24,
    init: init,
    step: step
  });
})();

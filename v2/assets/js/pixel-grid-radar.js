// Radar sweep for the homepage hero background: a slow beam with a fading
// wedge, range rings, crosshair axes, and drifting blips that light when swept.
(function () {
  var TAU = Math.PI * 2;
  var PERIOD = 7;            // seconds per revolution
  var TRAIL = Math.PI * 0.6; // angular width of the fading wedge behind the beam
  var ORIGIN_X = 0.72;       // sweep origin, as a fraction of the grid (right of the text)
  var ORIGIN_Y = 0.5;
  var ORIGIN_X_NARROW = 0.5; // centered on phone-shaped grids

  function mod2(a) { a %= TAU; return a < 0 ? a + TAU : a; }

  function put(g, x, y, v) {
    if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) return;
    var i = y * g.cols + x;
    if (g.data[i] < v) g.data[i] = v;
  }

  function plus(g, x, y, v) {
    put(g, x, y, v); put(g, x - 1, y, v * 0.6); put(g, x + 1, y, v * 0.6); put(g, x, y - 1, v * 0.6); put(g, x, y + 1, v * 0.6);
  }

  // true if the beam swept across the angle of point (x, y) during the last step
  function crossed(s, x, y, theta, span) {
    var dx = x - s.cx, dy = y - s.cy;
    if (dx * dx + dy * dy < 1) return false;
    var d = mod2(Math.atan2(dy, dx) - (theta - span));
    return d > 0 && d <= span;
  }

  function spawn(g, s) {
    var a = g.rand() * TAU, r = s.ring * (0.6 + g.rand() * (s.rings.length - 0.6));
    var h = g.rand() * TAU, sp = 0.08 + g.rand() * 0.12;
    s.blips.push({
      x: s.cx + Math.cos(a) * r, y: s.cy + Math.sin(a) * r,
      vx: Math.cos(h) * sp, vy: Math.sin(h) * sp,
      ttl: 14 + g.rand() * 18, glow: 0
    });
  }

  PixelGrid.register({
    cell: 7,
    fps: 24,
    init: function (g) {
      var narrow = g.cols < g.rows * 1.4;
      var cx = (g.cols - 1) * (narrow ? ORIGIN_X_NARROW : ORIGIN_X), cy = (g.rows - 1) * ORIGIN_Y;
      var far = Math.sqrt(Math.pow(Math.max(cx, g.cols - cx), 2) + Math.pow(Math.max(cy, g.rows - cy), 2));
      var ring = Math.max(4, Math.min(g.cols, g.rows) * 0.24);
      var rings = [];
      for (var r = ring; r < far; r += ring) rings.push(r);
      var s = g.st = { cx: cx, cy: cy, far: far + 1, ring: ring, rings: rings,
        prev: -TAU / PERIOD / 24, blips: [], pGlow: 0 };
      var n = Math.max(4, Math.min(9, Math.round(g.cols * g.rows / 900)));
      s.want = n;
      for (var i = 0; i < n; i++) spawn(g, s);
    },
    step: function (g, t, dt) {
      var s = g.st, cols = g.cols, rows = g.rows, d = g.data, cx = s.cx, cy = s.cy;
      var theta = mod2(t * TAU / PERIOD), span = mod2(theta - s.prev);
      var c = Math.cos(theta), sn = Math.sin(theta);
      var axX = Math.round(cx), axY = Math.round(cy);
      var x, y, i, k, bl;
      s.prev = theta;

      for (y = 0; y < rows; y++) {
        for (x = 0; x < cols; x++) {
          var dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy), v = 0;
          // fading wedge, dimmer toward the outer edge
          if (r > 0.5) {
            var b = mod2(theta - Math.atan2(dy, dx));
            if (b < TRAIL) v = 0.7 * Math.pow(1 - b / TRAIL, 1.8) * (1 - 0.45 * r / s.far);
          }
          // beam line
          var along = dx * c + dy * sn, perp = dx * sn - dy * c;
          if (along >= -0.5 && Math.abs(perp) < 0.55) v = 1;
          // range rings and crosshair axes
          if (v < 0.3) {
            for (k = 0; k < s.rings.length; k++) {
              if (Math.abs(r - s.rings[k]) < 0.5) { v = 0.3; break; }
            }
          }
          if (v < 0.18 && (x === axX || y === axY)) v = 0.18;
          d[y * cols + x] = v;
        }
      }

      // blips drift, light up when swept, fade over a revolution, and respawn
      var keep = [];
      for (i = 0; i < s.blips.length; i++) {
        bl = s.blips[i];
        bl.x += bl.vx * dt; bl.y += bl.vy * dt;
        if (bl.x < 1 || bl.x > cols - 2) bl.vx = -bl.vx;
        if (bl.y < 1 || bl.y > rows - 2) bl.vy = -bl.vy;
        bl.ttl -= dt;
        bl.glow = crossed(s, bl.x, bl.y, theta, span) ? 1 : Math.max(0, bl.glow - dt / PERIOD);
        if (bl.ttl > 0) keep.push(bl);
      }
      s.blips = keep;
      while (s.blips.length < s.want) spawn(g, s);
      for (i = 0; i < s.blips.length; i++) {
        bl = s.blips[i];
        var bv = Math.min(1, bl.glow * 1.5) * Math.min(1, bl.ttl);
        if (bv > 0) plus(g, Math.round(bl.x), Math.round(bl.y), bv);
      }

      // the pointer is a contact too: it lights when the beam passes it
      var p = g.pointer;
      s.pGlow = Math.max(0, s.pGlow - dt / PERIOD);
      if (p && p.active) {
        if (crossed(s, p.x, p.y, theta, span)) s.pGlow = 1;
        if (s.pGlow > 0) plus(g, p.x, p.y, Math.min(1, s.pGlow * 1.5));
      }
    }
  });
})();

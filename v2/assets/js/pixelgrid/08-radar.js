// Radar sweep: a rotating beam with a fading wedge, static range rings, and blips that light when swept.
(function () {
  var TAU = Math.PI * 2;
  var PERIOD = 4;              // seconds per revolution
  var TRAIL = Math.PI / 2;     // angular width of the fading wedge behind the beam
  var RINGS = [0.35, 0.7, 1];  // range ring radii, as fractions of the short half-side

  function mod2(a) { a %= TAU; return a < 0 ? a + TAU : a; }

  function put(g, x, y, v) {
    if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) return;
    var i = y * g.cols + x;
    if (g.data[i] < v) g.data[i] = v;
  }

  function plus(g, x, y, v) {
    put(g, x, y, v); put(g, x - 1, y, v); put(g, x + 1, y, v); put(g, x, y - 1, v); put(g, x, y + 1, v);
  }

  // true if the beam swept across the angle of point (x, y) during the last step
  function crossed(s, x, y, theta, span) {
    var dx = x - s.cx, dy = y - s.cy;
    if (dx * dx + dy * dy < 1) return false;
    var d = mod2(Math.atan2(dy, dx) - (theta - span));
    return d > 0 && d <= span;
  }

  function spawn(g, s) {
    var ang = g.rand() * TAU, sp = 0.1 + g.rand() * 0.15;
    s.blips.push({
      x: s.cx + (g.rand() * 2 - 1) * s.hx * 0.9,
      y: s.cy + (g.rand() * 2 - 1) * s.hy * 0.9,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
      ttl: 10 + g.rand() * 14, glow: 0
    });
  }

  PixelGrid.register({
    cell: 6,
    fps: 30,
    init: function (g) {
      var s = g.st = {
        cx: (g.cols - 1) / 2, cy: (g.rows - 1) / 2,
        hx: Math.max(2, g.cols / 2 - 2), hy: Math.max(1.5, g.rows / 2 - 1.5),
        r0: Math.min(g.cols, g.rows) / 2,
        beamR: Math.max(g.cols, g.rows) / 2 + 1,   // reaches the horizontal edges on wide grids
        prev: -TAU / PERIOD / 30, blips: [], want: 5, wantT: 8, pGlow: 0
      };
      for (var i = 0; i < 5; i++) spawn(g, s);
    },
    step: function (g, t, dt) {
      var s = g.st, cols = g.cols, rows = g.rows, d = g.data, cx = s.cx, cy = s.cy;
      var theta = mod2(t * TAU / PERIOD), span = mod2(theta - s.prev);
      var c = Math.cos(theta), sn = Math.sin(theta);
      var axX = Math.floor(cx + 0.5), axY = Math.floor(cy + 0.5);
      var x, y, i, k, bl;
      s.prev = theta;

      // background: wedge trail, beam line, range rings, crosshair axes
      for (y = 0; y < rows; y++) {
        for (x = 0; x < cols; x++) {
          var dx = x - cx, dy = y - cy, r = Math.sqrt(dx * dx + dy * dy), v = 0;
          if (r <= s.beamR) {
            if (r > 0.5) {
              var b = mod2(theta - Math.atan2(dy, dx));
              if (b < TRAIL) v = 0.85 * Math.pow(1 - b / TRAIL, 1.6);
            }
            var along = dx * c + dy * sn, perp = dx * sn - dy * c;
            if (along >= -0.5 && along <= s.beamR && Math.abs(perp) < 0.6) v = 1;
          }
          if (v < 0.25) {
            for (k = 0; k < RINGS.length; k++) {
              if (Math.abs(r - RINGS[k] * s.r0) < 0.5) { v = 0.25; break; }
            }
          }
          if (v < 0.15 && (x === axX || y === axY)) v = 0.15;
          d[y * cols + x] = v;
        }
      }

      // blips: drift, age, fade out, light when swept, keep the count near s.want
      s.wantT -= dt;
      if (s.wantT <= 0) { s.want = 4 + Math.floor(g.rand() * 4); s.wantT = 8 + g.rand() * 6; }
      var keep = [];
      for (i = 0; i < s.blips.length; i++) {
        bl = s.blips[i];
        bl.x += bl.vx * dt; bl.y += bl.vy * dt;
        if (bl.x < cx - s.hx || bl.x > cx + s.hx) { bl.vx = -bl.vx; bl.x = Math.max(cx - s.hx, Math.min(cx + s.hx, bl.x)); }
        if (bl.y < cy - s.hy || bl.y > cy + s.hy) { bl.vy = -bl.vy; bl.y = Math.max(cy - s.hy, Math.min(cy + s.hy, bl.y)); }
        bl.ttl -= dt;
        bl.glow = crossed(s, bl.x, bl.y, theta, span) ? 1 : Math.max(0, bl.glow - dt / PERIOD);
        if (bl.ttl > 0) keep.push(bl);
      }
      s.blips = keep;
      while (s.blips.length < s.want) spawn(g, s);
      for (i = 0; i < s.blips.length; i++) {
        bl = s.blips[i];
        var bv = Math.min(1, bl.glow * 1.6) * Math.min(1, bl.ttl);
        if (bv > 0) plus(g, Math.round(bl.x), Math.round(bl.y), bv);
      }

      // pointer acts as a blip; a faint marker shows while it is over the canvas
      var p = g.pointer;
      s.pGlow = Math.max(0, s.pGlow - dt / PERIOD);
      if (p && p.active) {
        if (crossed(s, p.x, p.y, theta, span)) s.pGlow = 1;
        plus(g, p.x, p.y, Math.max(0.3, Math.min(1, s.pGlow * 1.6)));
      }
    }
  });
})();

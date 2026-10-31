// Digital pixel rain: sparse falling drops with fading tails; pointer speeds up nearby columns.
(function () {
  var TAIL_MIN = 6, TAIL_SPAN = 9;      // tail length in cells: 6..14
  var SPEED_MIN = 7, SPEED_SPAN = 10;   // rows per second: 7..17
  var IDLE_RATIO = 3;                   // idle wait is uniform 0..3*A (mean 1.5*A), so ~40% of columns live

  function estActive(g) { return (g.rows + 10) / 12; } // rough time a drop takes to cross the grid

  function spawn(g, c) {
    g.on[c] = 1;
    g.hd[c] = -1 - g.rand() * 2;                     // head starts just above the grid
    g.sp[c] = SPEED_MIN + g.rand() * SPEED_SPAN;
    g.ln[c] = TAIL_MIN + Math.floor(g.rand() * TAIL_SPAN);
    g.boost[c] = 1;
  }

  function retire(g, c) {
    g.on[c] = 0;
    g.wt[c] = g.rand() * IDLE_RATIO * estActive(g);
  }

  PixelGrid.register({
    cell: 8,
    fps: 20,
    init: function (g) {
      var n = g.cols;
      g.on = new Uint8Array(n);
      g.ln = new Uint8Array(n);
      g.hd = new Float32Array(n);
      g.sp = new Float32Array(n);
      g.wt = new Float32Array(n);
      g.boost = new Float32Array(n);
      for (var c = 0; c < n; c++) {
        if (g.rand() < 0.4) {                        // start mid-fall so the grid is never blank
          spawn(g, c);
          g.hd[c] = g.rand() * g.rows;
        } else {
          g.wt[c] = g.rand() * IDLE_RATIO * estActive(g);
        }
      }
    },
    step: function (g, t, dt) {
      var d = g.data, cols = g.cols, rows = g.rows, p = g.pointer;
      var c, r, k, h, L, v, near;
      for (r = 0; r < d.length; r++) d[r] = 0;
      for (c = 0; c < cols; c++) {
        // pointer: nearby columns speed up and sprout new drops
        near = p.active && Math.abs(c - p.x) <= 2;
        g.boost[c] = 1 + (g.boost[c] - 1) * 0.9;
        if (near) {
          g.boost[c] = 2;
          if (!g.on[c] && g.rand() < 0.3) spawn(g, c);
        }
        if (!g.on[c]) {
          g.wt[c] -= dt;
          if (g.wt[c] <= 0) spawn(g, c);
          continue;
        }
        g.hd[c] += g.sp[c] * g.boost[c] * dt;
        L = g.ln[c];
        if (g.hd[c] - L >= rows) { retire(g, c); continue; }
        h = Math.floor(g.hd[c]);
        for (k = 0; k < L; k++) {                    // k = 0 is the solid head, tail fades upward
          r = h - k;
          if (r < 0) break;
          if (r >= rows) continue;
          v = k === 0 ? 1 : 0.8 * (1 - k / L);
          d[r * cols + c] = v;
        }
      }
    }
  });
})();

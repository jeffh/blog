// Hourglass falling sand: a cellular-automaton pile fed by a wandering spout, periodically drained through a gap in the floor.
(function () {
  var EMPTY = 0, REST = 1, MOVED = 3; // MOVED: grain already moved this step (drawn bright, skipped by the sweep)

  function idx(g, x, y) { return y * g.cols + x; }
  function inHole(g, x) { return g.drain && x >= g.hole0 && x < g.hole1; }

  // Try to move the grain at (x,y) to (nx,ny). A grain entering the floor gap falls out of the grid.
  function go(g, x, y, nx, ny) {
    var s = g.sand;
    if (nx < 0 || nx >= g.cols || ny >= g.rows) return false;
    var src = idx(g, x, y);
    if (ny === g.rows - 1 && inHole(g, nx)) { s[src] = EMPTY; return true; }
    var dst = idx(g, nx, ny);
    if (s[dst] !== EMPTY) return false;
    s[dst] = MOVED; g.shade[dst] = g.shade[src]; s[src] = EMPTY;
    return true;
  }

  function init(g) {
    var n = g.cols * g.rows;
    g.sand = new Uint8Array(n);
    g.shade = new Float32Array(n);
    g.spoutX = (g.cols - 1) / 2;
    g.count = 0; g.clog = 0; g.drain = false; g.drainT = 0; g.hole0 = 0; g.hole1 = 0;
  }

  function step(g, t, dt) {
    var W = g.cols, H = g.rows, N = W * H, s = g.sand, sh = g.shade, d = g.data, i, x, y, k;

    // 1. last step's movers become resting grains again
    for (i = 0; i < N; i++) if (s[i] === MOVED) s[i] = REST;

    // 2. spout drifts slowly, or follows the pointer while it is over the canvas
    var target = g.pointer && g.pointer.active
      ? g.pointer.x
      : (W - 1) / 2 + Math.sin(t * 0.21) * W * 0.28 + Math.sin(t * 0.05 + 1) * W * 0.08;
    target = Math.max(0, Math.min(W - 1, target));
    g.spoutX += (target - g.spoutX) * Math.min(1, dt * 3);
    var sx = Math.max(0, Math.min(W - 1, Math.round(g.spoutX)));

    // 3. drain cycle: open the floor gap at ~70% fill or when the spout clogs; close it at ~10%
    if (!g.drain) {
      if (g.count >= N * 0.7 || g.clog > 6) {
        var hw = Math.min(W, Math.max(2, Math.round(W * 0.3)));
        g.drain = true; g.drainT = 0;
        g.hole0 = Math.floor(g.rand() * (W - hw + 1));
        g.hole1 = g.hole0 + hw;
      }
    } else {
      g.drainT += dt;
      if (g.count <= N * 0.1 || g.drainT > 14) { g.drain = false; g.clog = 0; }
    }

    // 4. sweep bottom-up, alternating x direction each frame to avoid bias
    var rightFirst = g.frame & 1;
    for (y = H - 1; y >= 0; y--) {
      for (k = 0; k < W; k++) {
        x = rightFirst ? W - 1 - k : k;
        i = y * W + x;
        if (s[i] !== REST) continue;
        if (y === H - 1) {
          if (inHole(g, x)) { s[i] = EMPTY; continue; }
          if (g.rand() < 0.2) go(g, x, y, x + (g.rand() < 0.5 ? -1 : 1), y); // floor creep
          continue;
        }
        if (go(g, x, y, x, y + 1)) continue;
        if (g.rand() < 0.5) { if (!go(g, x, y, x - 1, y + 1)) go(g, x, y, x + 1, y + 1); }
        else if (!go(g, x, y, x + 1, y + 1)) go(g, x, y, x - 1, y + 1);
      }
    }

    // 5. spout emits a grain with a stable random shade; a blocked spout counts toward a clog
    if (!g.drain) {
      if (s[sx] !== EMPTY) g.clog++;
      else {
        g.clog = 0;
        if (g.rand() < 0.85) { s[sx] = MOVED; sh[sx] = 0.45 + 0.55 * g.rand(); }
      }
    }

    // 6. render: falling grains full on, resting grains dithered by their shade
    var count = 0;
    for (i = 0; i < N; i++) {
      if (s[i] === EMPTY) { d[i] = 0; continue; }
      count++;
      d[i] = s[i] === MOVED ? 1 : sh[i];
    }
    g.count = count;
  }

  PixelGrid.register({ cell: 5, fps: 30, init: init, step: step });
})();

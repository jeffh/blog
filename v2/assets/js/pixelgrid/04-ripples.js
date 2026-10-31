// Water-drop ripples: random drops expand into fading concentric rings.
(function () {
  var MAX = 6;        // max live drops
  var LIFE = 4;       // seconds a drop lives
  var SPEED = 7;      // ring expansion, cells per second
  var BAND = 0.75;    // ring half-width in cells (about 1.5 cells wide)
  var RING2 = 0.35;   // delay of the second, fainter concentric ring
  var PTR_GAP = 0.25; // min seconds between pointer-made drops

  function spawn(g, x, y) {
    if (g.drops.length >= MAX) g.drops.shift();
    g.drops.push({ x: x + 0.5, y: y + 0.5, age: 0 });
  }

  function dropRandom(g) {
    spawn(g, Math.floor(g.rand() * g.cols), Math.floor(g.rand() * g.rows));
    g.timer = 0.6 + g.rand() * 0.9;
  }

  // cosine-shaped band around a ring radius, 0..1
  function band(w) {
    w = Math.abs(w);
    return w < BAND ? 0.5 + 0.5 * Math.cos(Math.PI * w / BAND) : 0;
  }

  PixelGrid.register({
    cell: 6,
    fps: 24,
    init: function (g) {
      g.drops = [];
      g.ptrT = PTR_GAP;   // allow an immediate pointer drop
      g.lastPX = -1;
      g.lastPY = -1;
      dropRandom(g);
    },
    step: function (g, t, dt) {
      var p = g.pointer, cols = g.cols, rows = g.rows, d = g.data;
      var i, x, y, k, dr, fade, r1, r2, dx, dy, dist, v, live = [];

      // random drops
      g.timer -= dt;
      if (g.timer <= 0) dropRandom(g);

      // pointer drops, rate-limited, only when the pointer moved to a new cell
      g.ptrT += dt;
      if (p.active && g.ptrT >= PTR_GAP && p.x >= 0 && p.y >= 0 && p.x < cols && p.y < rows &&
          (p.x !== g.lastPX || p.y !== g.lastPY)) {
        spawn(g, p.x, p.y);
        g.ptrT = 0;
        g.lastPX = p.x;
        g.lastPY = p.y;
      }

      // age drops and cull expired ones
      for (k = 0; k < g.drops.length; k++) {
        dr = g.drops[k];
        dr.age += dt;
        if (dr.age < LIFE) live.push(dr);
      }
      g.drops = live;

      // sum ring contributions into the grid
      for (i = 0; i < d.length; i++) d[i] = 0;
      for (k = 0; k < live.length; k++) {
        dr = live[k];
        fade = Math.pow(1 - dr.age / LIFE, 1.5);
        r1 = SPEED * dr.age;
        r2 = SPEED * (dr.age - RING2);
        for (y = 0; y < rows; y++) {
          for (x = 0; x < cols; x++) {
            dx = x + 0.5 - dr.x;
            dy = y + 0.5 - dr.y;
            dist = Math.sqrt(dx * dx + dy * dy);
            v = fade * (band(dist - r1) + (dr.age >= RING2 ? 0.6 * band(dist - r2) : 0));
            if (dr.age < 0.15 && dist < 0.5) v = 1; // impact flash
            d[y * cols + x] += v;
          }
        }
      }
      for (i = 0; i < d.length; i++) if (d[i] > 1) d[i] = 1;
    }
  });
})();

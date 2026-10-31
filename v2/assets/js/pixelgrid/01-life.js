// Conway's Game of Life on a torus: reseeds with a soft dissolve when the pattern stalls or dies.
(function () {
  var TRAIL = 0.3;
  var GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];

  function ix(g, x, y) { // wrapped (toroidal) index
    x = (x % g.cols + g.cols) % g.cols;
    y = (y % g.rows + g.rows) % g.rows;
    return y * g.cols + x;
  }

  function randomize(g, density) {
    var a = g.life.a;
    for (var i = 0; i < a.length; i++) a[i] = g.rand() < density ? 1 : 0;
  }

  function diff(a, b) {
    var d = 0;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
    return d;
  }

  function population(a) {
    var p = 0;
    for (var i = 0; i < a.length; i++) p += a[i];
    return p;
  }

  function evolve(g) {
    var L = g.life, a = L.a, m = L.n;
    for (var y = 0; y < g.rows; y++) {
      for (var x = 0; x < g.cols; x++) {
        var c = 0;
        for (var dy = -1; dy <= 1; dy++)
          for (var dx = -1; dx <= 1; dx++)
            if (dx || dy) c += a[ix(g, x + dx, y + dy)];
        var i = y * g.cols + x;
        m[i] = (c === 3 || (c === 2 && a[i])) ? 1 : 0;
      }
    }
  }

  // Reseed transition: old pattern thins out while scattered cells appear (no rules applied).
  function dissolve(g) {
    var a = g.life.a, m = g.life.n;
    for (var i = 0; i < a.length; i++)
      m[i] = a[i] ? (g.rand() < 0.7 ? 1 : 0) : (g.rand() < 0.1 ? 1 : 0);
  }

  function publish(g) {
    var L = g.life, d = g.data;
    for (var i = 0; i < d.length; i++) d[i] = L.a[i] ? 1 : (L.p[i] ? TRAIL : 0);
  }

  function init(g) {
    var n = g.cols * g.rows;
    g.life = {
      a: new Uint8Array(n), n: new Uint8Array(n), p: new Uint8Array(n), pp: new Uint8Array(n),
      stale: 0, age: 0, fade: 0, cool: 0, lx: -99, ly: -99
    };
    randomize(g, 0.3);
    publish(g);
  }

  function step(g, t, dt) {
    var L = g.life, P = g.pointer, evolved = false;
    if (L.cool > 0) L.cool--;

    // Pointer: drop a glider near the cursor after it has moved a few cells.
    if (P && P.active && !L.cool && L.fade === 0 &&
        Math.abs(P.x - L.lx) + Math.abs(P.y - L.ly) >= 3) {
      for (var k = 0; k < GLIDER.length; k++)
        L.a[ix(g, P.x - 1 + GLIDER[k][0], P.y - 1 + GLIDER[k][1])] = 1;
      L.lx = P.x; L.ly = P.y; L.cool = 12;
    }

    if (L.fade > 0) {
      dissolve(g);
      L.fade--;
    } else {
      evolve(g);
      L.age++;
      evolved = true;
    }

    // rotate generations: pp <- p <- a <- n <- (old pp buffer)
    var old = L.pp;
    L.pp = L.p; L.p = L.a; L.a = L.n; L.n = old;

    if (evolved) {
      var pop = population(L.a);
      var still = diff(L.a, L.p) === 0 || diff(L.a, L.pp) === 0; // still life or period 2
      L.stale = still ? L.stale + 1 : 0;
      if (L.stale >= 4 || pop < Math.max(12, g.cols * g.rows * 0.06) || L.age > 400) {
        L.fade = 6; L.stale = 0; L.age = 0;
      }
    }
    publish(g);
  }

  PixelGrid.register({ cell: 8, fps: 10, init: init, step: step });
})();

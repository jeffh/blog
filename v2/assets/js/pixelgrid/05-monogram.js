// Particles scatter, assemble into a chunky "JH" pixel monogram, hold with a glint, dissolve, and repeat.
(function () {
  // 5x7 pixel font; J and H are joined with a one-column gap.
  var J = ["...##", "....#", "....#", "....#", "....#", "#...#", ".###."];
  var H = ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"];
  var ART = [];
  var W = 11, HT = 7;
  var P = 0.6, A = 2.0, HOLD = 2.5, D = 1.5, CYCLE = P + A + HOLD + D; // phase lengths (s)
  var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (var r = 0; r < HT; r++) ART.push(J[r] + "." + H[r]);

  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  function put(g, x, y, v) {
    if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) return;
    var i = y * g.cols + x;
    if (v > g.data[i]) g.data[i] = v;
  }

  function scatter(g) {
    for (var i = 0; i < g.pts.length; i++) {
      g.pts[i].sx = g.rand() * g.cols;
      g.pts[i].sy = g.rand() * g.rows;
    }
  }

  function newPt(g, x, y) {
    var dx = x - g.cols / 2 + (g.rand() - 0.5), dy = y - g.rows / 2 + (g.rand() - 0.5);
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { hx: x, hy: y, sx: 0, sy: 0, a: g.rand() * 0.45, b: g.rand() * 0.5,
      dx: dx / len, dy: dy / len, spread: 4 + g.rand() * 8, ox: 0, oy: 0, lx: -1, ly: -1 };
  }

  // Scale 3 or 2 when the monogram fits with a 2-cell margin; otherwise scale 1.
  function layout(g) {
    var s = 1;
    if (W * 3 + 4 <= g.cols && HT * 3 + 4 <= g.rows) s = 3;
    else if (W * 2 + 4 <= g.cols && HT * 2 + 4 <= g.rows) s = 2;
    var ox = Math.floor((g.cols - W * s) / 2), oy = Math.floor((g.rows - HT * s) / 2);
    g.mask = new Uint8Array(g.cols * g.rows);
    g.pts = [];
    for (var r = 0; r < HT; r++) {
      for (var c = 0; c < W; c++) {
        if (ART[r].charAt(c) !== "#") continue;
        for (var i = 0; i < s; i++) for (var j = 0; j < s; j++) {
          var x = ox + c * s + i, y = oy + r * s + j;
          if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) continue;
          g.mask[y * g.cols + x] = 1;
          g.pts.push(newPt(g, x, y));
        }
      }
    }
    scatter(g);
  }

  function init(g) {
    g.clock = 0; g.lastC = 0; g.gAt = 0; g.gEnd = -1; g.gx = 0; g.gy = 0;
    layout(g);
  }

  function step(g, t, dt) {
    g.clock += dt;
    var c = g.clock % CYCLE;
    if (c < g.lastC) scatter(g); // a new cycle begins: pick fresh scatter spots for the pause
    g.lastC = c;
    var d = g.data, pointer = g.pointer;
    var uA = (c - P) / A, uD = (c - P - A - HOLD) / D;
    var hold = c >= P + A && c < P + A + HOLD;
    for (var i = 0; i < d.length; i++) d[i] = 0;

    for (var k = 0; k < g.pts.length; k++) {
      var p = g.pts[k], x, y, v, q;
      if (c < P) { x = p.sx; y = p.sy; v = 0.3; }                  // pause: faint dust
      else if (c < P + A) {                                         // assemble, staggered easeOutCubic
        q = clamp((uA - p.a) / (1 - p.a));
        var e = 1 - Math.pow(1 - q, 3);
        x = p.sx + (p.hx - p.sx) * e; y = p.sy + (p.hy - p.sy) * e;
        v = q > 0 ? 1 : 0.3;
      } else if (hold) { x = p.hx; y = p.hy; v = 1; }               // hold the crisp monogram
      else {                                                        // dissolve outward and fade
        q = clamp((uD - p.b) / (1 - p.b));
        x = p.hx + p.dx * p.spread * q; y = p.hy + p.dy * p.spread * q; v = 1 - q;
      }

      // Pointer: particles within 4 cells are pushed away; springs back when the pointer leaves.
      var tx = 0, ty = 0;
      if (pointer.active) {
        var ex = x - pointer.x, ey = y - pointer.y, dist = Math.sqrt(ex * ex + ey * ey);
        if (dist < 4) {
          var push = (4 - dist) / 4 * 3, inv = dist > 0.001 ? push / dist : 0;
          tx = dist > 0.001 ? ex * inv : push; ty = ey * inv;
        }
      }
      p.ox += (tx - p.ox) * 0.25; p.oy += (ty - p.oy) * 0.25;

      var nx = Math.round(x + p.ox), ny = Math.round(y + p.oy);
      if (p.lx >= 0 && (p.lx !== nx || p.ly !== ny)) put(g, p.lx, p.ly, 0.35); // dim trail
      put(g, nx, ny, v);
      p.lx = nx; p.ly = ny;
    }

    // Occasional single-pixel glint on an empty cell beside a letter pixel.
    if (hold && g.pts.length) {
      if (g.clock >= g.gAt) {
        var sp = g.pts[Math.floor(g.rand() * g.pts.length)], dir = Math.floor(g.rand() * 4);
        for (var m = 0; m < 4; m++) {
          var dd = DIRS[(dir + m) % 4], gx = sp.hx + dd[0], gy = sp.hy + dd[1];
          if (gx >= 0 && gy >= 0 && gx < g.cols && gy < g.rows && !g.mask[gy * g.cols + gx]) {
            g.gx = gx; g.gy = gy; g.gEnd = g.clock + 0.2; break;
          }
        }
        g.gAt = g.clock + 0.9 + g.rand() * 1.2;
      }
      if (g.clock < g.gEnd) put(g, g.gx, g.gy, 1);
    }
  }

  PixelGrid.register({ cell: 6, fps: 30, init: init, step: step });
})();

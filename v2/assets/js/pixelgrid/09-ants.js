// Langton's ants: three toroidal ants paint a binary grid; hovering the pointer summons more.
(function () {
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];   // direction 0=up, 1=right, 2=down, 3=left
  var MOVES = 4;                                 // ant moves per step
  var RUN_SECS = 25, ERASE_SECS = 2, ERASE_RATE = 0.03, FILL_MAX = 0.45;
  var ANT_START = 3, ANT_MAX = 5, SUMMON_COOL = 1.5;

  function count(g) {
    var n = 0, c = g.cells;
    for (var i = 0; i < c.length; i++) n += c[i];
    return n;
  }

  function spawnAnt(g, x, y) {
    g.ants.push({ x: x, y: y, d: Math.floor(g.rand() * 4) });
  }

  function respawn(g) {
    g.ants = [];
    for (var i = 0; i < ANT_START; i++)
      spawnAnt(g, Math.floor(g.rand() * g.cols), Math.floor(g.rand() * g.rows));
    g.phase = 0;   // 0 = running, 1 = erasing
    g.clock = 0;
  }

  function init(g) {
    g.cells = new Uint8Array(g.cols * g.rows);   // binary state, separate from g.data
    g.cool = 0;
    respawn(g);
  }

  function step(g, t, dt) {
    var n = g.cols * g.rows, p = g.pointer, d = g.data;
    var i, k, a, ant;
    g.clock += dt;
    g.cool = Math.max(0, g.cool - dt);

    if (g.phase === 0 && (g.clock > RUN_SECS || count(g) > FILL_MAX * n)) {
      g.phase = 1; g.clock = 0;
    } else if (g.phase === 1 && g.clock > ERASE_SECS) {
      respawn(g);
    }

    if (g.phase === 1) {
      // gradual erase: each set cell has a small chance to clear this step
      for (i = 0; i < n; i++)
        if (g.cells[i] && g.rand() < ERASE_RATE) g.cells[i] = 0;
    } else {
      for (a = 0; a < g.ants.length; a++) {
        ant = g.ants[a];
        for (k = 0; k < MOVES; k++) {
          i = ant.y * g.cols + ant.x;
          // black: turn left (+3), white: turn right (+1); then flip and move forward
          ant.d = (ant.d + (g.cells[i] ? 3 : 1)) & 3;
          g.cells[i] ^= 1;
          ant.x = (ant.x + DX[ant.d] + g.cols) % g.cols;
          ant.y = (ant.y + DY[ant.d] + g.rows) % g.rows;
        }
      }
      // pointer summons an ant at its cell
      if (p.active && g.cool === 0 && g.ants.length < ANT_MAX &&
          p.x >= 0 && p.x < g.cols && p.y >= 0 && p.y < g.rows) {
        spawnAnt(g, p.x, p.y);
        g.cool = SUMMON_COOL;
      }
    }

    // render: black cells dithered at 0.7, ants solid, faint glow under pointer
    for (i = 0; i < n; i++) d[i] = g.cells[i] ? 0.7 : 0;
    if (p.active && p.x >= 0 && p.x < g.cols && p.y >= 0 && p.y < g.rows) {
      i = p.y * g.cols + p.x;
      if (!d[i]) d[i] = 0.25;
    }
    for (a = 0; a < g.ants.length; a++) {
      ant = g.ants[a];
      d[ant.y * g.cols + ant.x] = 1;
    }
  }

  PixelGrid.register({ cell: 5, fps: 30, init: init, step: step });
})();

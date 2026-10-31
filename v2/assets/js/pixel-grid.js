// Pixel grid hero animation harness.
// Renders a 1-bit (ink / paper) pixel grid into the hero canvas. A variant
// supplies the motion by writing intensities (0..1) into g.data each step;
// the harness ordered-dithers them to on/off pixels using the theme's ink color.
(function () {
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var variant = null;

  window.PixelGrid = {
    register: function (v) { variant = v; start(); }
  };

  function start() {
    var canvas = document.querySelector(".hero__pixels canvas");
    if (!canvas || !variant) return;
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var cell = variant.cell || 8;
    var fps = variant.fps || 15;
    var g = null, ink = "#000", dpr = 1, visible = true, raf = 0, last = 0, t0 = 0, acc = 0;
    var seed = 1;

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      ink = (cs.getPropertyValue("--text-primary") || "#17161a").trim();
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      var cols = Math.max(1, Math.floor(r.width / cell));
      var rows = Math.max(1, Math.floor(r.height / cell));
      var prevPointer = g ? g.pointer : { x: -1, y: -1, active: false };
      g = {
        cols: cols, rows: rows,
        data: new Float32Array(cols * rows),
        pointer: prevPointer,
        t: 0, frame: 0,
        rand: function () { // deterministic-ish PRNG (mulberry32)
          seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
          var x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
          return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        },
        idx: function (x, y) { return y * cols + x; }
      };
      seed = (Math.random() * 2147483647) | 0;
      variant.init && variant.init(g);
      draw();
    }

    function draw() {
      var w = canvas.width, h = canvas.height;
      var cw = w / g.cols, ch = h / g.rows;
      var gap = Math.max(1, Math.round(dpr));
      ctx.clearRect(0, 0, w, h);
      // faint grid of "off" pixels
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.06;
      for (var y = 0; y < g.rows; y++)
        for (var x = 0; x < g.cols; x++)
          ctx.fillRect(Math.round(x * cw), Math.round(y * ch), Math.ceil(cw) - gap, Math.ceil(ch) - gap);
      ctx.globalAlpha = 1;
      var d = g.data;
      for (y = 0; y < g.rows; y++) {
        for (x = 0; x < g.cols; x++) {
          var v = d[y * g.cols + x];
          if (v <= 0) continue;
          var th = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
          if (v >= th) ctx.fillRect(Math.round(x * cw), Math.round(y * ch), Math.ceil(cw) - gap, Math.ceil(ch) - gap);
        }
      }
    }

    function loop(now) {
      raf = 0;
      if (!visible || reduce.matches) return;
      if (!t0) { t0 = now; last = now; }
      var dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      acc += dt;
      var stepDt = 1 / fps;
      if (acc >= stepDt) {
        acc = acc % stepDt;
        g.t = (now - t0) / 1000;
        variant.step(g, g.t, stepDt);
        g.frame++;
        draw();
      }
      raf = requestAnimationFrame(loop);
    }

    function kick() { if (!raf && visible && !reduce.matches) raf = requestAnimationFrame(loop); }

    canvas.parentElement.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      g.pointer = { x: Math.floor((e.clientX - r.left) / cell), y: Math.floor((e.clientY - r.top) / cell), active: true };
    });
    canvas.parentElement.addEventListener("pointerleave", function () { g.pointer.active = false; });

    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }).observe(canvas);
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; last = performance.now(); kick(); });
    new ResizeObserver(function () { resize(); }).observe(canvas);
    new MutationObserver(function () { readColors(); draw(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { readColors(); draw(); });
    reduce.addEventListener("change", kick);

    readColors();
    resize();
    if (reduce.matches) { // show a single still frame
      for (var i = 0; i < 30; i++) variant.step(g, i / fps, 1 / fps);
      draw();
    }
    kick();
  }
})();

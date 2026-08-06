// Search — substring match over title, lede and tags, per the design's filter.
(function () {
  var input = document.getElementById('search-input');
  var out = document.getElementById('search-results');
  if (!input || !out) return;

  var src = (document.currentScript && document.currentScript.getAttribute('data-index')) || '/index.json';
  var posts = null;
  var pending = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function hint(text) {
    out.innerHTML = '<p class="search-hint">' + esc(text) + '</p>';
  }

  function row(p) {
    return '<article class="post-row">' +
      '<div class="post-row__meta">' +
        '<span class="meta-date">' + esc(p.date) + '</span>' +
        '<span class="meta-read">' + esc(p.read) + '</span>' +
      '</div>' +
      '<h3 class="post-row__title"><a href="' + esc(p.url) + '">' + esc(p.title) + '</a></h3>' +
      (p.lede ? '<p class="post-row__lede">' + esc(p.lede) + '</p>' : '') +
      '</article>';
  }

  function render(q) {
    if (q.length < 2) { hint('Type at least two characters.'); return; }
    if (!posts) { pending = q; hint('Searching…'); return; }

    var needle = q.toLowerCase();
    var hits = posts.filter(function (p) {
      var hay = (p.title + ' ' + (p.lede || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
      return hay.indexOf(needle) !== -1;
    });

    if (!hits.length) { hint('No results for “' + q + '”.'); return; }
    out.innerHTML = '<span class="eyebrow">' + hits.length + ' result' + (hits.length === 1 ? '' : 's') + '</span>' +
      hits.map(row).join('');
  }

  fetch(src)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      posts = data;
      render(pending !== null ? pending : input.value.trim());
      pending = null;
    })
    .catch(function () { hint('Search index unavailable.'); });

  input.addEventListener('input', function () { render(input.value.trim()); });

  var initial = new URLSearchParams(location.search).get('q');
  if (initial) { input.value = initial; }
  input.focus();
})();

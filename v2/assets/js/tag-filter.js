// Client-side tag filter for the Notes / Compendium listings.
(function () {
  var filter = document.querySelector('[data-tag-filter]');
  var list = document.querySelector('[data-post-list]');
  if (!filter || !list) return;

  var empty = document.querySelector('[data-empty]');
  var chips = Array.prototype.slice.call(filter.querySelectorAll('[data-tag]'));
  var rows = Array.prototype.slice.call(list.querySelectorAll('.post-row'));
  var years = Array.prototype.slice.call(list.querySelectorAll('[data-year]'));

  function tagsOf(row) {
    return (row.getAttribute('data-tags') || '').split('|').filter(Boolean);
  }

  function apply(tag) {
    var shown = 0;
    rows.forEach(function (row) {
      var match = !tag || tagsOf(row).indexOf(tag) !== -1;
      row.hidden = !match;
      if (match) shown++;
    });

    // A year heading only earns its place if something under it survived.
    years.forEach(function (head) {
      var visible = false;
      var node = head.nextElementSibling;
      while (node && !node.hasAttribute('data-year')) {
        if (node.classList.contains('post-row') && !node.hidden) { visible = true; break; }
        node = node.nextElementSibling;
      }
      head.hidden = !visible;
    });

    if (empty) empty.hidden = shown !== 0;

    chips.forEach(function (chip) {
      var on = chip.getAttribute('data-tag') === tag;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  var current = '';
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var tag = chip.getAttribute('data-tag');
      current = current === tag ? '' : tag;
      apply(current);
      if (history.replaceState) {
        history.replaceState(null, '', current ? '?tag=' + encodeURIComponent(current) : location.pathname);
      }
    });
  });

  var initial = new URLSearchParams(location.search).get('tag') || '';
  if (initial && chips.some(function (c) { return c.getAttribute('data-tag') === initial; })) {
    current = initial;
  }
  apply(current);
})();

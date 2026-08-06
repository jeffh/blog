// Theme toggle. The stored value is an override; with nothing stored the page
// follows prefers-color-scheme (see the no-flash script in head.html).
(function () {
  var btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;

  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function current() {
    var set = root.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    return media.matches ? 'dark' : 'light';
  }

  function label() {
    btn.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('title', btn.getAttribute('aria-label'));
  }

  btn.hidden = false;
  label();

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    // Storing the value that matches the OS would still be an override, which is
    // what we want: the choice sticks even if the OS later flips.
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });

  // Follow the OS while the reader has not made an explicit choice.
  var onChange = function () { if (!root.hasAttribute('data-theme')) label(); };
  if (media.addEventListener) media.addEventListener('change', onChange);
  else if (media.addListener) media.addListener(onChange);
})();

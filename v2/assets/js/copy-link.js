// "Copy link" share control.
(function () {
  var btn = document.querySelector('[data-copy-link]');
  if (!btn) return;
  var note = document.querySelector('[data-copied]');
  var timer;

  btn.addEventListener('click', function () {
    var url = btn.getAttribute('data-copy-link');
    var done = function () {
      if (!note) return;
      note.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(function () { note.hidden = true; }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () {});
      return;
    }
    var field = document.createElement('input');
    field.value = url;
    document.body.appendChild(field);
    field.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(field);
  });
})();

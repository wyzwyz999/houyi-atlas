/* 轻量交互：表格筛选、排序、序列复制。无依赖。 */
(function () {
  // ---- 序列/文本复制
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button.copy');
    if (!b) return;
    var txt = b.getAttribute('data-copy') || '';
    var done = function () {
      var old = b.textContent;
      b.textContent = '已复制';
      setTimeout(function () { b.textContent = old; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { fallback(txt, done); });
    } else {
      fallback(txt, done);
    }
  });

  function fallback(txt, cb) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (err) {}
    document.body.removeChild(ta);
  }

  // ---- 表格筛选
  var q = document.getElementById('q');
  var sel = document.querySelectorAll('.filters select');
  var table = document.getElementById('species-table');
  if (table) {
    var rows = Array.prototype.slice.call(table.tBodies[0].rows);
    var counter = document.getElementById('shown');
    var apply = function () {
      var text = (q && q.value || '').trim().toLowerCase();
      var conds = Array.prototype.map.call(sel, function (s) {
        return s.value ? { col: s.getAttribute('data-col'), val: s.value } : null;
      }).filter(Boolean);
      var n = 0;
      rows.forEach(function (tr) {
        var ok = true;
        if (text) {
          ok = (tr.getAttribute('data-search') || '').toLowerCase().indexOf(text) !== -1;
        }
        if (ok) {
          for (var i = 0; i < conds.length; i++) {
            var c = conds[i];
            var cell = tr.children[parseInt(c.col, 10)];
            var v = cell ? (cell.getAttribute('data-v') || cell.textContent.trim()) : '';
            if (v !== c.val) { ok = false; break; }
          }
        }
        tr.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      if (counter) counter.textContent = n;
    };
    if (q) q.addEventListener('input', apply);
    Array.prototype.forEach.call(sel, function (s) { s.addEventListener('change', apply); });
    apply();
  }

  // ---- 表格排序
  document.querySelectorAll('table.sortable th[data-sort]').forEach(function (th) {
    th.style.cursor = 'pointer';
    th.title = '点击排序';
    var asc = true;
    th.addEventListener('click', function () {
      var idx = Array.prototype.indexOf.call(th.parentNode.children, th);
      var tb = th.closest('table').tBodies[0];
      var rows = Array.prototype.slice.call(tb.rows);
      var numeric = th.getAttribute('data-sort') === 'num';
      rows.sort(function (a, b) {
        var x = a.children[idx].getAttribute('data-v') || a.children[idx].textContent.trim();
        var y = b.children[idx].getAttribute('data-v') || b.children[idx].textContent.trim();
        if (numeric) {
          var nx = parseFloat(x), ny = parseFloat(y);
          nx = isNaN(nx) ? -Infinity : nx; ny = isNaN(ny) ? -Infinity : ny;
          return asc ? nx - ny : ny - nx;
        }
        return asc ? String(x).localeCompare(String(y), 'zh') : String(y).localeCompare(String(x), 'zh');
      });
      asc = !asc;
      rows.forEach(function (r) { tb.appendChild(r); });
    });
  });
})();

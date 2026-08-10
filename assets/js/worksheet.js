/* Manage My Batch — shared worksheet engine.
   Printable worksheet layout, answer keys, seeded randomness and the SVG
   builders used by the clock, number-line and coordinate-grid generators. */
(function () {
  'use strict';

  /* ------------------------------------------------------------ seeded RNG */
  function hashSeed(s) {
    var h = 1779033703 ^ String(s).length;
    for (var i = 0; i < String(s).length; i++) {
      h = Math.imul(h ^ String(s).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function rng(seed) {
    var a = hashSeed(seed);
    function r() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    r.int = function (min, max) { return Math.floor(r() * (max - min + 1)) + min; };
    r.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    r.shuffle = function (arr) {
      var a2 = arr.slice();
      for (var i = a2.length - 1; i > 0; i--) {
        var j = Math.floor(r() * (i + 1));
        var t = a2[i]; a2[i] = a2[j]; a2[j] = t;
      }
      return a2;
    };
    return r;
  }

  /* ---------------------------------------------------------------- maths */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function simplify(n, d) { var g = gcd(n, d); return [n / g, d / g]; }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

  /* Renders a fraction as inline HTML with a real dividing rule. */
  function fracHtml(n, d, whole) {
    var w = whole ? '<span style="font-size:1.05em;margin-right:4px">' + whole + '</span>' : '';
    return w + '<span style="display:inline-flex;flex-direction:column;text-align:center;vertical-align:middle;' +
      'line-height:1.15;margin:0 2px"><span style="border-bottom:1.5px solid currentColor;padding:0 4px">' + n +
      '</span><span style="padding:0 4px">' + d + '</span></span>';
  }

  /* ------------------------------------------------------------ SVG parts */
  function svg(w, h, body, extra) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" ' +
      'xmlns="http://www.w3.org/2000/svg" ' + (extra || '') + '>' + body + '</svg>';
  }

  /* Analogue clock face. showHands=false gives a blank face for drawing on. */
  function clockFace(hour, minute, opts) {
    opts = opts || {};
    var size = opts.size || 130, r = size / 2, cx = r, cy = r, R = r - 6;
    var s = '';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#fff" stroke="#0f172a" stroke-width="2.5"/>';

    for (var i = 0; i < 60; i++) {
      var a = (i * 6 - 90) * Math.PI / 180;
      var major = i % 5 === 0;
      var r1 = R - (major ? 9 : 4), r2 = R - 1;
      s += '<line x1="' + (cx + r1 * Math.cos(a)).toFixed(2) + '" y1="' + (cy + r1 * Math.sin(a)).toFixed(2) +
        '" x2="' + (cx + r2 * Math.cos(a)).toFixed(2) + '" y2="' + (cy + r2 * Math.sin(a)).toFixed(2) +
        '" stroke="#0f172a" stroke-width="' + (major ? 2 : 1) + '"/>';
    }
    if (opts.numbers !== false) {
      for (var n = 1; n <= 12; n++) {
        var na = (n * 30 - 90) * Math.PI / 180;
        var nr = R - 22;
        s += '<text x="' + (cx + nr * Math.cos(na)).toFixed(2) + '" y="' + (cy + nr * Math.sin(na) + 5).toFixed(2) +
          '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="' +
          (size > 110 ? 15 : 12) + '" font-weight="600" fill="#0f172a">' + n + '</text>';
      }
    }
    if (opts.showHands !== false) {
      var mAng = (minute * 6 - 90) * Math.PI / 180;
      var hAng = ((hour % 12) * 30 + minute * 0.5 - 90) * Math.PI / 180;
      var hLen = R * 0.5, mLen = R * 0.75;
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + hLen * Math.cos(hAng)).toFixed(2) +
        '" y2="' + (cy + hLen * Math.sin(hAng)).toFixed(2) + '" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>';
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + mLen * Math.cos(mAng)).toFixed(2) +
        '" y2="' + (cy + mLen * Math.sin(mAng)).toFixed(2) + '" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="#0f172a"/>';
    return svg(size, size, s);
  }

  /* Number line. marks = [{v, label, dot}] */
  function numberLine(min, max, step, marks, opts) {
    opts = opts || {};
    var w = opts.width || 460, h = opts.height || 62;
    var padX = 22, y = 30;
    var span = max - min || 1;
    function x(v) { return padX + ((v - min) / span) * (w - padX * 2); }
    var s = '';
    s += '<line x1="' + padX + '" y1="' + y + '" x2="' + (w - padX) + '" y2="' + y +
      '" stroke="#0f172a" stroke-width="2"/>';
    /* arrowheads */
    s += '<path d="M' + (padX - 8) + ' ' + y + ' l9 -5 v10 z" fill="#0f172a"/>';
    s += '<path d="M' + (w - padX + 8) + ' ' + y + ' l-9 -5 v10 z" fill="#0f172a"/>';

    var count = Math.round(span / step);
    for (var i = 0; i <= count; i++) {
      var v = min + i * step;
      var px = x(v);
      s += '<line x1="' + px.toFixed(2) + '" y1="' + (y - 7) + '" x2="' + px.toFixed(2) + '" y2="' + (y + 7) +
        '" stroke="#0f172a" stroke-width="1.6"/>';
      var mk = (marks || []).filter(function (m) { return Math.abs(m.v - v) < 1e-9; })[0];
      var label = mk && mk.label !== undefined ? mk.label : (opts.hideLabels ? '' : formatNum(v));
      if (label !== '') {
        s += '<text x="' + px.toFixed(2) + '" y="' + (y + 24) + '" text-anchor="middle" ' +
          'font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#0f172a">' + label + '</text>';
      }
    }
    (marks || []).forEach(function (m) {
      if (m.dot) {
        s += '<circle cx="' + x(m.v).toFixed(2) + '" cy="' + y + '" r="5.5" fill="#2563eb"/>';
      }
      if (m.arrow) {
        var x1 = x(m.arrow[0]), x2 = x(m.arrow[1]);
        var mid = (x1 + x2) / 2, rad = Math.abs(x2 - x1) / 2;
        s += '<path d="M' + x1.toFixed(2) + ' ' + (y - 2) + ' A ' + rad.toFixed(2) + ' ' + Math.min(rad, 18).toFixed(2) +
          ' 0 0 1 ' + x2.toFixed(2) + ' ' + (y - 2) + '" fill="none" stroke="#2563eb" stroke-width="1.8"/>';
        s += '<circle cx="' + mid.toFixed(2) + '" cy="' + (y - Math.min(rad, 18) - 2) + '" r="0" fill="none"/>';
      }
    });
    return svg(w, h, s);
  }

  /* Coordinate grid. quadrants = 1 or 4. points = [{x,y,label,plot}] */
  function coordGrid(range, points, opts) {
    opts = opts || {};
    var quad = opts.quadrants || 4;
    var minV = quad === 1 ? 0 : -range, maxV = range;
    var cells = maxV - minV;
    var cell = opts.cell || 20;
    var pad = 26;
    var size = cells * cell;
    var w = size + pad * 2, h = size + pad * 2;
    function px(v) { return pad + (v - minV) * cell; }
    function py(v) { return pad + (maxV - v) * cell; }
    var s = '';
    /* grid lines */
    for (var i = 0; i <= cells; i++) {
      var p = pad + i * cell;
      s += '<line x1="' + p + '" y1="' + pad + '" x2="' + p + '" y2="' + (pad + size) + '" stroke="#cbd5e1" stroke-width="0.8"/>';
      s += '<line x1="' + pad + '" y1="' + p + '" x2="' + (pad + size) + '" y2="' + p + '" stroke="#cbd5e1" stroke-width="0.8"/>';
    }
    /* axes */
    s += '<line x1="' + px(minV) + '" y1="' + py(0) + '" x2="' + px(maxV) + '" y2="' + py(0) + '" stroke="#0f172a" stroke-width="1.8"/>';
    s += '<line x1="' + px(0) + '" y1="' + py(minV) + '" x2="' + px(0) + '" y2="' + py(maxV) + '" stroke="#0f172a" stroke-width="1.8"/>';
    /* labels every step */
    var stepL = opts.labelStep || (range > 10 ? 2 : 1);
    for (var v = minV; v <= maxV; v++) {
      if (v === 0 || v % stepL !== 0) continue;
      s += '<text x="' + px(v) + '" y="' + (py(0) + 13) + '" text-anchor="middle" font-family="Arial" font-size="9" fill="#475569">' + v + '</text>';
      s += '<text x="' + (px(0) - 7) + '" y="' + (py(v) + 3) + '" text-anchor="end" font-family="Arial" font-size="9" fill="#475569">' + v + '</text>';
    }
    s += '<text x="' + (px(0) - 7) + '" y="' + (py(0) + 13) + '" text-anchor="end" font-family="Arial" font-size="9" fill="#475569">0</text>';
    /* points */
    (points || []).forEach(function (pt) {
      if (pt.plot !== false) {
        s += '<circle cx="' + px(pt.x) + '" cy="' + py(pt.y) + '" r="4.5" fill="#2563eb"/>';
      }
      if (pt.label) {
        s += '<text x="' + (px(pt.x) + 7) + '" y="' + (py(pt.y) - 6) + '" font-family="Arial" font-size="11" font-weight="700" fill="#2563eb">' +
          pt.label + '</text>';
      }
    });
    return svg(w, h, s);
  }

  function formatNum(v) {
    var r = Math.round(v * 1000) / 1000;
    return String(r);
  }

  /* ------------------------------------------------------- print worksheet */
  /* opts: { title, subtitle, instructions, items:[{html,answer}], columns,
             answerKey, headerFields, itemHeight, answerColumns } */
  function print(opts) {
    var cols = opts.columns || 2;
    var fields = opts.headerFields === false ? '' :
      '<div class="hdr">' + (opts.headerFields || ['Name', 'Date', 'Score'])
        .map(function (f) { return '<span>' + f + ': <span class="rule"></span></span>'; }).join('') + '</div>';

    var itemsHtml = '<ol class="items cols' + cols + '">' + opts.items.map(function (it) {
      return '<li><div class="q">' + it.html + '</div>' +
        (it.workspace ? '<div class="ws" style="height:' + it.workspace + 'px"></div>' : '') + '</li>';
    }).join('') + '</ol>';

    var keyHtml = '';
    if (opts.answerKey !== false) {
      var kc = opts.answerColumns || 4;
      keyHtml = '<div class="pagebreak"></div>' +
        '<h1>' + GT.esc(opts.title) + ' — Answer Key</h1>' +
        '<p class="sub">' + GT.esc(opts.subtitle || '') + '</p>' +
        '<ol class="items cols' + kc + ' key">' + opts.items.map(function (it) {
          return '<li><div class="q">' + (it.answer === undefined ? '' : it.answer) + '</div></li>';
        }).join('') + '</ol>';
    }

    var css =
      'body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;margin:14mm}' +
      'h1{font-size:19px;margin:0 0 3px}.sub{color:#64748b;font-size:12px;margin:0 0 10px}' +
      '.hdr{display:flex;gap:26px;flex-wrap:wrap;border-bottom:1.5px solid #0f172a;padding-bottom:9px;margin-bottom:14px;font-size:13px}' +
      '.hdr .rule{display:inline-block;width:110px;border-bottom:1px solid #94a3b8}' +
      '.inst{font-size:13px;margin:0 0 16px;font-style:italic;color:#334155}' +
      'ol.items{margin:0;padding:0 0 0 6px;list-style:none;counter-reset:q}' +
      'ol.items>li{counter-increment:q;break-inside:avoid;page-break-inside:avoid;margin:0 0 14px;padding-left:26px;position:relative}' +
      'ol.items>li::before{content:counter(q) ".";position:absolute;left:0;top:1px;font-weight:700;font-size:13px;color:#334155}' +
      '.cols2{column-count:2;column-gap:30px}.cols3{column-count:3;column-gap:22px}' +
      '.cols4{column-count:4;column-gap:18px}.cols1{column-count:1}' +
      '.q{font-size:15px;line-height:1.6}' +
      '.ws{border-bottom:1px dotted #cbd5e1}' +
      '.key .q{font-size:13px;color:#1d4ed8;font-weight:600}' +
      '.pagebreak{page-break-before:always;break-before:page;height:0}' +
      'svg{display:block;margin:6px 0}' +
      'table.grid{border-collapse:collapse}table.grid td{border:1px solid #94a3b8;width:26px;height:26px;' +
      'text-align:center;font-size:14px;font-weight:600;text-transform:uppercase}' +
      '@media print{body{margin:12mm}.noprint{display:none}}';

    var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + GT.esc(opts.title) +
      '</title><style>' + css + '</style></head><body>' +
      '<h1>' + GT.esc(opts.title) + '</h1>' +
      (opts.subtitle ? '<p class="sub">' + GT.esc(opts.subtitle) + '</p>' : '') +
      fields +
      (opts.instructions ? '<p class="inst">' + GT.esc(opts.instructions) + '</p>' : '') +
      itemsHtml + keyHtml +
      '<p class="noprint" style="margin-top:24px;color:#64748b;font-size:11px">Generated with managemybatch.com</p>' +
      '<script>window.onload=function(){window.print()}<' + '/script></body></html>';

    var w = window.open('', '_blank');
    if (!w) { GT.toast('Allow pop-ups to print'); return; }
    w.document.write(html);
    w.document.close();
  }

  /* On-page preview of the same items, so what you see matches what prints. */
  function preview(host, opts) {
    var cols = opts.previewColumns || opts.columns || 2;
    GT.$(host).innerHTML =
      '<div style="border:1px solid var(--line);border-radius:12px;padding:18px;background:#fff">' +
      '<div style="font-weight:700;font-size:15px;margin-bottom:2px">' + GT.esc(opts.title) + '</div>' +
      (opts.subtitle ? '<div style="color:var(--muted);font-size:12.5px;margin-bottom:10px">' + GT.esc(opts.subtitle) + '</div>' : '') +
      (opts.instructions ? '<div style="font-size:13px;font-style:italic;color:var(--ink-2);margin-bottom:14px">' + GT.esc(opts.instructions) + '</div>' : '') +
      '<ol style="column-count:' + cols + ';column-gap:26px;margin:0;padding:0 0 0 4px;list-style:none;counter-reset:q">' +
      opts.items.map(function (it) {
        return '<li style="counter-increment:q;break-inside:avoid;margin:0 0 12px;padding-left:24px;position:relative;font-size:14.5px;line-height:1.6">' +
          '<span style="position:absolute;left:0;top:0;font-weight:700;color:var(--muted)">' +
          '</span><span style="position:absolute;left:0;top:0;font-weight:700;color:var(--muted);font-size:13px" class="qnum"></span>' +
          it.html + '</li>';
      }).join('') + '</ol></div>';
    /* counters do not render via CSS content in all preview contexts, so number manually */
    GT.$$(host + ' .qnum').forEach(function (el, i) { el.textContent = (i + 1) + '.'; });
  }

  function answerKeyPreview(host, items) {
    GT.$(host).innerHTML = items.length
      ? '<div style="columns:3;column-gap:20px;font-size:13.5px;line-height:1.9">' +
        items.map(function (it, i) {
          return '<div style="break-inside:avoid"><span style="color:var(--muted);font-weight:600">' +
            (i + 1) + '.</span> <span style="color:var(--blue);font-weight:600">' +
            (it.answer === undefined ? '—' : it.answer) + '</span></div>';
        }).join('') + '</div>'
      : '<div class="empty">No items.</div>';
  }

  window.GTWorksheet = {
    rng: rng, gcd: gcd, simplify: simplify, lcm: lcm, fracHtml: fracHtml,
    svg: svg, clockFace: clockFace, numberLine: numberLine, coordGrid: coordGrid,
    print: print, preview: preview, answerKeyPreview: answerKeyPreview, formatNum: formatNum
  };
})();

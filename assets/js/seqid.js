/* Manage My Batch — shared structured-identifier engine.
   Powers the invoice / PO / order / receipt / ticket / reference / employee /
   asset / batch / lot number generators. Token-driven so every tool can expose
   a simple form and an advanced pattern field over the same code path. */
(function () {
  'use strict';

  /* ------------------------------------------------------------ date tokens */
  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var DATE_FORMATS = [
    { id: 'none',     label: 'No date',            pattern: '' },
    { id: 'YYYYMMDD', label: 'YYYYMMDD — 20260809', pattern: '{YYYY}{MM}{DD}' },
    { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD — 2026-08-09', pattern: '{YYYY}-{MM}-{DD}' },
    { id: 'YYMMDD',   label: 'YYMMDD — 260809',    pattern: '{YY}{MM}{DD}' },
    { id: 'YYYYMM',   label: 'YYYYMM — 202608',    pattern: '{YYYY}{MM}' },
    { id: 'YYYY',     label: 'YYYY — 2026',        pattern: '{YYYY}' },
    { id: 'YY',       label: 'YY — 26',            pattern: '{YY}' },
    { id: 'YYYY-Q',   label: 'YYYY-Qn — 2026-Q3',  pattern: '{YYYY}-Q{Q}' },
    { id: 'YYYYWW',   label: 'YYYYWW — 202632 (ISO week)', pattern: '{YYYY}{WW}' },
    { id: 'MMMYY',    label: 'MMMYY — AUG26',      pattern: '{MMM}{YY}' },
    { id: 'YYJJJ',    label: 'YYJJJ — 26221 (Julian)', pattern: '{YY}{JJJ}' },
    { id: 'FY',       label: 'FY — fiscal year',   pattern: 'FY{FY}' }
  ];

  function isoWeek(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    var start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - start) / 86400000 + 1) / 7);
  }
  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }
  function fiscalYear(d, startMonth) {
    /* startMonth is 1-12; a fiscal year starting in July 2026 is "FY27". */
    var m = d.getMonth() + 1, y = d.getFullYear();
    return (startMonth > 1 && m >= startMonth) ? y + 1 : y;
  }

  var RAND_SETS = {
    alnum: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',      /* no look-alikes */
    alpha: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    digits: '0123456789',
    hex: '0123456789ABCDEF',
    full: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  };

  function randChars(n, set) {
    var s = RAND_SETS[set] || RAND_SETS.alnum;
    var b = new Uint8Array(n);
    (window.crypto || window.msCrypto).getRandomValues(b);
    var o = '';
    /* rejection sampling keeps the distribution uniform */
    var limit = Math.floor(256 / s.length) * s.length;
    var i = 0;
    while (o.length < n) {
      if (i >= b.length) { b = new Uint8Array(n); crypto.getRandomValues(b); i = 0; }
      var v = b[i++];
      if (v < limit) o += s[v % s.length];
    }
    return o;
  }

  /* ------------------------------------------------------------ check digits */
  function luhn(num) {
    var digits = String(num).replace(/\D/g, '');
    var sum = 0, alt = true;
    for (var i = digits.length - 1; i >= 0; i--) {
      var d = +digits[i];
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return (10 - (sum % 10)) % 10;
  }
  function mod97(ref) {
    /* ISO 11649 / RF creditor reference style: letters map to 10-35. */
    var s = String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '');
    var expanded = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      expanded += /[0-9]/.test(c) ? c : String(c.charCodeAt(0) - 55);
    }
    var rem = 0;
    for (var j = 0; j < expanded.length; j++) rem = (rem * 10 + (+expanded[j])) % 97;
    return String(98 - rem).padStart(2, '0');
  }
  function mod11(num) {
    /* Common in Nordic/utility reference numbers. Returns 0-9, or '-' when 10. */
    var digits = String(num).replace(/\D/g, '');
    var weights = [2, 3, 4, 5, 6, 7], sum = 0, w = 0;
    for (var i = digits.length - 1; i >= 0; i--) {
      sum += (+digits[i]) * weights[w % weights.length]; w++;
    }
    var r = 11 - (sum % 11);
    return r === 11 ? '0' : r === 10 ? '-' : String(r);
  }

  var CHECK_DIGITS = [
    { id: 'none', label: 'None' },
    { id: 'luhn', label: 'Luhn (mod 10) — cards, many ERPs' },
    { id: 'mod97', label: 'Mod-97 (ISO 11649) — bank references' },
    { id: 'mod11', label: 'Mod-11 — utility and Nordic references' }
  ];

  function applyCheck(value, kind) {
    if (!kind || kind === 'none') return value;
    if (kind === 'luhn') return value + luhn(value);
    if (kind === 'mod97') return value + mod97(value);
    if (kind === 'mod11') return value + mod11(value);
    return value;
  }

  /* --------------------------------------------------------------- expansion */
  /* opts: { prefix, suffix, datePattern, sep, start, step, pad, count, date,
             fiscalStart, randSet, pattern, checkDigit, upper } */
  function expand(pattern, ctx) {
    var d = ctx.date || new Date();
    return String(pattern).replace(/\{(YYYY|YY|MMM|MM|DD|Q|WW|JJJ|FY|SEQ|SEQ:\d+|RAND:\d+|RANDN:\d+|PREFIX|SUFFIX|SEP)\}/g,
      function (m, tok) {
        if (tok === 'YYYY') return String(d.getFullYear());
        if (tok === 'YY') return String(d.getFullYear()).slice(-2);
        if (tok === 'MMM') return MONTHS_SHORT[d.getMonth()].toUpperCase();
        if (tok === 'MM') return String(d.getMonth() + 1).padStart(2, '0');
        if (tok === 'DD') return String(d.getDate()).padStart(2, '0');
        if (tok === 'Q') return String(Math.floor(d.getMonth() / 3) + 1);
        if (tok === 'WW') return String(isoWeek(d)).padStart(2, '0');
        if (tok === 'JJJ') return String(dayOfYear(d)).padStart(3, '0');
        if (tok === 'FY') return String(fiscalYear(d, ctx.fiscalStart || 1)).slice(-2);
        if (tok === 'PREFIX') return ctx.prefix || '';
        if (tok === 'SUFFIX') return ctx.suffix || '';
        if (tok === 'SEP') return ctx.sep == null ? '-' : ctx.sep;
        if (tok === 'SEQ') return String(ctx.seq).padStart(ctx.pad || 1, '0');
        if (tok.indexOf('SEQ:') === 0) return String(ctx.seq).padStart(+tok.split(':')[1], '0');
        if (tok.indexOf('RANDN:') === 0) return randChars(+tok.split(':')[1], 'digits');
        if (tok.indexOf('RAND:') === 0) return randChars(+tok.split(':')[1], ctx.randSet || 'alnum');
        return m;
      });
  }

  /* Build the pattern implied by the simple form controls. */
  function simplePattern(opts) {
    var sep = opts.sep == null ? '-' : opts.sep;
    var parts = [];
    if (opts.prefix) parts.push('{PREFIX}');
    var df = DATE_FORMATS.filter(function (f) { return f.id === opts.dateFormat; })[0];
    if (df && df.pattern) parts.push(df.pattern);
    if (opts.randLen) parts.push('{RAND:' + opts.randLen + '}');
    parts.push('{SEQ}');
    if (opts.suffix) parts.push('{SUFFIX}');
    return parts.join(sep === '' ? '' : '{SEP}');
  }

  function generate(opts) {
    var count = Math.max(1, Math.min(5000, opts.count || 1));
    var start = parseInt(opts.start, 10);
    if (isNaN(start)) start = 1;
    var step = parseInt(opts.step, 10) || 1;
    var pattern = opts.pattern && opts.pattern.trim() ? opts.pattern.trim() : simplePattern(opts);
    var res = [];
    for (var i = 0; i < count; i++) {
      var ctx = {
        seq: start + i * step,
        pad: opts.pad || 1,
        prefix: opts.prefix || '',
        suffix: opts.suffix || '',
        sep: opts.sep == null ? '-' : opts.sep,
        date: opts.dates && opts.dates[i] ? opts.dates[i] : (opts.date || new Date()),
        fiscalStart: opts.fiscalStart,
        randSet: opts.randSet
      };
      var v = expand(pattern, ctx);
      v = applyCheck(v, opts.checkDigit);
      if (opts.upper) v = v.toUpperCase();
      res.push(v);
    }
    return { ids: res, pattern: pattern };
  }

  /* ------------------------------------------------------------ result panel */
  /* Renders the primary + "more" layout used across the numbering tools. */
  function renderResults(opts) {
    var ids = opts.ids || [];
    var noun = opts.noun || 'Number';
    var primaryHost = GT.$(opts.primary);
    var moreHost = GT.$(opts.more);
    if (!ids.length) {
      primaryHost.innerHTML = '<div class="empty">Press Generate to create your first ' + noun.toLowerCase() + '.</div>';
      moreHost.innerHTML = '';
      return;
    }
    primaryHost.innerHTML =
      '<div class="primary-result"><div class="plabel">Primary ' + GT.esc(noun) + '</div>' +
      '<div class="prow"><span class="pval" id="primaryVal">' + GT.esc(ids[0]) + '</span>' +
      '<button type="button" class="btn btn-primary" data-copy-idx="0">' + GTI.copy + ' Copy</button></div></div>';

    var rest = ids.slice(1, opts.maxMore || 12);
    moreHost.innerHTML = rest.length
      ? '<p class="more-label">More ' + GT.esc(noun) + 's</p><div class="more-list">' +
        rest.map(function (v, i) {
          return '<div class="more-row"><span class="mval">' + GT.esc(v) + '</span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-copy-idx="' + (i + 1) + '">' +
            GTI.copy + ' Copy</button></div>';
        }).join('') + '</div>' +
        (ids.length > (opts.maxMore || 12)
          ? '<p style="color:var(--muted);font-size:13px;margin-top:10px">' +
            (ids.length - (opts.maxMore || 12)).toLocaleString() +
            ' more in the Export tab.</p>' : '')
      : '';
  }

  /* Export the full set in several shapes. */
  function exportAs(ids, mode, opts) {
    opts = opts || {};
    var col = opts.column || 'number';
    var table = opts.table || 'records';
    if (mode === 'json') return JSON.stringify(ids, null, 2);
    if (mode === 'csv') return col + '\n' + ids.join('\n');
    if (mode === 'csvIndexed') return 'index,' + col + '\n' + ids.map(function (v, i) { return (i + 1) + ',' + v; }).join('\n');
    if (mode === 'sql') {
      return 'INSERT INTO ' + table + ' (' + col + ') VALUES\n' +
        ids.map(function (v) { return "  ('" + String(v).replace(/'/g, "''") + "')"; }).join(',\n') + ';';
    }
    if (mode === 'quoted') return ids.map(function (v) { return '"' + v + '"'; }).join(', ');
    if (mode === 'excel') {
      return '=TEXTJOIN(CHAR(10),TRUE,' + ids.slice(0, 30).map(function (v) { return '"' + v + '"'; }).join(',') + ')';
    }
    return ids.join('\n');
  }

  /* Shared validation applied to any generated set. */
  function validate(ids, opts) {
    opts = opts || {};
    var c = [];
    function add(s, m) { c.push({ s: s, m: m }); }

    if (!ids.length) { add('err', 'Nothing generated yet.'); return c; }

    var uniq = GT.uniq(ids);
    add(uniq.length === ids.length ? 'ok' : 'err',
      uniq.length === ids.length
        ? 'All ' + ids.length.toLocaleString() + ' values are unique'
        : (ids.length - uniq.length) + ' duplicate values — increase the padding, add a date segment, or raise the random length');

    var len = ids[0].length;
    var sameLen = ids.every(function (v) { return v.length === len; });
    add(sameLen ? 'ok' : 'warn',
      sameLen ? 'Fixed length (' + len + ' characters) — sorts and aligns predictably'
              : 'Variable length — values will not sort or align consistently. Increase padding so the sequence never grows a digit.');

    add(len <= 32 ? 'ok' : 'warn', len <= 32 ? 'Length is practical for forms, labels and databases'
      : 'Values are ' + len + ' characters — long for printed labels and manual entry');

    if (opts.checkDigit && opts.checkDigit !== 'none') {
      add('ok', 'Check digit appended (' + opts.checkDigit + ') — single-digit typos and most transpositions are detectable');
    } else if (opts.suggestCheck) {
      add('warn', 'No check digit. If humans ever retype these, a check digit catches the overwhelming majority of typing errors.');
    }

    var risky = /[IOl01]/.test(ids[0]) && opts.humanEntry;
    if (opts.humanEntry) {
      add(risky ? 'warn' : 'ok', risky
        ? 'Contains characters that are easily confused when read aloud or handwritten (I/1, O/0)'
        : 'No easily-confused characters');
    }

    if (opts.sequential) {
      add('warn', 'Values are sequential and therefore guessable. That is required for accounting records, but never use a sequential number as a security token or a public lookup key on its own.');
    }
    return c;
  }

  function renderChecks(host, checks) {
    GT.$(host).innerHTML = checks.map(function (x) {
      return '<div class="note ' + (x.s === 'ok' ? 'note-ok' : x.s === 'warn' ? 'note-warn' : 'note-err') +
        '" style="margin-top:8px">' + (x.s === 'ok' ? GTI.check : GTI.warn) + '<span>' + x.m + '</span></div>';
    }).join('');
  }

  /* Wire copy buttons inside a results container. */
  function bindCopy(host, getIds) {
    GT.$(host).addEventListener('click', function (e) {
      var b = e.target.closest('[data-copy-idx]');
      if (!b) return;
      var ids = getIds();
      GT.copy(ids[+b.getAttribute('data-copy-idx')], 'Number');
    });
  }

  /* Insert a token at the cursor of the advanced-pattern input. */
  function bindTokenHelp(helpSel, inputSel, onChange) {
    var host = GT.$(helpSel);
    if (!host) return;
    host.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var input = GT.$(inputSel);
      var tok = b.getAttribute('data-token');
      var s = input.selectionStart == null ? input.value.length : input.selectionStart;
      var t = input.selectionEnd == null ? s : input.selectionEnd;
      input.value = input.value.slice(0, s) + tok + input.value.slice(t);
      input.focus();
      input.selectionStart = input.selectionEnd = s + tok.length;
      onChange();
    });
  }

  var TOKENS = ['{PREFIX}', '{SEQ}', '{SEQ:5}', '{YYYY}', '{YY}', '{MM}', '{DD}', '{MMM}',
    '{Q}', '{WW}', '{JJJ}', '{FY}', '{RAND:4}', '{RANDN:3}', '{SEP}', '{SUFFIX}'];

  function tokenHelpHtml() {
    return TOKENS.map(function (t) {
      return '<button type="button" data-token="' + t + '">' + t + '</button>';
    }).join('');
  }

  window.GTSeq = {
    DATE_FORMATS: DATE_FORMATS, CHECK_DIGITS: CHECK_DIGITS, TOKENS: TOKENS,
    expand: expand, generate: generate, simplePattern: simplePattern,
    renderResults: renderResults, exportAs: exportAs, validate: validate,
    renderChecks: renderChecks, bindCopy: bindCopy, bindTokenHelp: bindTokenHelp,
    tokenHelpHtml: tokenHelpHtml, randChars: randChars,
    luhn: luhn, mod97: mod97, mod11: mod11, applyCheck: applyCheck,
    isoWeek: isoWeek, fiscalYear: fiscalYear
  };
})();

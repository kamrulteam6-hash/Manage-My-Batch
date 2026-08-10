/* Manage My Batch — shared roster engine for the classroom / group tools.
   Parsing, seeded shuffling, pairing, grouping and constraint handling.
   Deterministic: the same seed and roster always produce the same result. */
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
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ------------------------------------------------------------- parsing */
  /* Accepts one name per line, or comma/semicolon separated, and strips any
     leading numbering the teacher pasted along with the list. */
  function parseNames(text) {
    var raw = String(text || '');
    var lines = raw.split(/\r?\n/);
    /* If it looks like a single comma-separated line, split on commas instead. */
    if (lines.filter(function (l) { return l.trim(); }).length === 1 && /[,;]/.test(raw)) {
      lines = raw.split(/[,;]/);
    }
    var seen = {}, out = [], dupes = [];
    lines.forEach(function (l) {
      var n = l.trim()
        .replace(/^\s*\d+\s*[.)\]:-]\s*/, '')   /* "12. Ada" → "Ada" */
        .replace(/^\s*[-*•]\s*/, '')            /* "- Ada"   → "Ada" */
        .trim();
      if (!n) return;
      var key = n.toLowerCase();
      if (seen[key]) { dupes.push(n); return; }
      seen[key] = 1;
      out.push(n);
    });
    return { names: out, duplicates: dupes };
  }

  /* Parse "A & B" or "A|B" constraint lines into pairs of names. */
  function parsePairs(text) {
    return String(text || '').split(/\r?\n/).map(function (l) {
      var p = l.split(/\s*[&|,]\s*|\s+and\s+/i).map(function (x) { return x.trim(); }).filter(Boolean);
      return p.length >= 2 ? [p[0], p[1]] : null;
    }).filter(Boolean);
  }

  function conflicts(a, b, apart) {
    for (var i = 0; i < apart.length; i++) {
      var p = apart[i];
      var la = p[0].toLowerCase(), lb = p[1].toLowerCase();
      var xa = a.toLowerCase(), xb = b.toLowerCase();
      if ((la === xa && lb === xb) || (la === xb && lb === xa)) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------- pairing */
  /* Round-robin (circle method): every student meets every other exactly once
     across n-1 rounds, so repeated rounds never repeat a partner. */
  function roundRobinRounds(names) {
    var list = names.slice();
    var bye = null;
    if (list.length % 2 === 1) { bye = '__BYE__'; list.push(bye); }
    var n = list.length;
    var rounds = [];
    var fixed = list[0];
    var rot = list.slice(1);
    for (var r = 0; r < n - 1; r++) {
      var round = [];
      round.push([fixed, rot[rot.length - 1]]);
      for (var i = 0; i < (n - 2) / 2; i++) {
        round.push([rot[i], rot[rot.length - 2 - i]]);
      }
      rounds.push(round.map(function (p) {
        return [p[0] === bye ? null : p[0], p[1] === bye ? null : p[1]];
      }));
      rot.unshift(rot.pop());
    }
    return rounds;
  }

  /* opts: { seed, rounds, oddMode: 'trio'|'sitout'|'teacher', apart, noRepeat } */
  function makePairs(names, opts) {
    opts = opts || {};
    var rand = rng(opts.seed || 'gentools');
    var apart = opts.apart || [];
    var roundsWanted = Math.max(1, opts.rounds || 1);
    var result = [];

    if (opts.noRepeat) {
      /* Shuffle first so the round-robin order is not alphabetical, then take
         as many rounds as requested from the guaranteed-unique schedule. */
      var shuffled = shuffle(names, rand);
      var schedule = roundRobinRounds(shuffled);
      for (var r = 0; r < roundsWanted; r++) {
        var src = schedule[r % schedule.length];
        result.push(formatRound(src, opts, r >= schedule.length));
      }
      return { rounds: result, maxUniqueRounds: schedule.length };
    }

    for (var k = 0; k < roundsWanted; k++) {
      var pool = shuffle(names, rand);
      var pairs = [], leftover = [];
      /* Greedy pass honouring keep-apart constraints. */
      while (pool.length) {
        var a = pool.shift();
        var idx = -1;
        for (var i = 0; i < pool.length; i++) {
          if (!conflicts(a, pool[i], apart)) { idx = i; break; }
        }
        if (idx === -1) { leftover.push(a); continue; }
        pairs.push([a, pool.splice(idx, 1)[0]]);
      }
      leftover.forEach(function (n) { pairs.push([n, null]); });
      result.push(formatRound(pairs, opts, false));
    }
    return { rounds: result, maxUniqueRounds: null };
  }

  function formatRound(pairs, opts, recycled) {
    var mode = opts.oddMode || 'trio';
    var out = [], singles = [];
    pairs.forEach(function (p) {
      if (p[0] && p[1]) out.push([p[0], p[1]]);
      else if (p[0]) singles.push(p[0]);
      else if (p[1]) singles.push(p[1]);
    });
    singles.forEach(function (s) {
      if (mode === 'trio' && out.length) out[out.length - 1] = out[out.length - 1].concat([s]);
      else out.push([s]);
    });
    return { pairs: out, recycled: recycled };
  }

  /* ------------------------------------------------------------- grouping */
  /* opts: { seed, mode:'size'|'count', value, apart, together, balanceBy } */
  function makeGroups(names, opts) {
    opts = opts || {};
    var rand = rng(opts.seed || 'gentools');
    var apart = opts.apart || [];
    var together = opts.together || [];

    /* Merge keep-together students into single units so they move as one. */
    var units = [], claimed = {};
    together.forEach(function (p) {
      var a = names.filter(function (n) { return n.toLowerCase() === p[0].toLowerCase(); })[0];
      var b = names.filter(function (n) { return n.toLowerCase() === p[1].toLowerCase(); })[0];
      if (a && b && !claimed[a] && !claimed[b]) {
        units.push([a, b]); claimed[a] = claimed[b] = 1;
      }
    });
    names.forEach(function (n) { if (!claimed[n]) units.push([n]); });

    units = shuffle(units, rand);

    var total = names.length;
    var groupCount = opts.mode === 'count'
      ? Math.max(1, Math.min(total, opts.value || 1))
      : Math.max(1, Math.ceil(total / Math.max(1, opts.value || 1)));

    var groups = [];
    for (var i = 0; i < groupCount; i++) groups.push([]);

    /* Place the largest units first, always into the smallest group, so sizes
       stay balanced even when keep-together pairs are involved. */
    units.sort(function (a, b) { return b.length - a.length; });
    units.forEach(function (u) {
      var best = -1, bestScore = Infinity;
      for (var g = 0; g < groups.length; g++) {
        var bad = groups[g].some(function (m) {
          return u.some(function (x) { return conflicts(m, x, apart); });
        });
        var score = groups[g].length + (bad ? 1000 : 0);
        if (score < bestScore) { bestScore = score; best = g; }
      }
      groups[best] = groups[best].concat(u);
    });

    var violated = [];
    groups.forEach(function (g) {
      g.forEach(function (a, i) {
        g.slice(i + 1).forEach(function (b) {
          if (conflicts(a, b, apart)) violated.push([a, b]);
        });
      });
    });

    return { groups: groups, violations: violated };
  }

  /* --------------------------------------------------------------- render */
  function rosterStats(host, parsed, extra) {
    var el = GT.$(host);
    if (!el) return;
    var bits = [parsed.names.length + ' name' + (parsed.names.length === 1 ? '' : 's')];
    if (parsed.duplicates.length) bits.push(parsed.duplicates.length + ' duplicate removed');
    el.innerHTML = '<div class="note ' + (parsed.names.length ? 'note-ok' : 'note-warn') + '" style="margin-top:10px">' +
      (parsed.names.length ? GTI.check : GTI.warn) + '<span>' + bits.join(' · ') +
      (parsed.duplicates.length ? ' (' + GT.esc(GT.uniq(parsed.duplicates).slice(0, 5).join(', ')) + ')' : '') +
      (extra ? '<br>' + extra : '') + '</span></div>';
  }

  /* A print-friendly window for handouts and display boards. */
  function printHtml(title, bodyHtml) {
    var w = window.open('', '_blank');
    if (!w) { GT.toast('Allow pop-ups to print'); return; }
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + GT.esc(title) + '</title>' +
      '<style>' +
      'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#0f172a;margin:32px;}' +
      'h1{font-size:22px;margin:0 0 4px}.sub{color:#64748b;font-size:13px;margin-bottom:22px}' +
      '.grid{display:grid;gap:14px}.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}' +
      '.card{border:1px solid #cbd5e1;border-radius:10px;padding:14px;break-inside:avoid}' +
      '.card h3{margin:0 0 8px;font-size:15px}.card ol,.card ul{margin:0;padding-left:20px;font-size:14px;line-height:1.7}' +
      'table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #cbd5e1;padding:10px;text-align:left}' +
      'th{background:#f1f5f9}' +
      '.seat{border:1px solid #cbd5e1;border-radius:8px;padding:12px 8px;text-align:center;font-size:13px;min-height:44px}' +
      '.empty{color:#94a3b8;font-style:italic}' +
      '@media print{body{margin:12mm}.noprint{display:none}}' +
      '</style></head><body>' + bodyHtml +
      '<p class="noprint" style="margin-top:28px;color:#64748b;font-size:12px">Generated with managemybatch.com</p>' +
      '<script>window.onload=function(){window.print()}<' + '/script></body></html>');
    w.document.close();
  }

  window.GTRoster = {
    rng: rng, shuffle: shuffle, parseNames: parseNames, parsePairs: parsePairs,
    makePairs: makePairs, makeGroups: makeGroups, roundRobinRounds: roundRobinRounds,
    rosterStats: rosterStats, printHtml: printHtml, conflicts: conflicts
  };
})();

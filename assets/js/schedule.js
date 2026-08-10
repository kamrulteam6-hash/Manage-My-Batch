/* Manage My Batch — shared scheduling engine.
   Brackets, round-robin fixtures, constrained derangements and rotation
   matrices for the sports, gift-exchange and rota generators. */
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
    r.int = function (lo, hi) { return Math.floor(r() * (hi - lo + 1)) + lo; };
    r.pick = function (a2) { return a2[Math.floor(r() * a2.length)]; };
    r.shuffle = function (a2) {
      var o = a2.slice();
      for (var i = o.length - 1; i > 0; i--) {
        var j = Math.floor(r() * (i + 1));
        var t = o[i]; o[i] = o[j]; o[j] = t;
      }
      return o;
    };
    return r;
  }

  /* --------------------------------------------------------------- brackets */
  /* Standard tournament seed order: 1 meets the lowest seed, 2 is placed in the
     opposite half, and so on recursively. Size must be a power of two. */
  function seedOrder(size) {
    var order = [1, 2];
    while (order.length < size) {
      var n = order.length * 2, next = [];
      order.forEach(function (s) { next.push(s, n + 1 - s); });
      order = next;
    }
    return order;
  }

  function nextPow2(n) { var p = 1; while (p < n) p *= 2; return p; }

  /* entrants: array of names, already in seed order (index 0 = seed 1).
     Returns rounds[][] of matches: {a, b, seedA, seedB, bye}. */
  function buildBracket(entrants, opts) {
    opts = opts || {};
    var n = entrants.length;
    var size = nextPow2(Math.max(2, n));
    var order = seedOrder(size);

    /* Slot each seed; seeds beyond the entrant count are byes. */
    var slots = order.map(function (seed) {
      return seed <= n ? { name: entrants[seed - 1], seed: seed } : null;
    });

    var rounds = [], current = [];
    for (var i = 0; i < slots.length; i += 2) {
      var a = slots[i], b = slots[i + 1];
      current.push({
        a: a ? a.name : null, b: b ? b.name : null,
        seedA: a ? a.seed : null, seedB: b ? b.seed : null,
        bye: !a || !b
      });
    }
    rounds.push(current);

    while (current.length > 1) {
      var next = [];
      for (var j = 0; j < current.length; j += 2) {
        var m1 = current[j], m2 = current[j + 1];
        /* A match with a bye advances its single entrant automatically. */
        var adv1 = m1.bye ? (m1.a || m1.b) : null;
        var adv2 = m2 && m2.bye ? (m2.a || m2.b) : null;
        next.push({ a: adv1, b: adv2, seedA: null, seedB: null, bye: false });
      }
      rounds.push(next);
      current = next;
    }
    return { rounds: rounds, size: size, byes: size - n };
  }

  function roundName(idx, total) {
    var fromEnd = total - idx;
    if (fromEnd === 1) return 'Final';
    if (fromEnd === 2) return 'Semi-finals';
    if (fromEnd === 3) return 'Quarter-finals';
    return 'Round ' + (idx + 1);
  }

  /* SVG bracket tree. */
  function bracketSvg(rounds, opts) {
    opts = opts || {};
    var boxW = opts.boxW || 150, boxH = opts.boxH || 26, gapY = opts.gapY || 12, gapX = opts.gapX || 46;
    var first = rounds[0].length;
    var height = first * 2 * (boxH + gapY) + 40;
    var width = rounds.length * (boxW + gapX) + 20;
    var s = '';

    function slotY(round, idx) {
      var span = Math.pow(2, round) * (boxH + gapY) * 2;
      return 30 + span * idx + span / 2 - boxH / 2;
    }

    rounds.forEach(function (matches, r) {
      var x = 10 + r * (boxW + gapX);
      s += '<text x="' + x + '" y="18" font-family="Arial" font-size="11" font-weight="700" fill="#475569">' +
        roundName(r, rounds.length) + '</text>';
      matches.forEach(function (m, i) {
        var yTop = slotY(r, i * 2);
        var yBot = slotY(r, i * 2 + 1);
        [[m.a, m.seedA, yTop], [m.b, m.seedB, yBot]].forEach(function (p) {
          var label = p[0] || (r === 0 ? '— bye —' : '');
          var isBye = !p[0];
          s += '<rect x="' + x + '" y="' + p[2] + '" width="' + boxW + '" height="' + boxH +
            '" rx="4" fill="' + (isBye ? '#f8fafc' : '#ffffff') + '" stroke="#94a3b8" stroke-width="1"/>';
          if (p[1]) {
            s += '<text x="' + (x + 7) + '" y="' + (p[2] + boxH / 2 + 4) +
              '" font-family="Arial" font-size="9" font-weight="700" fill="#94a3b8">' + p[1] + '</text>';
          }
          s += '<text x="' + (x + (p[1] ? 22 : 8)) + '" y="' + (p[2] + boxH / 2 + 4) +
            '" font-family="Arial" font-size="11" fill="' + (isBye ? '#94a3b8' : '#0f172a') + '">' +
            escapeXml(String(label).slice(0, 20)) + '</text>';
        });
        /* connector into the next round */
        if (r < rounds.length - 1) {
          var midY = (yTop + yBot) / 2 + boxH / 2;
          var x2 = x + boxW;
          s += '<path d="M' + x2 + ' ' + (yTop + boxH / 2) + ' H' + (x2 + gapX / 2) +
            ' V' + (yBot + boxH / 2) + ' H' + x2 + '" fill="none" stroke="#cbd5e1" stroke-width="1.2"/>';
          s += '<line x1="' + (x2 + gapX / 2) + '" y1="' + midY + '" x2="' + (x2 + gapX) + '" y2="' + midY +
            '" stroke="#cbd5e1" stroke-width="1.2"/>';
        }
      });
    });

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height +
      '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }

  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ------------------------------------------------------- round-robin play */
  /* Circle method with home/away alternation so no team plays too many
     consecutive matches at home. */
  function roundRobin(teams, opts) {
    opts = opts || {};
    var list = teams.slice();
    var bye = null;
    if (list.length % 2 === 1) { bye = '__BYE__'; list.push(bye); }
    var n = list.length;
    var rounds = [];
    var fixed = list[0], rot = list.slice(1);

    for (var r = 0; r < n - 1; r++) {
      var matches = [];
      /* Alternate which side the fixed team takes, to balance home and away. */
      var pair = r % 2 === 0 ? [fixed, rot[rot.length - 1]] : [rot[rot.length - 1], fixed];
      matches.push({ home: pair[0], away: pair[1] });
      for (var i = 0; i < (n - 2) / 2; i++) {
        var a = rot[i], b = rot[rot.length - 2 - i];
        matches.push(i % 2 === 0 ? { home: a, away: b } : { home: b, away: a });
      }
      rounds.push(matches.filter(function (m) { return m.home !== bye && m.away !== bye; })
        .map(function (m) { return m; }));
      /* record who had the bye this round */
      if (bye) {
        var sat = matches.filter(function (m) { return m.home === bye || m.away === bye; })[0];
        if (sat) rounds[rounds.length - 1].byeTeam = sat.home === bye ? sat.away : sat.home;
      }
      rot.unshift(rot.pop());
    }

    if (opts.doubleRound) {
      var second = rounds.map(function (rd) {
        var flipped = rd.map(function (m) { return { home: m.away, away: m.home }; });
        flipped.byeTeam = rd.byeTeam;
        return flipped;
      });
      rounds = rounds.concat(second);
    }
    return rounds;
  }

  function homeAwayTally(rounds) {
    var t = {};
    rounds.forEach(function (rd) {
      rd.forEach(function (m) {
        t[m.home] = t[m.home] || { home: 0, away: 0 };
        t[m.away] = t[m.away] || { home: 0, away: 0 };
        t[m.home].home++; t[m.away].away++;
      });
    });
    return t;
  }

  /* ------------------------------------------------------- derangements */
  /* Single-cycle assignment: shuffle then chain, which guarantees nobody draws
     themselves and there are no reciprocal A→B→A pairs. */
  function singleCycle(names, rand) {
    var order = rand.shuffle(names);
    var map = {};
    for (var i = 0; i < order.length; i++) {
      map[order[i]] = order[(i + 1) % order.length];
    }
    return map;
  }

  /* Plain derangement (may contain reciprocal pairs) via rejection sampling. */
  function derangement(names, rand) {
    for (var attempt = 0; attempt < 200; attempt++) {
      var targets = rand.shuffle(names);
      var ok = true;
      for (var i = 0; i < names.length; i++) {
        if (names[i] === targets[i]) { ok = false; break; }
      }
      if (ok) {
        var map = {};
        names.forEach(function (n, i) { map[n] = targets[i]; });
        return map;
      }
    }
    return null;
  }

  function violates(map, exclusions) {
    for (var i = 0; i < exclusions.length; i++) {
      var a = exclusions[i][0], b = exclusions[i][1];
      if (map[a] === b || map[b] === a) return true;
    }
    return false;
  }

  /* Draw honouring exclusion pairs. Returns {map, attempts} or {error}. */
  function drawNames(names, opts) {
    opts = opts || {};
    var rand = rng(opts.seed || 'gentools');
    var exclusions = (opts.exclusions || []).map(function (p) { return [p[0], p[1]]; });
    var maxTries = opts.maxTries || 4000;

    for (var i = 0; i < maxTries; i++) {
      var map = opts.singleCycle === false ? derangement(names, rand) : singleCycle(names, rand);
      if (!map) continue;
      if (!violates(map, exclusions)) return { map: map, attempts: i + 1 };
    }
    return { error: 'No valid draw found after ' + maxTries + ' attempts.' };
  }

  /* Quick feasibility signal: a person excluded from everyone else is impossible. */
  function exclusionTrouble(names, exclusions) {
    var blocked = {};
    names.forEach(function (n) { blocked[n] = 0; });
    exclusions.forEach(function (p) {
      if (blocked[p[0]] !== undefined) blocked[p[0]]++;
      if (blocked[p[1]] !== undefined) blocked[p[1]]++;
    });
    return names.filter(function (n) { return blocked[n] >= names.length - 1; });
  }

  /* ----------------------------------------------------------- rotations */
  /* Latin-square rotation: person i takes task (i + period) mod tasks, so every
     person cycles through every task and nothing repeats within a period. */
  function rotation(people, tasks, periods, opts) {
    opts = opts || {};
    var rand = rng(opts.seed || 'gentools');
    var p = opts.shuffle === false ? people.slice() : rand.shuffle(people);
    var t = opts.shuffleTasks ? rand.shuffle(tasks) : tasks.slice();
    var out = [];
    for (var period = 0; period < periods; period++) {
      var row = [];
      for (var i = 0; i < t.length; i++) {
        /* When there are fewer people than tasks some slots are unassigned. */
        var personIdx = (i + period) % Math.max(p.length, 1);
        row.push({ task: t[i], person: p.length ? p[personIdx % p.length] : null });
      }
      out.push(row);
    }
    return { grid: out, people: p, tasks: t };
  }

  function rotationFairness(grid, people) {
    var counts = {};
    people.forEach(function (p) { counts[p] = 0; });
    grid.forEach(function (row) {
      row.forEach(function (cell) { if (cell.person) counts[cell.person]++; });
    });
    var vals = Object.keys(counts).map(function (k) { return counts[k]; });
    return { counts: counts, min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
  }

  /* --------------------------------------------------------------- dates */
  function dateSeries(startISO, count, everyDays) {
    var out = [];
    var d0 = startISO ? new Date(startISO + 'T12:00:00') : new Date();
    for (var i = 0; i < count; i++) {
      var d = new Date(d0.getTime() + i * everyDays * 86400000);
      out.push(d);
    }
    return out;
  }
  function fmtDate(d) {
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function fmtDateFull(d) {
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  window.GTSched = {
    rng: rng, seedOrder: seedOrder, nextPow2: nextPow2, buildBracket: buildBracket,
    bracketSvg: bracketSvg, roundName: roundName, roundRobin: roundRobin,
    homeAwayTally: homeAwayTally, singleCycle: singleCycle, derangement: derangement,
    drawNames: drawNames, exclusionTrouble: exclusionTrouble,
    rotation: rotation, rotationFairness: rotationFairness,
    dateSeries: dateSeries, fmtDate: fmtDate, fmtDateFull: fmtDateFull
  };
})();

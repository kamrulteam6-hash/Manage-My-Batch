/* Manage My Batch — shared reproducible fake-data engine.
   Used by the JSON / CSV / SQL / JSON-array generators.
   Deterministic: the same seed always produces the same dataset. */
(function () {
  'use strict';

  /* ---------------- seeded PRNG (mulberry32) ---------------- */
  function hashSeed(s) {
    var h = 1779033703 ^ String(s).length;
    for (var i = 0; i < String(s).length; i++) {
      h = Math.imul(h ^ String(s).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- word banks ---------------- */
  var FIRST = 'Ada,Alex,Amara,Ana,Anil,Ben,Bianca,Caleb,Chen,Clara,Diego,Elena,Emil,Farah,Finn,Grace,Hana,Hugo,Ines,Isaac,Jae,Jonas,Kai,Lars,Layla,Leo,Lena,Mateo,Maya,Nadia,Niko,Nora,Omar,Priya,Quinn,Rania,Ravi,Rosa,Sam,Sofia,Tariq,Tess,Uma,Viktor,Wren,Yara,Yusuf,Zara,Zane,Ivy'.split(',');
  var LAST = 'Adeyemi,Alvarez,Andersen,Baker,Bianchi,Chen,Costa,Dubois,Fischer,Garcia,Haddad,Hansen,Ibrahim,Ivanov,Jensen,Kaur,Kim,Kovac,Lambert,Lindqvist,Lopez,Marino,Mbeki,Meyer,Moreau,Nakamura,Nowak,Okafor,Oliveira,Patel,Petrov,Reyes,Rossi,Sato,Schmidt,Silva,Singh,Smith,Sorensen,Tanaka,Torres,Vargas,Wagner,Walsh,Weber,Yilmaz,Zhang,Novak,Murphy,Dubois'.split(',');
  var DOMAINS = 'example.com,example.org,test.dev,mail.example,acme.co,demo.io'.split(',');
  var COMPANY_A = 'Northern,Blue,Bright,Iron,Swift,Quantum,Cedar,Harbor,Vertex,Lumen,Atlas,Nova,Copper,Summit,Orbit,Delta'.split(',');
  var COMPANY_B = 'Labs,Systems,Works,Digital,Group,Analytics,Logistics,Studio,Partners,Dynamics,Networks,Foundry'.split(',');
  var WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur'.split(' ');
  var CITIES = 'Lisbon,Toronto,Osaka,Nairobi,Berlin,Austin,Lyon,Bogota,Oslo,Manila,Dublin,Seattle,Porto,Krakow,Valencia,Tallinn'.split(',');
  var COUNTRIES = 'Portugal,Canada,Japan,Kenya,Germany,United States,France,Colombia,Norway,Philippines,Ireland,Poland,Spain,Estonia'.split(',');
  var STREETS = 'Maple,Oak,Cedar,Harbor,River,Market,Union,Park,Hill,Bridge,Garden,Station'.split(',');
  var PRODUCTS = 'Wireless Mouse,Mechanical Keyboard,USB-C Hub,Monitor Stand,Desk Lamp,Laptop Sleeve,Webcam,Noise-Cancelling Headphones,Ergonomic Chair,Standing Desk,Cable Organizer,Docking Station'.split(',');
  var STATUSES = 'active,pending,archived,suspended'.split(',');
  var ROLES = 'admin,editor,viewer,owner'.split(',');
  var TLD_SAFE = 'example';

  /* ---------------- field type catalogue ---------------- */
  var TYPES = [
    { id: 'id',        label: 'Sequential ID',   group: 'Identifiers', sql: 'INTEGER', ts: 'number' },
    { id: 'uuid',      label: 'UUID v4',         group: 'Identifiers', sql: 'CHAR(36)', ts: 'string' },
    { id: 'uuid7',     label: 'UUID v7',         group: 'Identifiers', sql: 'CHAR(36)', ts: 'string' },
    { id: 'objectid',  label: 'MongoDB ObjectId',group: 'Identifiers', sql: 'CHAR(24)', ts: 'string' },
    { id: 'nanoid',    label: 'NanoID',          group: 'Identifiers', sql: 'VARCHAR(21)', ts: 'string' },
    { id: 'slug',      label: 'Slug',            group: 'Identifiers', sql: 'VARCHAR(80)', ts: 'string' },

    { id: 'firstName', label: 'First name',      group: 'People', sql: 'VARCHAR(50)', ts: 'string' },
    { id: 'lastName',  label: 'Last name',       group: 'People', sql: 'VARCHAR(50)', ts: 'string' },
    { id: 'fullName',  label: 'Full name',       group: 'People', sql: 'VARCHAR(100)', ts: 'string' },
    { id: 'email',     label: 'Email',           group: 'People', sql: 'VARCHAR(120)', ts: 'string' },
    { id: 'username',  label: 'Username',        group: 'People', sql: 'VARCHAR(40)', ts: 'string' },
    { id: 'phone',     label: 'Phone',           group: 'People', sql: 'VARCHAR(24)', ts: 'string' },
    { id: 'avatar',    label: 'Avatar URL',      group: 'People', sql: 'VARCHAR(200)', ts: 'string' },

    { id: 'company',   label: 'Company',         group: 'Business', sql: 'VARCHAR(80)', ts: 'string' },
    { id: 'product',   label: 'Product name',    group: 'Business', sql: 'VARCHAR(80)', ts: 'string' },
    { id: 'price',     label: 'Price',           group: 'Business', sql: 'DECIMAL(10,2)', ts: 'number' },
    { id: 'currency',  label: 'Currency code',   group: 'Business', sql: 'CHAR(3)', ts: 'string' },
    { id: 'sku',       label: 'SKU',             group: 'Business', sql: 'VARCHAR(20)', ts: 'string' },

    { id: 'city',      label: 'City',            group: 'Location', sql: 'VARCHAR(60)', ts: 'string' },
    { id: 'country',   label: 'Country',         group: 'Location', sql: 'VARCHAR(60)', ts: 'string' },
    { id: 'address',   label: 'Street address',  group: 'Location', sql: 'VARCHAR(120)', ts: 'string' },
    { id: 'zip',       label: 'Postal code',     group: 'Location', sql: 'VARCHAR(12)', ts: 'string' },
    { id: 'lat',       label: 'Latitude',        group: 'Location', sql: 'DECIMAL(9,6)', ts: 'number' },
    { id: 'lng',       label: 'Longitude',       group: 'Location', sql: 'DECIMAL(9,6)', ts: 'number' },

    { id: 'int',       label: 'Integer',         group: 'Numbers', sql: 'INTEGER', ts: 'number', opts: ['min', 'max'] },
    { id: 'float',     label: 'Decimal',         group: 'Numbers', sql: 'DECIMAL(10,2)', ts: 'number', opts: ['min', 'max'] },
    { id: 'bool',      label: 'Boolean',         group: 'Numbers', sql: 'BOOLEAN', ts: 'boolean' },

    { id: 'date',      label: 'Date',            group: 'Time', sql: 'DATE', ts: 'string' },
    { id: 'datetime',  label: 'Date + time (ISO)', group: 'Time', sql: 'TIMESTAMP', ts: 'string' },
    { id: 'timestamp', label: 'Unix timestamp',  group: 'Time', sql: 'BIGINT', ts: 'number' },

    { id: 'word',      label: 'Single word',     group: 'Text', sql: 'VARCHAR(30)', ts: 'string' },
    { id: 'sentence',  label: 'Sentence',        group: 'Text', sql: 'VARCHAR(255)', ts: 'string' },
    { id: 'paragraph', label: 'Paragraph',       group: 'Text', sql: 'TEXT', ts: 'string' },
    { id: 'url',       label: 'URL',             group: 'Text', sql: 'VARCHAR(200)', ts: 'string' },
    { id: 'ipv4',      label: 'IPv4 address',    group: 'Text', sql: 'VARCHAR(15)', ts: 'string' },
    { id: 'hexcolor',  label: 'Hex colour',      group: 'Text', sql: 'CHAR(7)', ts: 'string' },

    { id: 'status',    label: 'Status enum',     group: 'Enums', sql: 'VARCHAR(20)', ts: 'string' },
    { id: 'role',      label: 'Role enum',       group: 'Enums', sql: 'VARCHAR(20)', ts: 'string' },
    { id: 'enum',      label: 'Custom list',     group: 'Enums', sql: 'VARCHAR(40)', ts: 'string', opts: ['values'] },
    { id: 'null',      label: 'Always null',     group: 'Enums', sql: 'VARCHAR(20)', ts: 'null' }
  ];

  /* Fixed reference date. Date-bearing types are offset backwards from this
     constant rather than from Date.now(), so a given seed reproduces the exact
     same dataset today, tomorrow and in CI. */
  var REF_DATE = Date.UTC(2026, 7, 1, 12, 0, 0);

  /* ---------------- value generation ---------------- */
  function makeGen(seed, refDate) {
    var rnd = mulberry32(hashSeed(seed));
    var counters = {};
    var REF = refDate == null ? REF_DATE : refDate;

    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    function num(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
    function hex(n) { var s = ''; for (var i = 0; i < n; i++) s += '0123456789abcdef'[num(0, 15)]; return s; }
    function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

    function value(type, i, opt) {
      opt = opt || {};
      switch (type) {
        case 'id': counters.id = (counters.id || 0) + 1; return (opt.start ? +opt.start - 1 : 0) + counters.id;
        case 'uuid':
          return hex(8) + '-' + hex(4) + '-4' + hex(3) + '-' + '89ab'[num(0, 3)] + hex(3) + '-' + hex(12);
        case 'uuid7': {
          var t = (REF - num(0, 90 * 86400000)).toString(16).padStart(12, '0');
          return t.slice(0, 8) + '-' + t.slice(8, 12) + '-7' + hex(3) + '-' + '89ab'[num(0, 3)] + hex(3) + '-' + hex(12);
        }
        case 'objectid': return hex(24);
        case 'nanoid': {
          var A = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
          var s = ''; for (var k = 0; k < 21; k++) s += A[num(0, A.length - 1)];
          return s;
        }
        case 'slug': return slugify(pick(COMPANY_A) + ' ' + pick(COMPANY_B) + ' ' + num(1, 99));

        case 'firstName': return pick(FIRST);
        case 'lastName': return pick(LAST);
        case 'fullName': return pick(FIRST) + ' ' + pick(LAST);
        case 'email': return (pick(FIRST) + '.' + pick(LAST)).toLowerCase() + num(1, 99) + '@' + pick(DOMAINS);
        case 'username': return pick(FIRST).toLowerCase() + '_' + pick(LAST).toLowerCase().slice(0, 4) + num(10, 99);
        case 'phone': return '+1-' + num(200, 989) + '-555-' + String(num(0, 9999)).padStart(4, '0');
        case 'avatar': return 'https://' + TLD_SAFE + '.com/avatars/' + hex(8) + '.png';

        case 'company': return pick(COMPANY_A) + ' ' + pick(COMPANY_B);
        case 'product': return pick(PRODUCTS);
        case 'price': return +(rnd() * 480 + 4.99).toFixed(2);
        case 'currency': return pick(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']);
        case 'sku': return 'SKU-' + hex(4).toUpperCase() + '-' + num(100, 999);

        case 'city': return pick(CITIES);
        case 'country': return pick(COUNTRIES);
        case 'address': return num(1, 9999) + ' ' + pick(STREETS) + ' ' + pick(['St', 'Ave', 'Rd', 'Ln']);
        case 'zip': return String(num(10000, 99999));
        case 'lat': return +(rnd() * 180 - 90).toFixed(6);
        case 'lng': return +(rnd() * 360 - 180).toFixed(6);

        case 'int': return num(opt.min == null ? 1 : +opt.min, opt.max == null ? 1000 : +opt.max);
        case 'float': {
          var lo = opt.min == null ? 0 : +opt.min, hi = opt.max == null ? 100 : +opt.max;
          return +(rnd() * (hi - lo) + lo).toFixed(2);
        }
        case 'bool': return rnd() > 0.5;

        case 'date': return new Date(REF - num(0, 730) * 86400000).toISOString().slice(0, 10);
        case 'datetime': return new Date(REF - num(0, 730) * 86400000 - num(0, 86399) * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
        case 'timestamp': return Math.floor((REF - num(0, 730) * 86400000) / 1000);

        case 'word': return pick(WORDS);
        case 'sentence': {
          var n = num(6, 14), out = [];
          for (var w = 0; w < n; w++) out.push(pick(WORDS));
          return out.join(' ').replace(/^./, function (c) { return c.toUpperCase(); }) + '.';
        }
        case 'paragraph': {
          var sents = [], sn = num(3, 5);
          for (var s2 = 0; s2 < sn; s2++) sents.push(value('sentence', i));
          return sents.join(' ');
        }
        case 'url': return 'https://' + pick(DOMAINS) + '/' + slugify(pick(WORDS) + '-' + pick(WORDS));
        case 'ipv4': return num(1, 223) + '.' + num(0, 255) + '.' + num(0, 255) + '.' + num(1, 254);
        case 'hexcolor': return '#' + hex(6);

        case 'status': return pick(STATUSES);
        case 'role': return pick(ROLES);
        case 'enum': {
          var vals = String(opt.values || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
          return vals.length ? pick(vals) : null;
        }
        case 'null': return null;
      }
      return null;
    }

    return { value: value, rnd: rnd, num: num, pick: pick, hex: hex };
  }

  /* ---------------- rows ---------------- */
  function rows(fields, count, seed, refDate) {
    var g = makeGen(seed || 'gentools', refDate);
    var out = [];
    for (var i = 0; i < count; i++) {
      var row = {};
      fields.forEach(function (f) {
        var v = g.value(f.type, i, f);
        if (f.nullable && g.rnd() < 0.15) v = null;
        row[f.name || f.type] = v;
      });
      out.push(row);
    }
    return out;
  }

  /* ---------------- field-editor UI (shared) ---------------- */
  function typeOptions(sel) {
    var groups = {};
    TYPES.forEach(function (t) { (groups[t.group] = groups[t.group] || []).push(t); });
    return Object.keys(groups).map(function (g) {
      return '<optgroup label="' + g + '">' + groups[g].map(function (t) {
        return '<option value="' + t.id + '"' + (sel === t.id ? ' selected' : '') + '>' + t.label + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  function typeMeta(id) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i];
    return TYPES[0];
  }

  /* Renders the repeatable field rows into `host` and keeps `fields` in sync. */
  function mountFields(host, fields, onChange, opts) {
    opts = opts || {};
    function render() {
      host.innerHTML = fields.map(function (f, i) {
        var meta = typeMeta(f.type);
        var extra = '';
        if (meta.opts && meta.opts.indexOf('min') > -1) {
          extra = '<div class="row" style="margin-top:8px">' +
            '<input type="number" data-i="' + i + '" data-f="min" value="' + (f.min == null ? '' : f.min) + '" placeholder="min">' +
            '<input type="number" data-i="' + i + '" data-f="max" value="' + (f.max == null ? '' : f.max) + '" placeholder="max"></div>';
        }
        if (meta.opts && meta.opts.indexOf('values') > -1) {
          extra = '<input type="text" data-i="' + i + '" data-f="values" value="' + GT.escAttr(f.values || '') +
            '" placeholder="comma,separated,values" style="margin-top:8px">';
        }
        return '<div class="rep"><div class="rep-head"><span class="n">Field ' + (i + 1) + '</span>' +
          '<button type="button" class="icon-btn" data-del="' + i + '" aria-label="Remove field">' + GTI.trash + '</button></div>' +
          '<div class="row">' +
          '<input type="text" data-i="' + i + '" data-f="name" value="' + GT.escAttr(f.name) + '" placeholder="field_name">' +
          '<select data-i="' + i + '" data-f="type">' + typeOptions(f.type) + '</select></div>' + extra +
          (opts.nullable === false ? '' :
            '<label class="check" style="margin-top:8px;padding:7px 10px"><input type="checkbox" data-i="' + i + '" data-f="nullable"' +
            (f.nullable ? ' checked' : '') + '><span><span class="t" style="font-size:13px">Sometimes null</span></span></label>') +
          '</div>';
      }).join('');
    }
    host.addEventListener('input', function (e) {
      var i = e.target.getAttribute('data-i'); if (i == null) return;
      var f = e.target.getAttribute('data-f');
      fields[i][f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      onChange();
    });
    host.addEventListener('change', function (e) {
      var i = e.target.getAttribute('data-i'); if (i == null) return;
      if (e.target.getAttribute('data-f') === 'type') { fields[i].type = e.target.value; render(); }
      onChange();
    });
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]'); if (!b) return;
      fields.splice(+b.getAttribute('data-del'), 1); render(); onChange();
    });
    render();
    return { render: render };
  }

  window.GTFake = {
    TYPES: TYPES, rows: rows, makeGen: makeGen, typeMeta: typeMeta,
    typeOptions: typeOptions, mountFields: mountFields, REF_DATE: REF_DATE
  };
})();

/* Manage My Batch — shared HTTP request model + form.
   Powers the cURL, Fetch and Axios generators so all three stay in sync. */
(function () {
  'use strict';

  var METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  var COMMON_HEADERS = ['Content-Type', 'Accept', 'Authorization', 'User-Agent', 'X-Request-Id',
    'Cache-Control', 'X-API-Key', 'Accept-Language', 'Origin', 'Referer', 'Cookie'];

  /* Renders the shared request form into `host` and returns a model accessor. */
  function mount(host, onChange) {
    var model = {
      method: 'POST',
      url: 'https://api.example.com/v1/users',
      headers: [{ k: 'Content-Type', v: 'application/json' }, { k: 'Accept', v: 'application/json' }],
      params: [],
      auth: 'bearer',
      token: 'YOUR_API_TOKEN',
      user: '', pass: '',
      bodyType: 'json',
      body: '{\n  "name": "Ada Lovelace",\n  "email": "ada@example.com",\n  "role": "admin"\n}',
      form: [{ k: 'name', v: 'Ada Lovelace' }, { k: 'email', v: 'ada@example.com' }],
      timeout: '',
      credentials: false
    };

    host.innerHTML =
      '<div class="field"><label for="rqMethod">Method &amp; URL</label>' +
      '<div class="row" style="grid-template-columns:130px minmax(0,1fr)">' +
      '<select id="rqMethod">' + METHODS.map(function (m) {
        return '<option' + (m === model.method ? ' selected' : '') + '>' + m + '</option>';
      }).join('') + '</select>' +
      '<input type="text" id="rqUrl" value="' + GT.escAttr(model.url) + '" placeholder="https://api.example.com/resource"></div>' +
      '<div class="hint" id="rqUrlHint"></div></div>' +

      '<div class="field"><div class="label" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span>Query parameters</span><button type="button" class="btn btn-soft btn-sm" id="rqAddParam">Add</button></div>' +
      '<div id="rqParams"></div></div>' +

      '<div class="divider"></div>' +

      '<div class="field"><label for="rqAuth">Authentication</label>' +
      '<select id="rqAuth">' +
      '<option value="none">None</option>' +
      '<option value="bearer" selected>Bearer token</option>' +
      '<option value="basic">Basic auth</option>' +
      '<option value="apikey">API key header</option>' +
      '</select>' +
      '<div id="rqAuthFields" style="margin-top:10px"></div></div>' +

      '<div class="field"><div class="label" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span>Headers</span><button type="button" class="btn btn-soft btn-sm" id="rqAddHeader">Add</button></div>' +
      '<div id="rqHeaders"></div></div>' +

      '<div class="divider"></div>' +

      '<div class="field" id="rqBodyWrap"><label for="rqBodyType">Request body</label>' +
      '<select id="rqBodyType">' +
      '<option value="none">No body</option>' +
      '<option value="json" selected>JSON</option>' +
      '<option value="form">Form URL-encoded</option>' +
      '<option value="multipart">Multipart form-data</option>' +
      '<option value="text">Raw text</option>' +
      '</select>' +
      '<div id="rqBodyFields" style="margin-top:10px"></div></div>';

    var $ = GT.$, $$ = GT.$$;

    function kvRows(hostSel, arr, ph1, ph2, list) {
      $(hostSel).innerHTML = arr.map(function (r, i) {
        return '<div class="row" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) auto;margin-bottom:8px">' +
          '<input type="text" data-a="' + hostSel + '" data-i="' + i + '" data-f="k" value="' + GT.escAttr(r.k) +
          '" placeholder="' + ph1 + '"' + (list ? ' list="rqHeaderNames"' : '') + '>' +
          '<input type="text" data-a="' + hostSel + '" data-i="' + i + '" data-f="v" value="' + GT.escAttr(r.v) + '" placeholder="' + ph2 + '">' +
          '<button type="button" class="icon-btn" data-a="' + hostSel + '" data-del="' + i + '" aria-label="Remove">' + GTI.trash + '</button></div>';
      }).join('') + (list ? '<datalist id="rqHeaderNames">' + COMMON_HEADERS.map(function (h) {
        return '<option value="' + h + '">';
      }).join('') + '</datalist>' : '');
    }

    function arrFor(sel) {
      return sel === '#rqHeaders' ? model.headers : sel === '#rqParams' ? model.params : model.form;
    }

    host.addEventListener('input', function (e) {
      var a = e.target.getAttribute('data-a');
      if (a) { arrFor(a)[+e.target.getAttribute('data-i')][e.target.getAttribute('data-f')] = e.target.value; onChange(); return; }
      var id = e.target.id;
      if (id === 'rqUrl') model.url = e.target.value;
      if (id === 'rqToken') model.token = e.target.value;
      if (id === 'rqUser') model.user = e.target.value;
      if (id === 'rqPass') model.pass = e.target.value;
      if (id === 'rqApiKeyName' || id === 'rqApiKeyValue') { model.apiKeyName = $('#rqApiKeyName').value; model.token = $('#rqApiKeyValue').value; }
      if (id === 'rqBody') model.body = e.target.value;
      onChange();
    });

    host.addEventListener('change', function (e) {
      var id = e.target.id;
      if (id === 'rqMethod') { model.method = e.target.value; renderBody(); }
      if (id === 'rqAuth') { model.auth = e.target.value; renderAuth(); }
      if (id === 'rqBodyType') { model.bodyType = e.target.value; renderBody(); }
      onChange();
    });

    host.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.id === 'rqAddHeader') { model.headers.push({ k: '', v: '' }); kvRows('#rqHeaders', model.headers, 'Header-Name', 'value', true); onChange(); return; }
      if (b.id === 'rqAddParam') { model.params.push({ k: '', v: '' }); kvRows('#rqParams', model.params, 'param', 'value'); onChange(); return; }
      if (b.id === 'rqAddForm') { model.form.push({ k: '', v: '' }); renderBody(); onChange(); return; }
      var d = b.getAttribute('data-del');
      if (d != null) {
        var sel = b.getAttribute('data-a');
        arrFor(sel).splice(+d, 1);
        if (sel === '#rqHeaders') kvRows('#rqHeaders', model.headers, 'Header-Name', 'value', true);
        else if (sel === '#rqParams') kvRows('#rqParams', model.params, 'param', 'value');
        else renderBody();
        onChange();
      }
    });

    function renderAuth() {
      var h = '';
      if (model.auth === 'bearer') {
        h = '<input type="text" id="rqToken" value="' + GT.escAttr(model.token) + '" placeholder="YOUR_API_TOKEN">' +
          '<div class="hint">Sent as <code>Authorization: Bearer …</code>. Keep real tokens out of committed code — read them from an environment variable.</div>';
      } else if (model.auth === 'basic') {
        h = '<div class="row"><input type="text" id="rqUser" value="' + GT.escAttr(model.user) + '" placeholder="username">' +
          '<input type="text" id="rqPass" value="' + GT.escAttr(model.pass) + '" placeholder="password"></div>' +
          '<div class="hint">Base64-encoded, not encrypted. Only safe over HTTPS.</div>';
      } else if (model.auth === 'apikey') {
        h = '<div class="row"><input type="text" id="rqApiKeyName" value="' + GT.escAttr(model.apiKeyName || 'X-API-Key') + '" placeholder="X-API-Key">' +
          '<input type="text" id="rqApiKeyValue" value="' + GT.escAttr(model.token) + '" placeholder="YOUR_API_KEY"></div>';
      }
      GT.$('#rqAuthFields').innerHTML = h;
    }

    function renderBody() {
      var noBody = model.method === 'GET' || model.method === 'HEAD';
      GT.$('#rqBodyWrap').hidden = false;
      var h = '';
      if (noBody) {
        h = '<div class="note note-warn" style="margin-top:0">' + GTI.warn +
          '<span>' + model.method + ' requests should not carry a body. Many servers, proxies and CDNs drop it silently.</span></div>';
      } else if (model.bodyType === 'json' || model.bodyType === 'text') {
        h = '<textarea id="rqBody" style="min-height:130px">' + GT.esc(model.body) + '</textarea>';
        if (model.bodyType === 'json') h += '<div class="hint" id="rqJsonStatus"></div>';
      } else if (model.bodyType === 'form' || model.bodyType === 'multipart') {
        h = '<div id="rqForm"></div><button type="button" class="btn btn-soft btn-sm" id="rqAddForm">Add field</button>';
      }
      GT.$('#rqBodyFields').innerHTML = h;
      if (model.bodyType === 'form' || model.bodyType === 'multipart') kvRows('#rqForm', model.form, 'field', 'value');
    }

    kvRows('#rqHeaders', model.headers, 'Header-Name', 'value', true);
    kvRows('#rqParams', model.params, 'param', 'value');
    renderAuth(); renderBody();

    return {
      model: model,
      /* URL with query params merged in */
      fullUrl: function () {
        var u = model.url.trim();
        var ps = model.params.filter(function (p) { return p.k.trim(); });
        if (!ps.length) return u;
        var qs = ps.map(function (p) { return encodeURIComponent(p.k.trim()) + '=' + encodeURIComponent(p.v); }).join('&');
        return u + (u.indexOf('?') > -1 ? '&' : '?') + qs;
      },
      /* effective headers including auth + content type */
      allHeaders: function () {
        var h = model.headers.filter(function (x) { return x.k.trim(); }).map(function (x) { return { k: x.k.trim(), v: x.v }; });
        function has(n) { return h.some(function (x) { return x.k.toLowerCase() === n; }); }
        if (model.auth === 'bearer' && model.token) h.push({ k: 'Authorization', v: 'Bearer ' + model.token });
        if (model.auth === 'basic') h.push({ k: 'Authorization', v: 'Basic <base64 of user:pass>' });
        if (model.auth === 'apikey' && model.token) h.push({ k: model.apiKeyName || 'X-API-Key', v: model.token });
        if (!has('content-type') && model.bodyType === 'json' && !this.noBody()) h.push({ k: 'Content-Type', v: 'application/json' });
        if (!has('content-type') && model.bodyType === 'form' && !this.noBody()) h.push({ k: 'Content-Type', v: 'application/x-www-form-urlencoded' });
        return h;
      },
      noBody: function () { return model.method === 'GET' || model.method === 'HEAD' || model.bodyType === 'none'; },
      formEncoded: function () {
        return model.form.filter(function (f) { return f.k.trim(); })
          .map(function (f) { return encodeURIComponent(f.k.trim()) + '=' + encodeURIComponent(f.v); }).join('&');
      },
      jsonValid: function () {
        if (model.bodyType !== 'json') return { ok: true };
        try { JSON.parse(model.body); return { ok: true }; }
        catch (e) { return { ok: false, msg: e.message }; }
      },
      renderBody: renderBody
    };
  }

  window.GTReq = { mount: mount, METHODS: METHODS };
})();

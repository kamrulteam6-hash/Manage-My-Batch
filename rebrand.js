/* One-off rebrand + meta upgrade.
   GenTools → Manage My Batch, gentools.dev → managemybatch.com,
   and injects Open Graph / Twitter / robots meta into every page.
   Run: node rebrand.js
*/
const fs = require('fs');
const path = require('path');

const BRAND = 'Manage My Batch';
const DOMAIN = 'managemybatch.com';
const ORIGIN = 'https://' + DOMAIN;

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git' || f === '.claude') continue;
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(html|js|md|txt|xml)$/.test(f)) out.push(p);
  }
  return out;
}

const files = walk('.').filter(f => !/rebrand\.js$/.test(f));
let changed = 0;

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  s = s.replace(/gentools\.dev/g, DOMAIN);
  s = s.replace(/GenTools\.dev/g, BRAND);
  s = s.replace(/GenTools/g, BRAND);

  if (s !== before) { fs.writeFileSync(file, s, 'utf8'); changed++; }
}
console.log(`rebranded ${changed} files`);

/* ---------- inject social + robots meta into every HTML page ---------- */
const htmls = walk('.').filter(f => f.endsWith('.html'));
let metaAdded = 0;

for (const file of htmls) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('property="og:title"')) continue;

  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || BRAND;
  const desc = (s.match(/<meta name="description" content="([\s\S]*?)">/) || [])[1] || '';
  const canon = (s.match(/<link rel="canonical" href="([^"]+)">/) || [])[1] || ORIGIN + '/';

  const shortTitle = title.split('|')[0].trim();

  const meta = [
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">',
    '<meta name="author" content="' + BRAND + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="' + BRAND + '">',
    '<meta property="og:locale" content="en_GB">',
    '<meta property="og:title" content="' + shortTitle.replace(/"/g, '&quot;') + '">',
    '<meta property="og:description" content="' + desc.replace(/"/g, '&quot;') + '">',
    '<meta property="og:url" content="' + canon + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + shortTitle.replace(/"/g, '&quot;') + '">',
    '<meta name="twitter:description" content="' + desc.replace(/"/g, '&quot;') + '">',
    '<meta name="theme-color" content="#2563eb">'
  ].join('\n');

  s = s.replace(/(<link rel="canonical"[^>]+>)/, '$1\n' + meta);
  fs.writeFileSync(file, s, 'utf8');
  metaAdded++;
}
console.log(`added social/robots meta to ${metaAdded} pages`);

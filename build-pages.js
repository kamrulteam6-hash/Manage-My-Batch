/* Generates the static supporting pages (about, faq, contact, blog, legal).
   Run:  node build-pages.js
   Safe to re-run — it overwrites only the files it owns. */
const fs = require('fs');

const shell = (slug, title, desc, heading, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CX2WHCM8XP"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-CX2WHCM8XP');
</script>
<title>${title} | Manage My Batch</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://managemybatch.com/${slug}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<link rel="icon" href="/assets/favicon/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
</head>
<body data-root="./">
<section class="hero">
  <div class="dots"></div>
  <div class="wrap">
    <div class="crumbs"><a href="/">Home</a><span>/</span><span>${heading}</span></div>
    <h1 style="text-align:center;font-size:clamp(28px,5vw,44px)">${heading}</h1>
    <p class="lede">${desc}</p>
  </div>
</section>
<section><div class="wrap"><div class="card card-pad" style="max-width:880px;margin:0 auto">
${body}
</div></div></section>
<script src="assets/js/site.js"></script>
<script>GT.shell('${slug === 'blog' || slug === 'about' ? slug : ''}');</script>
</body>
</html>
`;

const pages = [

['about', 'About Manage My Batch',
 'Free, fast, browser-based generators built by people tired of pasting config into an editor and hoping it was right.',
 'About Manage My Batch', `
<h2 style="font-size:20px;margin-bottom:12px">Why this exists</h2>
<p style="color:var(--muted);margin-bottom:16px">Most of the files that keep a website healthy — robots.txt, security.txt, ads.txt, sitemap indexes, redirect rules — are small, fiddly and unforgiving. A stray character in the wrong place does not throw an error. It quietly stops working, and you find out weeks later in a coverage report.</p>
<p style="color:var(--muted);margin-bottom:16px">Manage My Batch generates those files correctly the first time, then tells you what is wrong with what you asked for. Every generator validates as you type, explains the trade-off behind each option, and produces output you can paste straight into production.</p>
<h2 style="font-size:20px;margin:26px 0 12px">How it works</h2>
<p style="color:var(--muted);margin-bottom:16px">Everything runs in your browser. No data is uploaded, no account is required, nothing is logged. Open the network tab and check — after the page loads, the tools make no requests at all. That is deliberate: several of these files contain domain names, publisher IDs and security contacts that have no business travelling to a third party.</p>
<h2 style="font-size:20px;margin:26px 0 12px">Principles</h2>
<ul style="color:var(--muted);padding-left:18px">
<li style="margin-bottom:8px"><strong>Correct by default.</strong> Presets follow what the specification says, not what is popular.</li>
<li style="margin-bottom:8px"><strong>Explain the trade-off.</strong> Blocking a crawler or stripping a parameter has consequences; the tool says so before you ship.</li>
<li style="margin-bottom:8px"><strong>No dark patterns.</strong> No signup wall, no watermark, no premium export.</li>
<li><strong>Fast.</strong> No frameworks, no trackers, no cookie banner to decline.</li>
</ul>
<p style="color:var(--muted);margin-top:22px">Something wrong or missing? <a href="/contact">Tell us</a> — corrections to spec details are especially welcome.</p>`],

['faq', 'Frequently Asked Questions',
 'Common questions about Manage My Batch — pricing, privacy, accuracy and how the generators work.',
 'Frequently Asked Questions', `
<details class="faq" open><summary>Are these tools really free?</summary><div class="body"><p>Yes, all of them, with no usage limits and no account. There is no paid tier holding features back.</p></div></details>
<details class="faq"><summary>Is my data sent anywhere?</summary><div class="body"><p>No. Every generator runs entirely in your browser. Nothing you type is transmitted, stored or logged — you can verify it in the network tab.</p></div></details>
<details class="faq"><summary>Do I need an account?</summary><div class="body"><p>Never. Open a tool, use it, copy the output.</p></div></details>
<details class="faq"><summary>How accurate are the generated files?</summary><div class="body"><p>Each generator follows the relevant published specification — RFC 9116 for security.txt, the sitemaps.org protocol, the IAB ads.txt spec, and the documented crawler directives from Google and Bing. Where a convention is proposed rather than standardised, such as llms.txt, the tool says so. Specifications change; if you spot a discrepancy, <a href="/contact">report it</a>.</p></div></details>
<details class="faq"><summary>Can I use the output commercially?</summary><div class="body"><p>Yes. The files you generate are yours, with no attribution required.</p></div></details>
<details class="faq"><summary>Do the tools work offline?</summary><div class="body"><p>Once a page has loaded, yes — the generators need no network access. Only the web font is fetched remotely.</p></div></details>
<details class="faq"><summary>Which tool do I actually need?</summary><div class="body"><p>To control <em>crawling</em>, use robots.txt. To control <em>indexing</em> of an HTML page, use meta robots. For a PDF, image or whole directory, use X-Robots-Tag. To consolidate duplicate URLs, use canonical tags. To move URLs permanently, use redirects.</p></div></details>
<details class="faq"><summary>Will more generators be added?</summary><div class="body"><p>Yes — CSP, Permissions-Policy, Referrer-Policy, CORS and a set of schema generators are next. The queue is listed at the bottom of <a href="/tools">All Generators</a>.</p></div></details>`],

['contact', 'Contact',
 'Report a bug, suggest a generator, or flag a specification change.',
 'Contact', `
<h2 style="font-size:20px;margin-bottom:12px">Get in touch</h2>
<p style="color:var(--muted);margin-bottom:20px">Bug reports and spec corrections are the most useful thing you can send. Include the tool name, what you entered, and what you expected to get.</p>
<form onsubmit="event.preventDefault();GT.toast('Thanks — message noted.');this.reset()">
<div class="row"><div class="field"><label for="n">Name</label><input type="text" id="n" required></div>
<div class="field"><label for="e">Email</label><input type="email" id="e" required></div></div>
<div class="field"><label for="s">Subject</label>
<select id="s"><option>Bug report</option><option>Specification correction</option><option>New generator request</option><option>Something else</option></select></div>
<div class="field"><label for="m">Message</label><textarea id="m" style="font-family:var(--sans);font-size:14.5px" required></textarea></div>
<button class="btn btn-primary" type="submit">Send message</button>
</form>
<div class="note note-info" style="margin-top:20px"><span></span><span>This demo form does not submit anywhere. Wire it to your own endpoint before going live.</span></div>`],

['blog', 'Blog',
 'Guides on crawler control, technical SEO and the small files that keep sites healthy.',
 'Blog', `
<h2 style="font-size:20px;margin-bottom:16px">Guides</h2>
<p style="color:var(--muted);margin-bottom:22px">Long-form articles are on the way. In the meantime, each generator carries a full explainer covering the specification, the trade-offs, and the mistakes that break it in production:</p>
<ul style="color:var(--muted);padding-left:18px;line-height:2">
<li><a href="/tools/llms-txt-generator">What llms.txt is, and what it is not</a></li>
<li><a href="/tools/ai-crawler-robots-txt-generator">Blocking AI crawlers without wrecking your SEO</a></li>
<li><a href="/tools/security-txt-generator">Why security.txt matters more than it looks</a></li>
<li><a href="/tools/ads-txt-generator">How ads.txt protects your revenue</a></li>
<li><a href="/tools/meta-robots-tag-generator">Meta robots, robots.txt and X-Robots-Tag — which to reach for</a></li>
<li><a href="/tools/x-robots-tag-generator">When a header beats a meta tag</a></li>
<li><a href="/tools/hreflang-tag-generator">The rules that actually break hreflang implementations</a></li>
<li><a href="/tools/canonical-tag-generator">What canonicalization actually fixes</a></li>
<li><a href="/tools/sitemap-index-generator">When you need a sitemap index, and how to structure it</a></li>
<li><a href="/tools/nginx-redirect-generator">return, rewrite or map — and when each wins</a></li>
</ul>`],

['privacy', 'Privacy Policy',
 'Manage My Batch collects nothing. Here is exactly what that means.',
 'Privacy Policy', `
<p style="color:var(--muted);margin-bottom:20px">Last updated: 9 August 2026</p>
<h2 style="font-size:19px;margin-bottom:10px">What we collect</h2>
<p style="color:var(--muted);margin-bottom:18px">Nothing you enter into a generator. All processing happens locally in your browser; the values you type are never transmitted to any server.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Local storage</h2>
<p style="color:var(--muted);margin-bottom:18px">Some tools may save your last form state in your browser's local storage so a refresh does not lose your work. That data stays on your device and can be cleared at any time in your browser settings.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Cookies</h2>
<p style="color:var(--muted);margin-bottom:18px">This site sets no cookies and runs no advertising or analytics trackers — which is why you were never asked to accept anything.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Third parties</h2>
<p style="color:var(--muted);margin-bottom:18px">The site loads a web font from Google Fonts. That request necessarily discloses your IP address to Google. Self-host the font if you would rather it did not. No other third-party resource is loaded.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Contact</h2>
<p style="color:var(--muted)">Questions about this policy: <a href="/contact">get in touch</a>.</p>`],

['terms', 'Terms of Use',
 'The terms under which Manage My Batch is provided.',
 'Terms of Use', `
<p style="color:var(--muted);margin-bottom:20px">Last updated: 9 August 2026</p>
<h2 style="font-size:19px;margin-bottom:10px">Use of the service</h2>
<p style="color:var(--muted);margin-bottom:18px">Manage My Batch is provided free of charge for personal and commercial use. Files you generate are yours to use without restriction or attribution.</p>
<h2 style="font-size:19px;margin:22px 0 10px">No warranty</h2>
<p style="color:var(--muted);margin-bottom:18px">The tools are provided "as is", without warranty of any kind. Generated configuration affects live websites — search visibility, ad revenue, server behaviour. Review and test everything before deploying it to production.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Limitation of liability</h2>
<p style="color:var(--muted);margin-bottom:18px">To the maximum extent permitted by law, we accept no liability for any loss arising from use of this site or its output, including lost traffic, lost revenue or service disruption.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Changes</h2>
<p style="color:var(--muted)">These terms may be updated as the site evolves. Continued use after a change constitutes acceptance.</p>`],

['disclaimer', 'Disclaimer',
 'Generated configuration affects production systems. Read this first.',
 'Disclaimer', `
<div class="note note-warn" style="margin-bottom:20px"><span></span><span><strong>Always test generated configuration before deploying it.</strong> A single wrong directive can deindex a site, break ad serving, or take a server offline.</span></div>
<h2 style="font-size:19px;margin-bottom:10px">Accuracy</h2>
<p style="color:var(--muted);margin-bottom:18px">Every generator follows the relevant published specification at the time of writing. Specifications, crawler user-agents and search engine behaviour all change. Verify against official documentation for anything business-critical.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Not professional advice</h2>
<p style="color:var(--muted);margin-bottom:18px">Nothing here is legal, security or financial advice. Publishing security.txt does not constitute a legal disclosure programme, and ads.txt does not guarantee revenue protection.</p>
<h2 style="font-size:19px;margin:22px 0 10px">Your responsibility</h2>
<ul style="color:var(--muted);padding-left:18px">
<li style="margin-bottom:8px">Validate syntax on your own server before reloading (<code>nginx -t</code>, <code>apachectl configtest</code>).</li>
<li style="margin-bottom:8px">Confirm robots and indexing rules in Search Console before assuming they took effect.</li>
<li style="margin-bottom:8px">Keep backups of any file you replace.</li>
<li>Never deploy a site-wide noindex or Disallow rule without checking which environment you are on.</li>
</ul>`]
];

pages.forEach(([slug, title, desc, heading, body]) => {
  fs.writeFileSync(`${slug}.html`, shell(slug, title, desc, heading, body), 'utf8');
  console.log('wrote', slug + '.html');
});

/* sitemap + robots for the site itself */
const base = 'https://managemybatch.com';
const urls = ['/', '/tools.html', '/about.html', '/faq.html', '/contact.html', '/blog.html',
  '/privacy.html', '/terms.html', '/disclaimer.html'].concat(
  fs.readdirSync('tools').filter(f => f.endsWith('.html')).map(f => '/tools/' + f));
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url>\n    <loc>${base}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n') +
  `\n</urlset>\n`, 'utf8');
fs.writeFileSync('robots.txt',
  `User-agent: *\nDisallow:\n\nSitemap: ${base}/sitemap.xml\n`, 'utf8');
console.log('wrote sitemap.xml (' + urls.length + ' urls) and robots.txt');

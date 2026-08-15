/* Manage My Batch — shared site shell, tool registry and helpers.
   Zero dependencies. Works from any directory depth via data-root on <body>. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ paths */
  var ROOT = (document.body && document.body.getAttribute('data-root')) || './';
  function url(p) { return p.charAt(0) === '/' ? p : ROOT + p; }
  window.GT_ROOT = ROOT;

  /* ---------------------------------------------------------------- icons */
  var I = {
    logo: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6-6 6 6 6"/><path d="m16 6 6 6-6 6"/></svg>',
    ext: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    copy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>',
    reset: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    bolt: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    spark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.94 14.06 3 21l6.94-6.94M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>',
    gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    help: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
    star: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.6a.55.55 0 0 1 1 0l2.3 4.7 5.2.75c.45.07.63.62.3.94l-3.75 3.66.9 5.17c.07.45-.4.79-.8.58L12 15.9l-4.65 2.5c-.4.21-.87-.13-.8-.58l.9-5.17-3.76-3.66c-.32-.32-.14-.87.31-.94l5.2-.75z"/></svg>',
    arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    search: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    warn: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    file: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h6"/><path d="M8 13h8M8 17h5"/></svg>',
    bot: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M12 4v4M2 14h2M20 14h2"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>',
    shield: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
    money: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
    tag: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2c0 .5.2 1 .6 1.4l8.8 8.8a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
    header: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 9v12"/></svg>',
    globe: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    link: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    sitemap: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="6" height="5" x="9" y="2" rx="1"/><rect width="6" height="5" x="2" y="17" rx="1"/><rect width="6" height="5" x="16" y="17" rx="1"/><path d="M12 7v5M5 17v-3h14v3"/></svg>',
    server: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="7" x="2" y="3" rx="1.5"/><rect width="20" height="7" x="2" y="14" rx="1.5"/><path d="M6 6.5h.01M6 17.5h.01"/></svg>',
    lock: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    id: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4M5 17c.6-1.3 1.7-2 3-2s2.4.7 3 2"/></svg>',
    clock: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    hash: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>',
    leaf: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
    db: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>',
    dice: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="3"/><circle cx="8.5" cy="8.5" r="1.1"/><circle cx="15.5" cy="15.5" r="1.1"/><circle cx="12" cy="12" r="1.1"/></svg>',
    yarn: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="12" r="8"/><path d="M4.5 8.5c3.5 1.2 8 4 10.5 8.2"/><path d="M6.6 5.4C9.4 7.7 13.6 12 15.9 17.6"/><path d="M14.6 4.6c-1 3.2-1.4 8 .4 12.6"/><path d="m18.6 17.2 2.6 3.4"/></svg>',
    key: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4"/><path d="m10.5 12.5 8-8M17 6l2 2M14.5 8.5l2 2"/></svg>',
    braces: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"/></svg>',
    grid: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    list: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    checklist: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m3 6 2 2 3-3M3 14l2 2 3-3M12 7h9M12 15h9"/></svg>',
    terminal: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m6 9 3 3-3 3M12 15h5"/></svg>',
    send: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>',
    swap: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4M3 6h18M7 22l-4-4 4-4M21 18H3"/></svg>',
    regex: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8M8.5 5.5l7 4M15.5 5.5l-7 4"/><rect width="5" height="5" x="3" y="16" rx="1"/><circle cx="18" cy="18.5" r="2"/></svg>',
    dropdown: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="4" rx="2"/><path d="m8 14 4 4 4-4"/></svg>',
    clipboard: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 12h8M8 16h5"/></svg>',
    bag: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    receipt: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    ticket: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v14"/></svg>',
    user: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    box: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>',
    layers: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
    barcode: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5v14M6.5 5v14M10 5v10M13.5 5v14M17 5v10M20.5 5v14"/></svg>',
    truck: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2"/><path d="M14 9h4l3 3v5a1 1 0 0 1-1 1h-1"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    users: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    pair: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="3.2"/><circle cx="17" cy="8" r="3.2"/><path d="M2.5 20a4.8 4.8 0 0 1 9 0M12.5 20a4.8 4.8 0 0 1 9 0"/></svg>',
    order: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h4M3 12h4M3 18h4"/><path d="M11 6h10M11 12h10M11 18h10"/></svg>',
    seat: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="6" height="6" x="3" y="4" rx="1.5"/><rect width="6" height="6" x="15" y="4" rx="1.5"/><rect width="6" height="6" x="3" y="14" rx="1.5"/><rect width="6" height="6" x="15" y="14" rx="1.5"/></svg>',
    percent: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
    book: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5"/></svg>',
    shuffle: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>',
    calculator: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h4"/></svg>',
    divide: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="1.4"/><path d="M5 12h14"/><circle cx="12" cy="18" r="1.4"/></svg>',
    ruler: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18v5H3z"/><path d="M7 10v3M11 10v4M15 10v3M19 10v4"/></svg>',
    bingo: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>',
    puzzle: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h4M7 12h8M7 16h5"/><path d="m15 8 4 4-4 4" opacity=".55"/></svg>',
    trophy: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v6a6 6 0 0 1-12 0z"/><path d="M6 6H4a2 2 0 0 0 0 4h2M18 6h2a2 2 0 0 1 0 4h-2"/><path d="M10 16h4M9 20h6M12 16v4"/></svg>',
    bracket: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h5v6H3M3 13h5v6H3"/><path d="M8 8h4v8H8"/><path d="M12 12h4"/><path d="M16 9h5v6h-5z"/></svg>',
    calendar: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>',
    whistle: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18M3.5 9h17M3.5 15h17"/></svg>',
    gift: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="7" rx="1"/><path d="M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8M12 7v14"/><path d="M12 7S9.5 3 7.5 4.5 9 7 12 7zM12 7s2.5-4 4.5-2.5S15 7 12 7z"/></svg>',
    repeat: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
    broom: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3 9 13"/><path d="M12 10 4 18a3 3 0 0 0 4 4l8-8z"/><path d="m8 14 4 4M6 16l4 4"/></svg>',
    home: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>'
  };
  window.GTI = I;

  /* -------------------------------------------------------------- registry */
  var TOOLS = [
    { slug: 'llms-txt-generator', name: 'LLMs.txt Generator', short: 'LLMs.txt',
      desc: 'Generate an llms.txt file so AI assistants understand and cite your site correctly.',
      cat: 'AI & Crawlers', icon: 'file', tone: 'ic-green', featured: true,
      kw: 'llms.txt ai llm markdown documentation chatgpt claude perplexity' },
    { slug: 'ai-crawler-robots-txt-generator', name: 'AI Crawler Robots.txt Generator', short: 'AI Robots.txt',
      desc: 'Allow or block GPTBot, ClaudeBot, PerplexityBot and 25+ AI crawlers in one robots.txt.',
      cat: 'AI & Crawlers', icon: 'bot', tone: 'ic-purple', featured: true,
      kw: 'robots.txt gptbot claudebot ai crawler block scraping bots' },
    { slug: 'security-txt-generator', name: 'Security.txt Generator', short: 'Security.txt',
      desc: 'Create an RFC 9116 compliant security.txt so researchers can report vulnerabilities.',
      cat: 'Security & Business', icon: 'shield', tone: 'ic-red', featured: true,
      kw: 'security.txt rfc 9116 vulnerability disclosure contact pgp' },
    { slug: 'ads-txt-generator', name: 'Ads.txt Generator', short: 'Ads.txt',
      desc: 'Build IAB-compliant ads.txt and app-ads.txt files for authorized digital sellers.',
      cat: 'Security & Business', icon: 'money', tone: 'ic-amber',
      kw: 'ads.txt app-ads.txt iab adsense programmatic sellers publisher' },
    { slug: 'meta-robots-tag-generator', name: 'Meta Robots Tag Generator', short: 'Meta Robots',
      desc: 'Compose meta robots tags with noindex, nofollow, max-snippet and per-bot rules.',
      cat: 'SEO', icon: 'tag', tone: 'ic-blue',
      kw: 'meta robots noindex nofollow snippet googlebot indexing seo' },
    { slug: 'x-robots-tag-generator', name: 'X-Robots-Tag Generator', short: 'X-Robots-Tag',
      desc: 'Generate X-Robots-Tag HTTP headers for Nginx, Apache, Cloudflare and more.',
      cat: 'SEO', icon: 'header', tone: 'ic-blue',
      kw: 'x-robots-tag header noindex pdf nginx apache cloudflare cdn' },
    { slug: 'hreflang-tag-generator', name: 'Hreflang Tag Generator', short: 'Hreflang',
      desc: 'Build validated hreflang clusters as HTML, HTTP headers or an XML sitemap.',
      cat: 'SEO', icon: 'globe', tone: 'ic-green',
      kw: 'hreflang international seo language region x-default sitemap' },
    { slug: 'canonical-tag-generator', name: 'Canonical Tag Generator', short: 'Canonical',
      desc: 'Create clean rel=canonical tags and headers with URL normalization built in.',
      cat: 'SEO', icon: 'link', tone: 'ic-purple',
      kw: 'canonical rel duplicate content url normalization utm parameters' },
    { slug: 'sitemap-index-generator', name: 'Sitemap Index Generator', short: 'Sitemap Index',
      desc: 'Split large sitemaps and generate a valid sitemap index with lastmod values.',
      cat: 'SEO', icon: 'sitemap', tone: 'ic-amber',
      kw: 'sitemap index xml lastmod 50000 urls split gzip robots' },
    { slug: 'nginx-redirect-generator', name: 'Nginx Redirect Generator', short: 'Nginx Redirects',
      desc: 'Turn a URL list into optimized Nginx 301/302 rules, maps or regex rewrites.',
      cat: 'Developer', icon: 'server', tone: 'ic-red',
      kw: 'nginx redirect 301 302 rewrite map return migration server block' },

    { slug: 'htaccess-redirect-generator', name: '.htaccess Redirect Generator', short: '.htaccess Redirects',
      desc: 'Apache 301/302 rules with anchored patterns, loop detection and a rule tester.',
      cat: 'Developer', icon: 'server', tone: 'ic-red',
      kw: 'htaccess apache redirect 301 302 rewriterule redirectmatch mod_rewrite https www' },

    { slug: 'content-security-policy-generator', name: 'Content Security Policy Generator', short: 'CSP Header',
      desc: 'Build a strict CSP with nonces and strict-dynamic, with analysis and server config.',
      cat: 'Security & Business', icon: 'shield', tone: 'ic-amber',
      kw: 'csp content security policy header nonce strict-dynamic script-src xss frame-ancestors report-only' },

    { slug: 'permissions-policy-generator', name: 'Permissions-Policy Generator', short: 'Permissions-Policy',
      desc: 'Switch off camera, microphone, location and 24 more browser features per origin.',
      cat: 'Security & Business', icon: 'lock', tone: 'ic-amber',
      kw: 'permissions policy feature policy header camera microphone geolocation sensors iframe allow' },

    { slug: 'referrer-policy-generator', name: 'Referrer Policy Generator', short: 'Referrer-Policy',
      desc: 'Compare all eight values side by side and see exactly what each one leaks.',
      cat: 'Security & Business', icon: 'link', tone: 'ic-amber',
      kw: 'referrer policy header referer privacy strict-origin-when-cross-origin no-referrer meta tag' },

    { slug: 'cors-header-generator', name: 'CORS Header Generator', short: 'CORS Headers',
      desc: 'Access-Control headers with preflight handling and a request simulator.',
      cat: 'API & HTTP', icon: 'send', tone: 'ic-amber',
      kw: 'cors access-control-allow-origin preflight options credentials vary origin api headers' },

    /* ---- Crochet & Yarn ---- */
    { slug: 'crochet-hook-size-converter', name: 'Crochet Hook Size Converter', short: 'Hook Sizes',
      desc: 'US, UK and metric hook sizes, including steel thread hooks and yarn weight guides.',
      cat: 'Crochet & Yarn', icon: 'yarn', tone: 'ic-purple',
      kw: 'crochet hook size converter chart us uk metric mm steel thread yarn weight conversion' },

    { slug: 'crochet-gauge-calculator', name: 'Crochet Gauge Calculator', short: 'Gauge',
      desc: 'Compare your swatch to the pattern, get a hook to try, or resize to your own gauge.',
      cat: 'Crochet & Yarn', icon: 'yarn', tone: 'ic-purple',
      kw: 'crochet gauge calculator tension swatch stitches per inch resize pattern hook size' },

    { slug: 'crochet-yarn-yardage-calculator', name: 'Crochet Yarn Yardage Calculator', short: 'Yarn Yardage',
      desc: 'How much yarn a project needs, from a weighed swatch or a quick estimate.',
      cat: 'Crochet & Yarn', icon: 'yarn', tone: 'ic-purple',
      kw: 'crochet yarn calculator yardage how much yarn blanket skeins dye lot substitute' },

    { slug: 'crochet-blanket-stitch-calculator', name: 'Crochet Blanket Stitch Calculator', short: 'Blanket Stitches',
      desc: 'Foundation chain, stitch count and rows for any blanket size from your gauge.',
      cat: 'Crochet & Yarn', icon: 'yarn', tone: 'ic-purple',
      kw: 'crochet blanket calculator foundation chain stitch count rows multiple turning chain size' },

    { slug: 'crochet-blanket-yarn-calculator', name: 'Crochet Blanket Yarn Calculator', short: 'Blanket Yarn',
      desc: 'Yarn for a blanket split per colour, with border, fringe and tails included.',
      cat: 'Crochet & Yarn', icon: 'yarn', tone: 'ic-purple',
      kw: 'crochet blanket yarn calculator per colour border fringe skeins stripes how much' },

    { slug: 'granny-square-calculator', name: 'Granny Square Calculator', short: 'Granny Squares',
      desc: 'Rounds for a target size, stitches per round, and squares needed for a blanket.',
      cat: 'Crochet & Yarn', icon: 'yarn', tone: 'ic-purple',
      kw: 'granny square calculator rounds size stitch count squares blanket joining blocking' },

    { slug: 'granny-square-layout-generator', name: 'Granny Square Layout Generator', short: 'Square Layout',
      desc: 'Arrange squares into a blanket grid with six colour placement styles.',
      cat: 'Crochet & Yarn', icon: 'grid', tone: 'ic-purple',
      kw: 'granny square layout generator colour placement grid blanket plan squares per colour' },

    { slug: 'crochet-stripe-pattern-generator', name: 'Crochet Stripe Pattern Generator', short: 'Stripe Patterns',
      desc: 'Even, Fibonacci, random or mirrored stripes with preview and yarn per colour.',
      cat: 'Crochet & Yarn', icon: 'yarn', tone: 'ic-purple',
      kw: 'crochet stripe generator pattern fibonacci random mirrored colour change yarn per colour' },

    /* ---- IDs & Random ---- */
    { slug: 'uuid-v7-generator', name: 'UUID v7 Generator', short: 'UUID v7',
      desc: 'Generate RFC 9562 time-ordered UUID v7 identifiers, with a built-in timestamp decoder.',
      cat: 'IDs & Random', icon: 'id', tone: 'ic-purple', featured: true,
      kw: 'uuid v7 v4 guid rfc 9562 time ordered sortable primary key database index' },
    { slug: 'ulid-generator', name: 'ULID Generator', short: 'ULID',
      desc: 'Create lexicographically sortable ULIDs with monotonic ordering and a decoder.',
      cat: 'IDs & Random', icon: 'clock', tone: 'ic-blue',
      kw: 'ulid crockford base32 sortable identifier monotonic timestamp' },
    { slug: 'nanoid-generator', name: 'NanoID Generator', short: 'NanoID',
      desc: 'Generate URL-safe NanoIDs with a real collision-probability calculator.',
      cat: 'IDs & Random', icon: 'leaf', tone: 'ic-green',
      kw: 'nanoid short id url safe alphabet collision probability random' },
    { slug: 'mongodb-objectid-generator', name: 'MongoDB ObjectId Generator', short: 'ObjectId',
      desc: 'Build valid 12-byte MongoDB ObjectIds and decode the timestamp inside any existing one.',
      cat: 'IDs & Random', icon: 'db', tone: 'ic-green',
      kw: 'mongodb objectid bson 24 hex counter timestamp mongo _id' },
    { slug: 'random-hex-string-generator', name: 'Random Hex String Generator', short: 'Random Hex',
      desc: 'Cryptographically secure hex strings with prefixes, casing and separator options.',
      cat: 'IDs & Random', icon: 'hash', tone: 'ic-amber',
      kw: 'random hex string secure crypto token color mac address seed' },
    { slug: 'random-byte-generator', name: 'Random Byte Generator', short: 'Random Bytes',
      desc: 'Generate random bytes and export as hex, base64, C array, Python bytes or binary.',
      cat: 'IDs & Random', icon: 'dice', tone: 'ic-purple',
      kw: 'random bytes entropy csprng base64 buffer array iv salt nonce' },
    { slug: 'dummy-api-key-generator', name: 'Dummy API Key Generator', short: 'Dummy API Keys',
      desc: 'Realistic but non-functional placeholder API keys for tests, docs and screenshots.',
      cat: 'IDs & Random', icon: 'key', tone: 'ic-red', featured: true,
      kw: 'fake api key placeholder test token stripe github aws mock secret' },

    /* ---- Test Data ---- */
    { slug: 'json-test-data-generator', name: 'JSON Test Data Generator', short: 'JSON Test Data',
      desc: 'Design a schema and generate realistic, reproducible JSON fixtures in seconds.',
      cat: 'Test Data', icon: 'braces', tone: 'ic-blue',
      kw: 'json fake data mock fixtures schema seed faker api stub' },
    { slug: 'csv-test-data-generator', name: 'CSV Test Data Generator', short: 'CSV Test Data',
      desc: 'Generate CSV or TSV sample data with correct quoting, delimiters and line endings.',
      cat: 'Test Data', icon: 'grid', tone: 'ic-green',
      kw: 'csv tsv fake data sample spreadsheet import test rfc 4180' },
    { slug: 'sql-insert-data-generator', name: 'SQL Insert Data Generator', short: 'SQL Inserts',
      desc: 'Produce dialect-correct INSERT statements with proper escaping and batching.',
      cat: 'Test Data', icon: 'db', tone: 'ic-amber',
      kw: 'sql insert seed data mysql postgres sqlite mssql batch escaping' },
    { slug: 'json-array-generator', name: 'JSON Array Generator', short: 'JSON Array',
      desc: 'Build arrays of numbers, strings, dates or objects — sequences, ranges and shuffles.',
      cat: 'Test Data', icon: 'list', tone: 'ic-purple',
      kw: 'json array generator range sequence numbers strings shuffle list' },

    /* ---- API & HTTP ---- */
    { slug: 'curl-command-generator', name: 'cURL Command Generator', short: 'cURL',
      desc: 'Build correct curl commands with headers, auth and bodies — for bash, cmd and PowerShell.',
      cat: 'API & HTTP', icon: 'terminal', tone: 'ic-blue',
      kw: 'curl command http request headers post json auth bearer bash powershell' },
    { slug: 'fetch-api-request-generator', name: 'Fetch API Request Generator', short: 'Fetch API',
      desc: 'Generate modern fetch() code with async/await, error handling and TypeScript types.',
      cat: 'API & HTTP', icon: 'send', tone: 'ic-green',
      kw: 'fetch api javascript request async await headers json typescript' },
    { slug: 'axios-request-generator', name: 'Axios Request Generator', short: 'Axios',
      desc: 'Build axios calls, instances and interceptors from a simple request form.',
      cat: 'API & HTTP', icon: 'swap', tone: 'ic-purple',
      kw: 'axios request instance interceptor javascript http client node' },

    /* ---- HTML & Markdown ---- */
    { slug: 'html-table-generator', name: 'HTML Table Generator', short: 'HTML Table',
      desc: 'Turn pasted data into accessible HTML tables with thead, scope and optional CSS.',
      cat: 'HTML & Markdown', icon: 'grid', tone: 'ic-blue',
      kw: 'html table generator csv paste thead accessible scope caption css' },
    { slug: 'markdown-table-generator', name: 'Markdown Table Generator', short: 'Markdown Table',
      desc: 'Convert CSV or TSV into aligned GitHub-flavored Markdown tables.',
      cat: 'HTML & Markdown', icon: 'grid', tone: 'ic-green',
      kw: 'markdown table generator csv tsv github alignment readme pipe' },
    { slug: 'github-task-list-generator', name: 'GitHub Task List Generator', short: 'Task List',
      desc: 'Build nested GitHub task lists with live progress counts for issues and PRs.',
      cat: 'HTML & Markdown', icon: 'checklist', tone: 'ic-purple',
      kw: 'github task list checkbox markdown checklist issue pull request progress' },
    { slug: 'html-select-option-generator', name: 'HTML Select Option Generator', short: 'Select Options',
      desc: 'Generate select markup from a list, with optgroups and country/state/month presets.',
      cat: 'HTML & Markdown', icon: 'dropdown', tone: 'ic-amber',
      kw: 'html select option generator dropdown optgroup countries states months' },
    { slug: 'html-datalist-generator', name: 'HTML Data List Generator', short: 'Datalist',
      desc: 'Create datalist autocomplete markup correctly wired to its input element.',
      cat: 'HTML & Markdown', icon: 'list', tone: 'ic-blue',
      kw: 'html datalist autocomplete input list suggestions options' },
    { slug: 'regex-character-class-generator', name: 'Regex Character Class Generator', short: 'Regex Class',
      desc: 'Build and test regex character classes visually, with escaping handled for you.',
      cat: 'Developer', icon: 'regex', tone: 'ic-red', featured: true,
      kw: 'regex character class range negation escape quantifier tester pattern' },

    /* ---- Business Numbering ---- */
    { slug: 'invoice-number-generator', name: 'Invoice Number Generator', short: 'Invoice Numbers',
      desc: 'Generate clean, sequential invoice numbers that satisfy accounting and audit requirements.',
      cat: 'Business Numbering', icon: 'file', tone: 'ic-blue', featured: true,
      kw: 'invoice number generator sequential accounting billing vat audit gapless' },
    { slug: 'purchase-order-number-generator', name: 'Purchase Order Number Generator', short: 'PO Numbers',
      desc: 'Create structured PO numbers with department, cost centre and fiscal year segments.',
      cat: 'Business Numbering', icon: 'clipboard', tone: 'ic-purple',
      kw: 'purchase order number po generator procurement fiscal year department' },
    { slug: 'order-number-generator', name: 'Order Number Generator', short: 'Order Numbers',
      desc: 'Build order numbers for ecommerce that are readable but not guessable by customers.',
      cat: 'Business Numbering', icon: 'bag', tone: 'ic-green',
      kw: 'order number generator ecommerce shopify woocommerce sequential enumeration' },
    { slug: 'receipt-number-generator', name: 'Receipt Number Generator', short: 'Receipt Numbers',
      desc: 'Produce gapless receipt numbers for POS, retail and cash-handling compliance.',
      cat: 'Business Numbering', icon: 'receipt', tone: 'ic-amber',
      kw: 'receipt number generator pos retail till gapless fiscal audit' },
    { slug: 'ticket-number-generator', name: 'Ticket Number Generator', short: 'Ticket Numbers',
      desc: 'Generate support ticket or event ticket numbers with optional check digits.',
      cat: 'Business Numbering', icon: 'ticket', tone: 'ic-red',
      kw: 'ticket number generator support helpdesk event admission check digit' },
    { slug: 'reference-number-generator', name: 'Reference Number Generator', short: 'Reference Numbers',
      desc: 'Create payment and correspondence references with Luhn or mod-97 check digits.',
      cat: 'Business Numbering', icon: 'hash', tone: 'ic-blue',
      kw: 'reference number generator payment remittance iso 11649 rf mod97 luhn' },
    { slug: 'employee-id-generator', name: 'Employee ID Generator', short: 'Employee IDs',
      desc: 'Generate HR employee IDs that stay stable and never encode personal data.',
      cat: 'Business Numbering', icon: 'user', tone: 'ic-purple',
      kw: 'employee id generator hr staff number payroll badge onboarding' },
    { slug: 'asset-tag-number-generator', name: 'Asset Tag Number Generator', short: 'Asset Tags',
      desc: 'Build IT and facilities asset tags with site, category and sequence segments.',
      cat: 'Business Numbering', icon: 'tag', tone: 'ic-green',
      kw: 'asset tag number generator it inventory cmdb label barcode depreciation' },
    { slug: 'batch-number-generator', name: 'Batch Number Generator', short: 'Batch Numbers',
      desc: 'Generate traceable manufacturing batch numbers with date codes and line identifiers.',
      cat: 'Business Numbering', icon: 'box', tone: 'ic-amber',
      kw: 'batch number generator manufacturing gmp traceability production line recall' },
    { slug: 'lot-number-generator', name: 'Lot Number Generator', short: 'Lot Numbers',
      desc: 'Create GS1-aware lot codes for food, cosmetics and pharma traceability and recalls.',
      cat: 'Business Numbering', icon: 'layers', tone: 'ic-red',
      kw: 'lot number generator gs1 food pharma traceability expiry recall julian date' },

    /* ---- Ecommerce ---- */
    { slug: 'sku-generator', name: 'SKU Generator', short: 'SKU',
      desc: 'Build structured, readable SKUs from product attributes — with variant matrix export.',
      cat: 'Ecommerce', icon: 'box', tone: 'ic-purple', featured: true,
      kw: 'sku generator stock keeping unit inventory variant size colour ecommerce shopify' },
    { slug: 'coupon-code-generator', name: 'Coupon Code Generator', short: 'Coupon Codes',
      desc: 'Generate bulk unique discount codes that are hard to guess and easy to read aloud.',
      cat: 'Ecommerce', icon: 'percent', tone: 'ic-red',
      kw: 'coupon code generator discount promo voucher bulk unique redeem ecommerce' },
    { slug: 'product-code-generator', name: 'Product Code Generator', short: 'Product Codes',
      desc: 'Create internal product and model codes with category, range and version segments.',
      cat: 'Ecommerce', icon: 'tag', tone: 'ic-blue',
      kw: 'product code generator model number article catalogue internal reference' },
    { slug: 'barcode-number-generator', name: 'Barcode Number Generator', short: 'Barcode Numbers',
      desc: 'Generate valid EAN-13, UPC-A, EAN-8 and GTIN-14 numbers with correct check digits.',
      cat: 'Ecommerce', icon: 'barcode', tone: 'ic-green', featured: true,
      kw: 'barcode number generator ean 13 upc a gtin check digit gs1 prefix retail' },
    { slug: 'shipping-reference-generator', name: 'Shipping Reference Generator', short: 'Shipping Refs',
      desc: 'Build shipment, consignment and parcel references with carrier and route segments.',
      cat: 'Ecommerce', icon: 'truck', tone: 'ic-amber',
      kw: 'shipping reference generator consignment parcel tracking waybill carrier logistics' },

    /* ---- Education ---- */
    { slug: 'random-student-pair-generator', name: 'Random Student Pair Generator', short: 'Student Pairs',
      desc: 'Pair students fairly, with no-repeat rounds and keep-apart rules for tricky classes.',
      cat: 'Education', icon: 'pair', tone: 'ic-green', featured: true,
      kw: 'random student pair generator partner classroom teacher no repeat rounds' },
    { slug: 'classroom-group-generator', name: 'Classroom Group Generator', short: 'Class Groups',
      desc: 'Split a class into balanced groups with keep-apart and keep-together constraints.',
      cat: 'Education', icon: 'users', tone: 'ic-blue',
      kw: 'classroom group generator random teams students balanced teacher split class' },
    { slug: 'presentation-order-generator', name: 'Presentation Order Generator', short: 'Presentation Order',
      desc: 'Randomise presentation order and build a timed schedule across lessons or days.',
      cat: 'Education', icon: 'order', tone: 'ic-purple',
      kw: 'presentation order generator random speaking turn schedule timetable classroom' },
    { slug: 'student-roll-number-generator', name: 'Student Roll Number Generator', short: 'Roll Numbers',
      desc: 'Assign roll numbers to a class list with year, grade and section segments.',
      cat: 'Education', icon: 'clipboard', tone: 'ic-amber',
      kw: 'student roll number generator admission id school class section register' },
    { slug: 'classroom-seating-chart-generator', name: 'Classroom Seating Chart Generator', short: 'Seating Chart',
      desc: 'Create printable seating plans with keep-apart rules and front-row placements.',
      cat: 'Education', icon: 'seat', tone: 'ic-red',
      kw: 'classroom seating chart generator plan desk arrangement teacher print random' },

    /* ---- Education: questioning & worksheets ---- */
    { slug: 'random-question-picker', name: 'Random Question Picker', short: 'Question Picker',
      desc: 'Pick questions or students at random on a big projector-friendly display, with no-repeat mode.',
      cat: 'Education', icon: 'help', tone: 'ic-purple',
      kw: 'random question picker cold call classroom spinner teacher no repeat display' },
    { slug: 'vocabulary-quiz-generator', name: 'Vocabulary Quiz Generator', short: 'Vocabulary Quiz',
      desc: 'Turn a word list into printable multiple-choice, matching or fill-in-the-blank quizzes.',
      cat: 'Education', icon: 'book', tone: 'ic-blue', featured: true,
      kw: 'vocabulary quiz generator worksheet multiple choice matching definitions spelling teacher' },
    { slug: 'spelling-word-scramble-generator', name: 'Spelling Word Scramble Generator', short: 'Word Scramble',
      desc: 'Scramble spelling words into printable puzzles with difficulty levels and answer keys.',
      cat: 'Education', icon: 'shuffle', tone: 'ic-green',
      kw: 'spelling word scramble generator anagram worksheet puzzle teacher printable' },
    { slug: 'math-worksheet-generator', name: 'Math Worksheet Generator', short: 'Math Worksheet',
      desc: 'Generate addition, subtraction, multiplication and division worksheets with answer keys.',
      cat: 'Education', icon: 'calculator', tone: 'ic-amber', featured: true,
      kw: 'math worksheet generator addition subtraction multiplication division printable answer key' },
    { slug: 'fraction-worksheet-generator', name: 'Fraction Worksheet Generator', short: 'Fraction Worksheet',
      desc: 'Build fraction practice with like and unlike denominators, simplifying and mixed numbers.',
      cat: 'Education', icon: 'divide', tone: 'ic-purple',
      kw: 'fraction worksheet generator adding subtracting simplify mixed numbers printable' },
    { slug: 'clock-reading-worksheet-generator', name: 'Clock Reading Worksheet Generator', short: 'Clock Worksheet',
      desc: 'Printable analogue clock worksheets with adjustable precision and drawing exercises.',
      cat: 'Education', icon: 'clock', tone: 'ic-blue',
      kw: 'clock reading worksheet generator telling time analogue printable kids hour half quarter' },
    { slug: 'number-line-worksheet-generator', name: 'Number Line Worksheet Generator', short: 'Number Line',
      desc: 'Create number line worksheets for missing numbers, plotting, jumps and fractions.',
      cat: 'Education', icon: 'ruler', tone: 'ic-green',
      kw: 'number line worksheet generator missing numbers plotting integers fractions printable' },
    { slug: 'coordinate-grid-worksheet-generator', name: 'Coordinate Grid Worksheet Generator', short: 'Coordinate Grid',
      desc: 'Generate coordinate plane worksheets for plotting points and reading ordered pairs.',
      cat: 'Education', icon: 'grid', tone: 'ic-red',
      kw: 'coordinate grid worksheet generator plane plotting points quadrants ordered pairs graph paper' },

    /* ---- Puzzles & Games ---- */
    { slug: 'bingo-card-generator', name: 'Bingo Card Generator', short: 'Bingo Cards',
      desc: 'Print unique bingo cards from numbers or your own word list, plus a call list.',
      cat: 'Puzzles & Games', icon: 'bingo', tone: 'ic-amber', featured: true,
      kw: 'bingo card generator printable unique cards words numbers classroom party call list' },
    { slug: 'word-search-puzzle-generator', name: 'Word Search Puzzle Generator', short: 'Word Search',
      desc: 'Build word search puzzles in 8 directions with difficulty settings and a solution key.',
      cat: 'Puzzles & Games', icon: 'puzzle', tone: 'ic-purple',
      kw: 'word search puzzle generator printable wordsearch grid hidden words answer key teacher' },

    /* ---- Sports & Teams ---- */
    { slug: 'tournament-bracket-generator', name: 'Tournament Bracket Generator', short: 'Bracket',
      desc: 'Build seeded single-elimination brackets with correct bye placement and a printable tree.',
      cat: 'Sports & Teams', icon: 'trophy', tone: 'ic-amber', featured: true,
      kw: 'tournament bracket generator single elimination seeding byes knockout printable esports' },
    { slug: 'round-robin-schedule-generator', name: 'Round Robin Schedule Generator', short: 'Round Robin',
      desc: 'Everyone plays everyone — balanced home and away, with byes handled for odd numbers.',
      cat: 'Sports & Teams', icon: 'repeat', tone: 'ic-blue',
      kw: 'round robin schedule generator everyone plays everyone fixtures circle method league' },
    { slug: 'team-generator', name: 'Team Generator', short: 'Teams',
      desc: 'Split players into balanced teams, optionally by skill rating, with captains and colours.',
      cat: 'Sports & Teams', icon: 'users', tone: 'ic-green', featured: true,
      kw: 'team generator random balanced players skill rating captains sports pe groups' },
    { slug: 'match-fixture-generator', name: 'Match Fixture Generator', short: 'Fixtures',
      desc: 'Turn a team list into a dated fixture list with kick-off times, venues and match numbers.',
      cat: 'Sports & Teams', icon: 'whistle', tone: 'ic-red',
      kw: 'match fixture generator football schedule dates venues kick off times sports club' },
    { slug: 'league-schedule-generator', name: 'League Schedule Generator', short: 'League Schedule',
      desc: 'Full home-and-away season schedules with match weeks, dates and a fairness report.',
      cat: 'Sports & Teams', icon: 'calendar', tone: 'ic-purple',
      kw: 'league schedule generator season fixtures home away double round robin match week' },

    /* ---- Rotations & Events ---- */
    { slug: 'secret-santa-generator', name: 'Secret Santa Generator', short: 'Secret Santa',
      desc: 'Draw names with no self-matches, couple exclusions and no reciprocal pairs.',
      cat: 'Rotations & Events', icon: 'gift', tone: 'ic-red', featured: true,
      kw: 'secret santa generator draw names christmas office exclusions couples derangement' },
    { slug: 'random-gift-exchange-generator', name: 'Random Gift Exchange Generator', short: 'Gift Exchange',
      desc: 'Organise any gift swap — budgets, wishlists, groups and printable slips.',
      cat: 'Rotations & Events', icon: 'gift', tone: 'ic-purple',
      kw: 'gift exchange generator white elephant swap draw names budget wishlist group' },
    { slug: 'chore-rotation-generator', name: 'Chore Rotation Generator', short: 'Chore Rota',
      desc: 'Fair rotating chore charts where everyone takes every job in turn.',
      cat: 'Rotations & Events', icon: 'broom', tone: 'ic-green',
      kw: 'chore rotation generator chart family kids housework rota fair weekly printable' },
    { slug: 'work-shift-rotation-generator', name: 'Work Shift Rotation Generator', short: 'Shift Rota',
      desc: 'Build rotating shift patterns with coverage checks and rest-gap warnings.',
      cat: 'Rotations & Events', icon: 'clock', tone: 'ic-blue',
      kw: 'work shift rotation generator rota pattern staff coverage nights weekends roster' },
    { slug: 'cleaning-schedule-generator', name: 'Cleaning Schedule Generator', short: 'Cleaning Schedule',
      desc: 'Daily, weekly and monthly cleaning plans by room, split fairly across a household or team.',
      cat: 'Rotations & Events', icon: 'home', tone: 'ic-amber',
      kw: 'cleaning schedule generator house rota daily weekly monthly rooms checklist printable' }
  ];
  window.GT_TOOLS = TOOLS;

  var CATS = [
    { name: 'SEO', desc: 'Indexing & crawl control', icon: 'chart', tone: 'ic-green', match: 'SEO' },
    { name: 'IDs & Random', desc: 'Identifiers & entropy', icon: 'id', tone: 'ic-purple', match: 'IDs & Random' },
    { name: 'Test Data', desc: 'Fixtures & seed data', icon: 'braces', tone: 'ic-blue', match: 'Test Data' },
    { name: 'API & HTTP', desc: 'Requests & clients', icon: 'send', tone: 'ic-amber', match: 'API & HTTP' },
    { name: 'HTML & Markdown', desc: 'Markup snippets', icon: 'grid', tone: 'ic-blue', match: 'HTML & Markdown' },
    { name: 'AI & Crawlers', desc: 'Control AI access', icon: 'bot', tone: 'ic-purple', match: 'AI & Crawlers' },
    { name: 'Developer', desc: 'Server & code utilities', icon: 'terminal', tone: 'ic-red', match: 'Developer' },
    { name: 'Security & Business', desc: 'Trust essentials', icon: 'shield', tone: 'ic-amber', match: 'Security & Business' },
    { name: 'Business Numbering', desc: 'Invoices, orders & IDs', icon: 'receipt', tone: 'ic-green', match: 'Business Numbering' },
    { name: 'Ecommerce', desc: 'SKUs, coupons & barcodes', icon: 'box', tone: 'ic-purple', match: 'Ecommerce' },
    { name: 'Education', desc: 'Classroom tools', icon: 'users', tone: 'ic-blue', match: 'Education' },
    { name: 'Puzzles & Games', desc: 'Bingo & word search', icon: 'puzzle', tone: 'ic-purple', match: 'Puzzles & Games' },
    { name: 'Sports & Teams', desc: 'Brackets & fixtures', icon: 'trophy', tone: 'ic-amber', match: 'Sports & Teams' },
    { name: 'Rotations & Events', desc: 'Rotas & gift draws', icon: 'repeat', tone: 'ic-green', match: 'Rotations & Events' },
    { name: 'Crochet & Yarn', desc: 'Gauge, yardage & patterns', icon: 'yarn', tone: 'ic-purple', match: 'Crochet & Yarn' }
  ];
  window.GT_CATS = CATS;

  function bySlug(s) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].slug === s) return TOOLS[i]; return null; }
  window.GT_tool = bySlug;

  /* ------------------------------------------------------------ shell HTML */
  function navHTML(active) {
    var gens = TOOLS.map(function (t) {
      return '<a href="' + url('/tools/' + t.slug) + '">' + t.name + '</a>';
    }).join('');
    var cats = CATS.map(function (c) {
      return '<a href="' + url('/tools') + '?cat=' + encodeURIComponent(c.match) + '">' + c.name + '</a>';
    }).join('');
    return '' +
      '<header class="site-header"><div class="wrap"><nav class="nav">' +
      '<a class="brand" href="' + url('/') + '"><span class="logo">' + I.logo + '</span>Manage My Batch</a>' +
      '<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
      '<div class="nav-links" id="navLinks">' +
      '<a href="' + url('/') + '"' + (active === 'home' ? ' class="active"' : '') + '>Home</a>' +
      '<span class="has-menu"><a href="' + url('/tools') + '"' + (active === 'tools' ? ' class="active"' : '') + '>Generators</a>' +
      '<span class="menu-panel">' + gens + '</span></span>' +
      '<span class="has-menu"><a href="' + url('/tools') + '">Categories</a><span class="menu-panel">' + cats + '</span></span>' +
      '<a href="' + url('/blog') + '"' + (active === 'blog' ? ' class="active"' : '') + '>Blog</a>' +
      '<a href="' + url('/about') + '"' + (active === 'about' ? ' class="active"' : '') + '>About</a>' +
      '</div><span class="nav-spacer"></span>' +
      '<a class="btn btn-primary" href="' + url('/tools') + '">Browse Tools ' + I.ext + '</a>' +
      '</nav></div></header>';
  }

  function footerHTML() {
    var y = new Date().getFullYear();
    function li(h, t) { return '<li><a href="' + url(h) + '">' + t + '</a></li>'; }
    return '' +
      '<footer class="site-footer"><div class="wrap"><div class="foot-grid">' +
      '<div class="foot-about"><a class="brand" href="' + url('/') + '"><span class="logo">' + I.logo + '</span>Manage My Batch</a>' +
      '<p>Fast, free and simple tools to boost your productivity every day.</p>' +
      '<div class="socials"><a href="#" aria-label="GitHub"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg></a>' +
      '<a href="#" aria-label="X"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.7l7.9-9.1L1 2h7l4.8 6.4zm-1.2 18h1.9L7.4 4H5.4z"/></svg></a>' +
      '<a href="#" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.03-3.07-1.94-3.07-1.94 0-2.24 1.46-2.24 2.97V21H9z"/></svg></a></div></div>' +
      '<div><h5>Explore</h5><ul>' + li('/tools', 'All Generators') + li('/tools', 'Categories') + li('/tools#popular', 'Popular Tools') + li('/tools#new', 'Recently Added') + '</ul></div>' +
      '<div><h5>Resources</h5><ul>' + li('/blog', 'Blog') + li('/faq', 'FAQ') + li('/about', 'About Us') + li('/contact', 'Contact') + '</ul></div>' +
      '<div><h5>Company</h5><ul>' + li('/privacy', 'Privacy Policy') + li('/terms', 'Terms of Use') + li('/disclaimer', 'Disclaimer') + '</ul></div>' +
      '<div><h5>Stay Updated</h5><p style="color:var(--muted);font-size:13.8px">Get tips, updates and new tools in your inbox.</p>' +
      '<form class="sub" onsubmit="event.preventDefault();GT.toast(\'Thanks — you are on the list!\')">' +
      '<input type="email" placeholder="Enter your email" required><button class="btn btn-primary" type="submit">Subscribe</button></form></div>' +
      '</div><div class="foot-bottom">© ' + y + ' Manage My Batch &nbsp;•&nbsp; Built with ♥ for productivity</div></div></footer>';
  }

  /* ---------------------------------------------------------------- helpers */
  var GT = {};

  GT.toast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2000);
  };

  GT.copy = function (text, label) {
    if (!text) { GT.toast('Nothing to copy yet'); return; }
    var done = function () { GT.toast((label || 'Copied') + ' to clipboard'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { GT._fallbackCopy(text, done); });
    } else GT._fallbackCopy(text, done);
  };
  GT._fallbackCopy = function (text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { GT.toast('Copy failed — select the text manually'); }
    document.body.removeChild(ta);
  };

  GT.download = function (text, filename, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 300);
    GT.toast('Downloaded ' + filename);
  };

  GT.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  GT.escAttr = function (s) { return GT.esc(s).replace(/\n/g, ' '); };
  GT.$ = function (s, r) { return (r || document).querySelector(s); };
  GT.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* URL helpers shared by several tools */
  GT.normUrl = function (v, opts) {
    opts = opts || {};
    var s = String(v || '').trim();
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s.replace(/^\/+/, '');
    var u;
    try { u = new URL(s); } catch (e) { return s; }
    u.protocol = u.protocol.toLowerCase();
    u.hostname = u.hostname.toLowerCase().replace(/\.$/, '');
    if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';
    if (opts.stripHash !== false) u.hash = '';
    if (opts.stripTracking) {
      var drop = /^(utm_|gclid$|fbclid$|msclkid$|mc_cid$|mc_eid$|_ga$|yclid$|igshid$|ref$|ref_src$)/i;
      var keep = [];
      u.searchParams.forEach(function (val, k) { if (!drop.test(k)) keep.push([k, val]); });
      u.search = '';
      keep.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
      keep.forEach(function (p) { u.searchParams.append(p[0], p[1]); });
    }
    if (opts.forceHttps) u.protocol = 'https:';
    if (opts.trailing === 'add' && !/\.[a-z0-9]{1,8}$/i.test(u.pathname) && !/\/$/.test(u.pathname)) u.pathname += '/';
    if (opts.trailing === 'remove' && u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, '');
    if (opts.lowerPath) u.pathname = u.pathname.toLowerCase();
    return u.toString();
  };
  GT.isValidUrl = function (v) { try { var u = new URL(v); return /^https?:$/.test(u.protocol) && !!u.hostname && u.hostname.indexOf('.') > 0; } catch (e) { return false; } };
  GT.today = function () { return new Date().toISOString().slice(0, 10); };
  GT.xmlEsc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  };
  GT.lines = function (t) {
    return String(t || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  };
  GT.uniq = function (a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; };
  GT.bytes = function (n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB'; };
  GT.byteLen = function (s) { return new Blob([s]).size; };

  /* Persist a tool's form state so a refresh doesn't lose work */
  GT.persist = function (key, form) {
    var K = 'gt:' + key;
    function snap() {
      var o = {};
      GT.$$('input,select,textarea', form).forEach(function (el) {
        if (!el.name && !el.id) return;
        var k = el.name || el.id;
        if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) (o[k] = o[k] || []).push(el.value); }
        else o[k] = el.value;
      });
      try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) {}
    }
    form.addEventListener('input', snap);
    form.addEventListener('change', snap);
    GT.clearPersist = function () { try { localStorage.removeItem(K); } catch (e) {} };
    try {
      var raw = localStorage.getItem(K);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  };

  /* Standard output-panel wiring: copy / download / raw text */
  GT.mountOutput = function (opts) {
    var pre = GT.$(opts.pre), current = { text: '', name: opts.filename || 'output.txt' };
    var api = {
      set: function (text, filename) {
        current.text = text;
        if (filename) current.name = filename;
        pre.textContent = text;
        var fn = GT.$(opts.fileLabel);
        if (fn) fn.textContent = current.name;
        var meta = GT.$(opts.meta);
        if (meta) meta.textContent = GT.lines(text).length + ' lines · ' + GT.bytes(GT.byteLen(text));
        return text;
      },
      get: function () { return current.text; },
      name: function () { return current.name; }
    };
    var cp = GT.$(opts.copyBtn); if (cp) cp.addEventListener('click', function () { GT.copy(current.text, 'File'); });
    var dl = GT.$(opts.downloadBtn); if (dl) dl.addEventListener('click', function () {
      if (!current.text) return GT.toast('Generate the file first');
      GT.download(current.text, current.name, opts.mime);
    });
    return api;
  };

  /* --------------------------------------------------------- page sections */
  function stepsHTML(steps) {
    return steps.map(function (s, i) {
      return '<div class="step"><div class="top"><span class="bub">' + (I[s.icon] || I.gear) + '</span>' +
        '<div><span class="num">' + (i + 1) + '</span><h3>' + s.title + '</h3></div></div><p>' + s.text + '</p></div>';
    }).join('');
  }

  function relatedHTML(slugs) {
    return slugs.map(function (s) {
      var t = bySlug(s); if (!t) return '';
      return '<a class="tool-card" href="' + url('/tools/' + t.slug) + '">' +
        '<span class="ic ' + t.tone + '">' + I[t.icon] + '</span><h3>' + t.name + '</h3><p>' + t.desc + '</p>' +
        '<span class="go">Use Tool ' + I.arrow + '</span></a>';
    }).join('');
  }

  function faqHTML(faqs) {
    return faqs.map(function (f, i) {
      return '<details class="faq"' + (i === 0 ? ' open' : '') + '><summary>' + f.q + '</summary><div class="body">' + f.a + '</div></details>';
    }).join('');
  }

  /* ------------------------------------------------------- SEO article ---- */
  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* Renders the long-form SEO section. Blocks may carry html, a list, a table,
     cards, numbered steps, or a callout — mixed freely within one heading. */
  function seoHTML(seo) {
    if (!seo) return '';
    var blocks = seo.blocks || [];

    var toc = blocks.filter(function (b) { return b.h; }).map(function (b) {
      return '<li><a href="#' + slugify(b.h) + '">' + GT.esc(b.h) + '</a></li>';
    }).join('');

    var body = blocks.map(function (b) {
      var out = '';
      if (b.h) out += '<h3 id="' + slugify(b.h) + '">' + GT.esc(b.h) + '</h3>';
      if (b.html) out += b.html;
      if (b.list) {
        out += '<ul>' + b.list.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
      }
      if (b.ol) {
        out += '<ol>' + b.ol.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
      }
      if (b.steps) {
        out += '<ol class="seo-steps">' + b.steps.map(function (s) {
          return '<li>' + (s.t ? '<strong>' + GT.esc(s.t) + '</strong>' : '') + s.d + '</li>';
        }).join('') + '</ol>';
      }
      if (b.cards) {
        var tones = ['', 'g', 'a', 'p', 'r'];
        out += '<div class="seo-cards">' + b.cards.map(function (c, i) {
          return '<div class="seo-card ' + tones[i % tones.length] + '"><h4>' + GT.esc(c.t) + '</h4><p>' + c.d + '</p></div>';
        }).join('') + '</div>';
      }
      if (b.table) {
        out += '<div class="seo-table-wrap"><table class="seo-table"><thead><tr>' +
          b.table.head.map(function (h) { return '<th>' + GT.esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody>' + b.table.rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table></div>';
      }
      if (b.callout) {
        var kind = b.callout.type || 'tip';
        var ico = kind === 'warn' ? I.warn : kind === 'ok' ? I.check : I.info;
        out += '<div class="seo-callout ' + kind + '">' + ico + '<span>' + b.callout.text + '</span></div>';
      }
      if (b.after) out += b.after;
      return out;
    }).join('');

    var kw = seo.keywords && seo.keywords.length
      ? '<div class="seo-keywords"><h4>Related searches</h4><div class="seo-kw">' +
        seo.keywords.map(function (k) { return '<span>' + GT.esc(k) + '</span>'; }).join('') + '</div></div>'
      : '';

    return '<section class="seo-wrap"><div class="wrap"><article class="seo-article">' +
      '<h2>' + GT.esc(seo.title) + '</h2>' +
      (seo.lead ? '<p class="seo-lead">' + seo.lead + '</p>' : '') +
      (toc ? '<nav class="seo-toc"><h4>On this page</h4><ol>' + toc + '</ol></nav>' : '') +
      body + kw +
      '</article></div></section>';
  }

  /* Renders the shared chrome around a tool page. Call GT.page({...}) at the
     bottom of every tool page; the tool's own markup lives in #toolApp. */
  GT.page = function (cfg) {
    var t = bySlug(cfg.slug) || {};
    document.body.insertAdjacentHTML('afterbegin', navHTML('tools'));

    var hero = GT.$('#hero');
    if (hero) {
      hero.innerHTML = '<div class="dots"></div><div class="wrap">' +
        '<div class="crumbs"><a href="' + url('/') + '">Home</a><span>/</span>' +
        '<a href="' + url('/tools') + '?cat=' + encodeURIComponent(t.cat || '') + '">' + (t.cat || 'Tools') + '</a>' +
        '<span>/</span><span>' + (t.name || document.title) + '</span></div>' +
        '<div class="tool-head"><span class="tool-icon">' + (I[t.icon] || I.file) + '</span><h1>' + (t.name || '') + '</h1></div>' +
        '<p class="lede">' + (cfg.lede || t.desc || '') + '</p>' +
        '<div class="badges">' +
        '<span class="badge">' + I.check + ' Free</span>' +
        '<span class="badge">' + I.globe.replace('26', '15').replace('26', '15') + ' Browser-based</span>' +
        '<span class="badge">' + I.check + ' No signup</span>' +
        '<span class="badge">' + I.copy + ' Copy-ready</span>' +
        '</div></div>';
    }

    var after = GT.$('#afterTool');
    if (after) {
      after.innerHTML =
        (cfg.steps ? '<section><div class="wrap"><h2 class="section-title"><span class="ico">' + I.gear + '</span>How it works</h2>' +
          '<div class="steps">' + stepsHTML(cfg.steps) + '</div></div></section>' : '') +
        (cfg.guide ? '<section><div class="wrap"><div class="card card-pad"><h2 class="section-title"><span class="ico">' + I.chart + '</span>' + (cfg.guideTitle || 'Everything you need to know') + '</h2><div class="guide">' + cfg.guide + '</div></div></div></section>' : '') +
        (cfg.related ? '<section><div class="wrap"><div class="section-head"><h2 class="section-title" style="margin:0"><span class="ico">' + I.chart + '</span>Related Tools</h2>' +
          '<a href="' + url('/tools') + '">View all tools ' + I.arrow + '</a></div><div class="grid g3">' + relatedHTML(cfg.related) + '</div></div></section>' : '') +
        (cfg.faqs ? '<section><div class="wrap"><div class="section-head"><h2 class="section-title" style="margin:0"><span class="ico">' + I.help + '</span>Frequently Asked Questions</h2>' +
          '<a href="' + url('/faq') + '">View all FAQs ' + I.arrow + '</a></div>' + faqHTML(cfg.faqs) + '</div></section>' : '') +
        seoHTML(cfg.seo);
    }

    document.body.insertAdjacentHTML('beforeend', footerHTML());
    GT.mountNav();

    /* ---------------- structured data ---------------- */
    var ORIGIN = 'https://managemybatch.com';
    var pageUrl = ORIGIN + '/tools/' + cfg.slug;
    var graph = [];

    graph.push({
      '@type': 'SoftwareApplication',
      '@id': pageUrl + '#app',
      name: t.name,
      url: pageUrl,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (web browser)',
      description: cfg.lede || t.desc,
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'Manage My Batch', url: ORIGIN }
    });

    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' },
        { '@type': 'ListItem', position: 2, name: t.cat || 'Tools', item: ORIGIN + '/tools' },
        { '@type': 'ListItem', position: 3, name: t.name, item: pageUrl }
      ]
    });

    if (cfg.steps) {
      graph.push({
        '@type': 'HowTo',
        name: 'How to use the ' + t.name,
        description: cfg.lede || t.desc,
        totalTime: 'PT2M',
        step: cfg.steps.map(function (s, i) {
          return { '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text, url: pageUrl };
        })
      });
    }

    if (cfg.faqs) graph.push({
      '@type': 'FAQPage',
      mainEntity: cfg.faqs.map(function (f) {
        return {
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') }
        };
      })
    });

    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    document.head.appendChild(s);
  };

  GT.shell = function (active) {
    document.body.insertAdjacentHTML('afterbegin', navHTML(active));
    document.body.insertAdjacentHTML('beforeend', footerHTML());
    GT.mountNav();
  };

  GT.mountNav = function () {
    var b = GT.$('.nav-toggle'), l = GT.$('#navLinks');
    if (b && l) b.addEventListener('click', function () {
      var open = l.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  };

  GT.toolCard = function (t) {
    return '<a class="tool-card" href="' + url('/tools/' + t.slug) + '">' +
      '<span class="ic ' + t.tone + '">' + I[t.icon] + '</span><h3>' + t.name + '</h3><p>' + t.desc + '</p>' +
      '<span class="go">Use Tool ' + I.arrow + '</span></a>';
  };

  /* checkbox rows get a highlighted state */
  document.addEventListener('change', function (e) {
    if (e.target && e.target.type === 'checkbox') {
      var w = e.target.closest('.check');
      if (w) w.classList.toggle('on', e.target.checked);
    }
  });
  document.addEventListener('DOMContentLoaded', function () {
    GT.$$('.check input[type=checkbox]').forEach(function (c) {
      if (c.checked) c.closest('.check').classList.add('on');
    });
  });

  window.GT = GT;
})();

// Dev-only regression check for Python Jungle (not deployed — public/ is what ships).
// Usage: node check_audit.js
// Verifies: root/public sync, required DOM ids, onclick handlers resolve, script balance.
'use strict';
const fs = require('fs'), path = require('path');
const root = __dirname;
const pub = path.join(root, 'public');

let fails = 0;
function ok(cond, msg) { if (cond) console.log('PASS ' + msg); else { fails++; console.log('FAIL ' + msg); } }

const pairs = ['index.html', 'payment.html', 'css/style.css'];
pairs.forEach(f => {
  const a = fs.readFileSync(path.join(root, f));
  const b = fs.readFileSync(path.join(pub, f));
  ok(a.equals(b), 'sync: ' + f + (a.equals(b) ? '' : ' (DIFFERS!)'));
});

for (const f of pairs) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  const lines = src.split('\n');
  const defs = new Set();
  const calls = new Map();
  for (const ln of lines) {
    const d = ln.match(/^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
    if (d) defs.add(d[1]);
    const c = ln.match(/onclick="([A-Za-z_$][\w$]*)\s*\(/);
    if (c && c[1] !== 'if') calls.set(c[1], (calls.get(c[1]) || 0) + 1);
  }
  for (const [name] of calls) {
    if (name !== 'if' && !defs.has(name)) { fails++; console.log('FAIL ' + f + ': onclick handler "' + name + '" not defined'); }
  }
}

const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const needIds = ['successModal', 'mXP', 'mTotal', 'mProg', 'mBadge', 'modalSub', 'chapterUnlockBanner', 'fireflies', 'failModal', 'paymentModal', 'consoleOut', 'navXp'];
needIds.forEach(id => ok(new RegExp('id="' + id + '"').test(idx), 'id present: ' + id));
ok(!/(\n<\/style>\s*<\/style>)/.test(idx), 'no duplicate </style>');
const opens = (idx.match(/<script[^>]*>/g) || []).length;
const closes = (idx.match(/<\/script>/g) || []).length;
ok(opens === closes, 'script tags balanced (' + opens + '/' + closes + ')');

console.log(fails === 0 ? '\nALL CHECKS PASSED' : '\n' + fails + ' CHECK(S) FAILED');
process.exit(fails === 0 ? 0 : 1);

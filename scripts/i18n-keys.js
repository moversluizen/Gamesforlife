// Verzamelt alle teksten die door T('...') gaan (plus de vaste teksten uit index.html) in scripts/i18n-keys.json.
const fs = require('fs'), path = require('path'), prettier = require('prettier');
const dir = path.join(__dirname, '..', 'www');
(async () => {
  const keys = new Set();
  for (const f of fs.readdirSync(path.join(dir, 'js')).filter(f => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(dir, 'js', f), 'utf8');
    const { ast } = await prettier.__debug.parse(src, { parser: 'babel' });
    (function walk(n) {
      if (!n || typeof n.type !== 'string') return;
      if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'T' && n.arguments[0] && n.arguments[0].type === 'StringLiteral') keys.add(n.arguments[0].value);
      for (const k of Object.keys(n)) { if (k === 'loc') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); }
    })(ast.program);
  }
  const h = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const body = h.slice(h.indexOf('<body>'), h.indexOf('<script'));
  for (const m of body.matchAll(/>([^<>]+)</g)) { const t = m[1].trim(); if (/[A-Za-zÀ-ÿ]{2,}/.test(t)) keys.add(t); }
  for (const m of body.matchAll(/aria-label="([^"]+)"/g)) keys.add(m[1]);
  // Bestaande volgorde blijft staan (de vertaalbestanden verwijzen naar die nummers); nieuwe teksten komen achteraan.
  const file = path.join(__dirname, 'i18n-keys.json');
  const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const list = [...old, ...[...keys].filter(k => !old.includes(k))];
  fs.writeFileSync(path.join(__dirname, 'i18n-keys.json'), JSON.stringify(list, null, 1));
  console.log(list.length, 'teksten');
})();

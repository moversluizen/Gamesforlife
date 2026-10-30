// Zet scripts/i18n/<taal>.txt (regels "nummer: vertaling", nummer = positie in i18n-keys.json)
// om naar www/js/lang/<taal>.js en controleert placeholders ({0}) en HTML-tags.
// Let op: draai dit alleen met de i18n-keys.json waarmee de vertalingen gemaakt zijn; het resultaat is per tekst opgeslagen.
const fs = require('fs'), path = require('path');
const keys = require('./i18n-keys.json');
const langs = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(__dirname, 'i18n')).filter(f => f.endsWith('.txt')).map(f => f.slice(0, -4));
const ph = s => (s.match(/\{\d+\}/g) || []).sort().join();
const tags = s => (s.match(/<\/?[a-z]+/gi) || []).sort().join();
let bad = 0;
for (const l of langs) {
  const out = {};
  const lines = fs.readFileSync(path.join(__dirname, 'i18n', l + '.txt'), 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^(\d+): ?(.*)$/);
    if (!m) continue;
    const k = keys[+m[1]];
    if (k == null) { console.log(l, 'onbekend nummer', m[1]); bad++; continue; }
    let v = m[2].replace(/\\n/g, '\n');
    if (/^\s/.test(k) && !/^\s/.test(v)) v = k.match(/^\s+/)[0] + v;
    if (/\s$/.test(k) && !/\s$/.test(v)) v += k.match(/\s+$/)[0];
    if (ph(k) !== ph(v)) { console.log(l, m[1], 'placeholders kloppen niet:', k, '→', v); bad++; }
    if (tags(k) !== tags(v)) { console.log(l, m[1], 'tags kloppen niet:', k, '→', v); bad++; }
    if (v !== k) out[k] = v; else delete out[k];
  }
  const missing = keys.filter(k => !(k in out)).length;
  fs.writeFileSync(path.join(__dirname, '..', 'www', 'js', 'lang', l + '.js'),
    `// Gegenereerd door scripts/i18n-build.js uit scripts/i18n/${l}.txt\nG.I18N.${l} = ${JSON.stringify(out, null, 0).replace(/","/g, '",\n"')};\n`);
  console.log(l, Object.keys(out).length, 'vertaald,', missing, 'gelijk aan het Nederlands of ontbrekend');
}
process.exitCode = bad ? 1 : 0;

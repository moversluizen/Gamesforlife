// Zoekt (en vervangt met --write) alle Nederlandse teksten in www/js en verpakt ze in T(...).
// Gewone strings: T('tekst'). Templates zonder HTML: T('tekst {0}', expr). Templates met HTML:
// alleen de tekststukken tussen de tags worden ${T('...')}.
const fs = require('fs'), path = require('path'), prettier = require('prettier');
const FILES = process.argv.filter(a => a.endsWith('.js') && !a.includes('i18n-extract'));
const WRITE = process.argv.includes('--write');
const SKIP_CALLEE = /^(\$|document\.getElementById|document\.querySelector|document\.querySelectorAll|querySelector|querySelectorAll|closest|matches|getElementById|addEventListener|removeEventListener|G\.on|G\.emit|emit|on|classList\.(toggle|add|remove|contains)|toggle|add|remove|contains|setAttribute|getAttribute|removeAttribute|createElement|G\.haptic|haptic|G\.uiRes\.open|open|switchTab|G\.ui\.switchTab|switchSub|G\.techById|techById|G\.labDone|labDone|G\.techDone|G\.hl|hl|G\.eff|eff|require|T|G\.t|animate|startsWith|endsWith|includes|indexOf|split|replace|join|padStart|toFixed|localStorage\.(getItem|setItem|removeItem)|Preferences\.(get|set|remove)|G\.tabUnlocked|tabUnlocked|G\.buyUpgrade|buyUpgrade|find|filter|some|every)$/;
const hasWords = t => /[A-Za-zÀ-ÿ]{2,}/.test(t);
const looksText = t => {
  if (/^\s+[a-z ]+$/.test(t)) return false;                    // ' crit big': extra klassen
  const s = t.replace(/<[^>]*>/g, '').replace(/\{\d+\}/g, '').trim();
  if (!hasWords(s)) return false;
  if (/^[a-z][a-zA-Z0-9_-]*$/.test(s)) return false;          // id, sleutel, klasse
  if (/^[#.\[:][\w-]/.test(s) || /^[a-z-]+=/.test(s)) return false;
  if (/^(https?:|data:|\/|\.\/)/.test(s)) return false;
  if (/^(hsla?|rgba?|url|scale|translate[XY]?|rotate|calc|var)\(|^--|^[\s"]*(data-|style=|title=)|^\s*[a-z]+(\s+[a-z]+)*\s*$(?<=^\s.*)/.test(s)) return false;
  if (/^[A-Z][a-z]?$|^(Qa|Qi|Sx|Sp|Oc|No|Dc|UDc|DDc|TDc|QaDc|QiDc|SxDc|SpDc|OcDc|NoDc|Vg)$/.test(s)) return false;
  if (/^[A-Z_]+$/.test(s) && s.length > 1 && !/^(AGI|OK)$/.test(s)) return false;
  return true;
};
function calleeName(n) {
  if (!n) return '';
  if (n.type === 'Identifier') return n.name;
  if (n.type === 'MemberExpression' && !n.computed) { const o = calleeName(n.object); return (o ? o + '.' : '') + n.property.name; }
  return '';
}
const all = new Map();
(async () => {
  for (const f of FILES) {
    const src = fs.readFileSync(f, 'utf8');
    const { ast } = await prettier.__debug.parse(src, { parser: 'babel' });
    const targets = [];
    const stack = [];
    (function walk(n, parent, key) {
      if (!n || typeof n.type !== 'string') return;
      let skip = stack.some(a => a.type === 'AssignmentExpression' && a.left.type === 'MemberExpression' && /^(className|cssText|id|transform|fill|stroke)$/.test(a.left.property.name || '') || (a.left && a.left.object && a.left.object.property && a.left.object.property.name === 'style'));
      if (parent) {
        if ((parent.type === 'ObjectProperty' || parent.type === 'Property') && key === 'key') skip = true;
        if (parent.type === 'BinaryExpression' && /^(===|!==|==|!=|in)$/.test(parent.operator)) skip = true;
        if (parent.type === 'SwitchCase' && key === 'test') skip = true;
        if (parent.type === 'CallExpression' && key === 'arguments' && SKIP_CALLEE.test(calleeName(parent.callee).replace(/^.*\.(?=(classList|localStorage|Preferences)\.)/, ''))) skip = true;
        if (parent.type === 'MemberExpression' && key === 'property') skip = true;
        if (parent.type === 'ImportDeclaration') skip = true;
      }
      if (!skip && n.type === 'StringLiteral' && looksText(n.value)) targets.push({ n, kind: 'str' });
      if (!skip && n.type === 'TemplateLiteral' && parent && !(parent.type === 'TaggedTemplateExpression')) {
        const cooked = n.quasis.map(q => q.value.cooked);
        const html = cooked.some(c => /<\/?[a-z][^>]*>?/i.test(c) || /^[^<]*>/.test(c) && cooked.join('').includes('<'));
        if (html) targets.push({ n, kind: 'html' });
        else if (looksText(cooked.join('{0}'))) targets.push({ n, kind: 'tpl' });
      }
      stack.push(n);
      for (const k of Object.keys(n)) {
        if (k === 'loc' || k === 'start' || k === 'end' || k === 'extra' || k === 'comments' || k === 'leadingComments' || k === 'trailingComments') continue;
        const v = n[k];
        if (Array.isArray(v)) v.forEach(c => walk(c, n, k)); else if (v && typeof v.type === 'string') walk(v, n, k);
      }
      stack.pop();
    })(ast.program, null, null);
    const byStart = targets.sort((a, b) => a.n.start - b.n.start);
    const q = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
    const add = k => { all.set(k, (all.get(k) || 0) + 1); return k; };
    // Bouw de vervangen broncode recursief op, zodat geneste templates ook meegaan.
    function render(start, end) {
      let out = '', pos = start;
      for (const t of byStart) {
        if (t.n.start < pos || t.n.end > end || t.n.start < start) continue;
        if (byStart.some(o => o !== t && o.n.start <= t.n.start && o.n.end >= t.n.end && o.n.start >= start && o.n.end <= end && (o.n.start < t.n.start || o.n.end > t.n.end) && o.n.start >= pos)) continue;
        out += src.slice(pos, t.n.start) + conv(t);
        pos = t.n.end;
      }
      return out + src.slice(pos, end);
    }
    function conv(t) {
      const n = t.n;
      if (t.kind === 'str') return `T(${q(add(n.value))})`;
      if (t.kind === 'tpl') {
        const key = n.quasis.map((x, i) => x.value.cooked + (i < n.expressions.length ? `{${i}}` : '')).join('');
        return `T(${q(add(key))}${n.expressions.map(e => ', ' + render(e.start, e.end)).join('')})`;
      }
      // html: loop door de hele template en houd bij of we binnen een tag zitten. Tekst buiten tags wordt
      // vertaald; eenvoudige expressies (zonder HTML) mogen in de tekst staan als {0}, {1}.
      const parts = []; // {t:'raw', v} of {t:'expr', i}
      n.quasis.forEach((x, i) => { parts.push({ t: 'raw', v: x.value.raw }); if (i < n.expressions.length) parts.push({ t: 'expr', i }); });
      const exprSrc = i => src.slice(n.expressions[i].start, n.expressions[i].end);
      const simple = i => !/[<`]/.test(exprSrc(i)) && !/T\(/.test(exprSrc(i));
      let out = '`', inTag = false, run = [];
      const flush = () => {
        if (!run.length) return;
        // run: lijst van {t:'txt',v} en {t:'expr',i}
        const txt = run.map(r => (r.t === 'txt' ? r.v : '\u0000')).join('');
        const lead = txt.match(/^\s*/)[0], trail = txt.match(/\s*$/)[0];
        const exprs = run.filter(r => r.t === 'expr');
        let k = 0;
        const key = run.map(r => (r.t === 'txt' ? r.v : `{${k++}}`)).join('').trim();
        const plain = key.replace(/\{\d+\}/g, '').replace(/&[a-z]+;/g, '');
        if (!looksText(plain) || /^[\s{}\d·:,.+×%()\/–-]*$/.test(plain)) {
          out += run.map(r => (r.t === 'txt' ? r.v : '${' + render(n.expressions[r.i].start, n.expressions[r.i].end) + '}')).join('');
        } else {
          out += lead + '${T(' + q(add(key.replace(/\\`/g, '`').replace(/\\\$/g, '$'))) + exprs.map(r => ', ' + render(n.expressions[r.i].start, n.expressions[r.i].end)).join('') + ')}' + trail;
        }
        run = [];
      };
      for (const p of parts) {
        if (p.t === 'expr') {
          if (inTag) out += '${' + render(n.expressions[p.i].start, n.expressions[p.i].end) + '}';
          else if (simple(p.i)) run.push({ t: 'expr', i: p.i });
          else { flush(); out += '${' + render(n.expressions[p.i].start, n.expressions[p.i].end) + '}'; }
          continue;
        }
        for (const ch of p.v) {
          if (!inTag && ch === '<') { flush(); inTag = true; out += ch; continue; }
          if (inTag) { out += ch; if (ch === '>') inTag = false; continue; }
          const last = run[run.length - 1];
          if (last && last.t === 'txt') last.v += ch; else run.push({ t: 'txt', v: ch });
        }
      }
      flush();
      return out + '`';
    }
    const result = render(0, src.length);
    if (WRITE) fs.writeFileSync(f, result);
  }
  const keys = [...all.keys()];
  fs.writeFileSync(process.env.OUT || '/dev/stdout', JSON.stringify(keys, null, 1));
  console.error('teksten:', keys.length, 'woorden:', keys.join(' ').split(/\s+/).length);
})();

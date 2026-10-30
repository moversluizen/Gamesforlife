// Tekeningen in de kern: per hoofdstuk slimmer, van één neuron tot AGI.
(function () {
  const G = window.G;
  const C = 100;
  const dot = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const line = (a, b) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
  const ring = (n, r, off = 0) => Array.from({ length: n }, (_, k) => {
    const t = off + (k / n) * Math.PI * 2;
    return [+(C + Math.cos(t) * r).toFixed(1), +(C + Math.sin(t) * r).toFixed(1)];
  });
  const layers = (xs, counts, span) => xs.map((x, k) => Array.from({ length: counts[k] }, (_, j) =>
    [x, +(C - span / 2 + (counts[k] > 1 ? (span / (counts[k] - 1)) * j : span / 2)).toFixed(1)]));
  const connect = L => L.slice(1).map((col, k) => col.map(b => L[k].map(a => line(a, b)).join('')).join('')).join('');

  G.CORE_ART = [
    // 1. De garage: één perceptron met drie ingangen
    (() => { const ins = [[70, 78], [66, 100], [70, 122]], out = [128, 100];
      return ins.map(a => line(a, out)).join('') + ins.map(p => dot(...p, 4)).join('') + dot(...out, 10); })(),
    // 2. Statistiek: een staafdiagram van woordfrequenties
    [[72, 30], [84, 46], [96, 22], [108, 38], [120, 16], [132, 28]].map(([x, h]) =>
      `<rect x="${x - 4}" y="${122 - h}" width="8" height="${h}" rx="2"/>`).join('') + line([64, 124], [138, 124]),
    // 3. De neurale lente: een netwerk met lagen
    (() => { const L = layers([68, 100, 132], [3, 4, 3], 52); return connect(L) + L.flat().map(p => dot(...p, 4)).join(''); })(),
    // 4. Attention: elk woord kijkt naar alle andere
    (() => { const P = ring(8, 36, -Math.PI / 2); let s = '';
      P.forEach((a, i) => P.slice(i + 1).forEach(b => { s += line(a, b); }));
      return `<g class="thin">${s}</g>` + P.map(p => dot(...p, 4)).join('') + dot(C, C, 6); })(),
    // 5. Taalmodel: een groot, dicht netwerk
    (() => { const L = layers([62, 87, 113, 138], [4, 6, 6, 4], 64); return `<g class="thin">${connect(L)}</g>` + L.flat().map(p => dot(...p, 3)).join(''); })(),
    // 6. Agents: een kern met zelfstandige agents eromheen
    (() => { const P = ring(6, 38, -Math.PI / 2), Q = ring(6, 22, 0);
      return P.map(p => line([C, C], p)).join('') + Q.map((q, i) => line(q, P[i])).join('') +
        P.map(p => dot(...p, 6)).join('') + Q.map(p => dot(...p, 2.5)).join('') + dot(C, C, 9); })(),
    // 7. Intelligentie-explosie: zichzelf herhalende vormen
    [42, 30, 19, 10].map((r, k) => `<polygon class="spin${k % 2}" points="${ring(6, r, k * 0.4).map(p => p.join(',')).join(' ')}"/>`).join('') + dot(C, C, 4),
    // 8. Kardashev: een ster met een ring van collectoren
    `<circle cx="${C}" cy="${C}" r="17"/>` + ring(12, 30).map((p, i) => line(ring(12, 21)[i], p)).join('') +
      `<circle class="hollow" cx="${C}" cy="${C}" r="42"/>` + ring(16, 42).map(p => dot(...p, 2.4)).join(''),
    // 9. AGI: een stralende ster
    `<polygon points="${ring(16, 44, -Math.PI / 2).map((p, i) => (i % 2 ? ring(16, 18, -Math.PI / 2)[i] : p).join(',')).join(' ')}"/>` +
      `<circle class="hollow" cx="${C}" cy="${C}" r="10"/>`,
  ];
})();

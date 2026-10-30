// Talen: T('Nederlandse tekst {0}', waarde) geeft de vertaling in de gekozen taal (of het Nederlands als die ontbreekt).
// De taal wordt bij het opstarten gekozen; wisselen herlaadt het spel, zodat ook alle speldata meteen vertaald is.
window.G = window.G || {};
(function () {
  const KEY = 'road-to-agi-lang';
  G.LANGS = [
    { code: 'nl', flag: '🇳🇱', name: 'Nederlands', country: 'Nederland',      locale: 'nl-NL', dec: ',' },
    { code: 'en', flag: '🇬🇧', name: 'English',    country: 'United Kingdom', locale: 'en-GB', dec: '.' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch',    country: 'Deutschland',    locale: 'de-DE', dec: ',' },
    { code: 'fr', flag: '🇫🇷', name: 'Français',   country: 'France',         locale: 'fr-FR', dec: ',' },
    { code: 'es', flag: '🇪🇸', name: 'Español',    country: 'España',         locale: 'es-ES', dec: ',' },
    { code: 'pt', flag: '🇧🇷', name: 'Português',  country: 'Brasil',         locale: 'pt-BR', dec: ',' },
    { code: 'it', flag: '🇮🇹', name: 'Italiano',   country: 'Italia',         locale: 'it-IT', dec: ',' },
    { code: 'ja', flag: '🇯🇵', name: '日本語',      country: '日本',            locale: 'ja-JP', dec: '.' },
    { code: 'zh', flag: '🇨🇳', name: '简体中文',    country: '中国',            locale: 'zh-CN', dec: '.' },
  ];
  G.I18N = G.I18N || {};

  const read = () => {
    const m = location.hash.match(/lang=([a-z]{2})/);
    if (m) return m[1];
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  };
  const saved = read();
  const guess = ((navigator.language || 'nl').slice(0, 2)).toLowerCase();
  const pick = c => G.LANGS.find(l => l.code === c);
  const lang = pick(saved) || pick(guess) || G.LANGS[1];
  G.LANG = lang.code;
  G.LANG_SET = !!pick(saved);
  G.DEC = lang.dec;
  G.LOCALE = lang.locale;
  document.documentElement.lang = lang.code;

  window.T = (s, ...a) => {
    const d = G.I18N[G.LANG];
    const r = (d && d[s]) || s;
    return a.length ? r.replace(/\{(\d+)\}/g, (m, i) => (a[i] !== undefined ? a[i] : m)) : r;
  };

  G.setLang = code => {
    try { localStorage.setItem(KEY, code); } catch (e) { /* geen opslag: dan via de url */ }
    if (G.save) { try { G.save(); } catch (e) { /* niets */ } }
    location.hash = 'lang=' + code;
    location.reload();
  };

  // Vaste teksten in index.html (knoppen in de menubalk, kopjes, aria-labels).
  G.translateDom = root => {
    if (G.LANG === 'nl') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const t = n.nodeValue.trim();
      if (t && /[A-Za-zÀ-ÿ]{2,}/.test(t)) { const v = T(t); if (v !== t) n.nodeValue = n.nodeValue.replace(t, v); }
    }
    // Korte varianten voor krappe plekken (zoals de menubalk), als die taal er een heeft.
    for (const e of root.querySelectorAll('[data-k]')) { const v = T(e.dataset.k); if (v !== e.dataset.k) e.textContent = v; }
    for (const e of root.querySelectorAll('[aria-label]')) e.setAttribute('aria-label', T(e.getAttribute('aria-label')));
  };
})();

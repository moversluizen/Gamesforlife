// Interface voor chips & supply chain, apps, team, Ada's opdrachten en de helpers rond de kern.
(function () {
  const G = window.G;
  const $ = id => document.getElementById(id);

  // Bouw HTML alleen opnieuw op als de structuur verandert; zo blijven knoppen aanklikbaar.
  const last = {};
  function keyed(el, key, html) {
    if (last[el.id] === key) return false;
    last[el.id] = key;
    el.innerHTML = html;
    return true;
  }
  function set(root, name, v) {
    const e = root.querySelector(`[data-f="${name}"]`);
    if (!e) return;
    if (typeof v !== 'object') { if (e.textContent !== String(v)) e.textContent = v; return; }
    if ('w' in v) e.style.width = v.w;
    if ('t' in v && e.textContent !== v.t) e.textContent = v.t;
    if ('cls' in v) for (const [c, on] of Object.entries(v.cls)) e.classList.toggle(c, on);
    if ('dis' in v) e.disabled = v.dis;
  }
  const rate = n => n < 10 ? n.toFixed(2).replace('.', ',') : G.fmt(n);
  const pct = (a, b) => (b > 0 ? Math.min(100, a / b * 100) : 0) + '%';

  function floatText(e, text) {
    const f = document.createElement('div');
    f.className = 'floater fixed';
    f.textContent = text;
    f.style.left = e.clientX + 'px';
    f.style.top = (e.clientY - 10) + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }
  function pulse(el) { el.animate([{ transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 160 }); }
  const ok = (good, el, e) => {
    if (good) { G.sfx.buy(); G.haptic('LIGHT'); if (el) pulse(el); }
    else G.sfx.error();
    G.uiRefresh(true);
  };

  // ---------- chips ----------
  // Alleen eigen chips: de keten van zand tot chip, daarna het datacenter.
  const OWN_ORDER = [0, 1, 2, 3];
  const stageCard = i => {
    const c = G.CHAIN[i];
    return `<div class="gen" data-act="chain" data-i="${i}" data-f="st${i}">
      <div class="gicon"><span>${c.icon}</span><span class="own" data-f="lv${i}"></span></div>
      <div class="ginfo"><div class="gname">${c.name}</div><div class="grate" data-f="sr${i}"></div>
        <div class="mbar"><i data-f="sm${i}"></i></div><div class="mlabel" data-f="sl${i}"></div></div>
      <button class="gbuy"><span class="q" data-f="sq${i}"></span><span class="c" data-f="sc${i}"></span></button>
    </div>`;
  };
  function buildChips() {
    const body = $('chipBody');
    if (body.dataset.built) return;
    body.dataset.built = '1';
    body.innerHTML = `
      <div class="ind-card">
        <div class="stats3">
          <div><small>Rekenkracht</small><b data-f="cmp"></b></div>
          <div><small>Bonus</small><b data-f="bonus"></b></div>
          <div><small>Chips</small><b data-f="chips"></b></div>
        </div>
        <div class="bar"><i data-f="fill"></i></div>
        <p class="muted" data-f="status"></p>
      </div>
      <div class="subhead">Keten <span class="muted">· de traagste schakel telt</span></div>
      ${OWN_ORDER.map(stageCard).join('')}
      <div class="subhead">Datacenter</div>
      ${stageCard(4)}
      <div class="subhead">Chipontwikkeling</div>
      <div id="rnd" class="ind-card rnd"></div>`;
    const node = i => `<div class="fnode" data-f="fn${i}"><span>${G.CHAIN[i].icon}</span><small data-f="fc${i}"></small></div>`;
    $('csFlow').innerHTML =
      OWN_ORDER.map((i, k) => (k ? `<span class="arrow" data-f="ar${i}"><i></i><i></i></span>` : '') + node(i)).join('') +
      `<span class="arrow" data-f="ar4"><i></i><i></i></span>` + node(4);
    if (!$('csChip').dataset.bound) $('csChip').addEventListener('pointerdown', e => {
      e.preventDefault();
      G.ui.tapAt(e.clientX, e.clientY, false);
      const cut = G.boostRnd();
      if (cut) floatText(e, '−' + (cut / 1000).toFixed(1).replace('.', ',') + ' s');
      $('csChip').classList.add('hit');
      setTimeout(() => $('csChip').classList.remove('hit'), 80);
    });
    $('csChip').dataset.bound = '1';
    body.addEventListener('click', e => {
      const t = e.target.closest('[data-act]');
      if (!t) return;
      const act = t.dataset.act;
      if (act === 'chain') ok(G.buyChain(+t.dataset.i), t);
      else if (act === 'design-lab') G.uiRes.open('lab', 'lab_design');
      else if (act === 'rnd-research') G.uiRes.open('chips', 'tc' + (G.S.chipGen + 1));
      else if (act === 'rnd-start') {
        if (G.startRnd()) { G.sfx.upgrade(); G.haptic('MEDIUM'); G.ui.toast('🔬', 'Ontwikkeling gestart', 'Tik op de chip bovenin om het te versnellen.'); }
        else G.sfx.error();
        G.uiRefresh(true);
      } else if (act === 'rnd-boost') {
        const cut = G.boostRnd();
        if (cut) { G.sfx.tap(); G.haptic('LIGHT'); floatText(e, '−' + (cut / 1000).toFixed(1).replace('.', ',') + ' s'); }
        G.uiRefresh(false);
      }
    });
  }

  function updateChips() {
    buildChips();
    const body = $('chipBody'), S = G.S, flow = $('csFlow');
    const active = G.ownChainActive(), b = G.bottleneck(), slots = G.slots();
    set(body, 'cmp', G.fmt(G.compute()));
    set(body, 'bonus', G.fmtMult(G.computeBonus()));
    set(body, 'chips', `${G.fmt(Math.floor(S.chips))} / ${G.fmt(slots)}`);
    set(body, 'fill', { w: pct(S.chips, slots) });
    const share = G.newShare();
    // Alleen een statusregel als er iets te doen is.
    const status = !active || !S.chain[4] ? 'Bouw alle vier schakels en een datacenter.'
      : G.chipsFull() && share > 0.999 ? 'Datacenter vol: breid uit voor meer rekenkracht.' : '';
    set(body, 'status', status);
    G.CHAIN.forEach((c, i) => {
      const cost = G.chainCost(i);
      set(flow, 'fc' + i, i === 4 ? G.fmt(slots) : rate(G.stageCap(i)) + '/s');
      set(flow, 'fn' + i, { cls: { bn: active && i === b, off: !S.chain[i] } });
      if (i > 0 && i <= 4) set(flow, 'ar' + i, { cls: { live: i === 4 ? S.chain[4] > 0 && G.chipRate() > 0 : active } });
      set(body, 'st' + i, { cls: { can: S.tokens >= cost } });
      set(body, 'lv' + i, S.chain[i]);
      const nx = G.stageNextMs(i), pv = G.CHAIN_MS[G.CHAIN_MS.indexOf(nx) - 1] || 0;
      set(body, 'sr' + i, (i === 4 ? `${G.fmt(slots)} plekken` : `${rate(G.stageCap(i))} chips/s`) + (active && i === b ? ' · traagste' : nx ? ` · 2× bij ${nx}` : ''));
      set(body, 'sm' + i, { w: nx ? ((S.chain[i] - pv) / (nx - pv) * 100) + '%' : '100%' });
      set(body, 'sl' + i, nx ? `2× ${i === 4 ? 'ruimte' : 'capaciteit'} bij niveau ${nx}` : 'Alle mijlpalen gehaald');
      set(body, 'sq' + i, (S.chain[i] ? 'uitbreiden' : 'bouwen') + (nx === S.chain[i] + 1 ? ' ⭐' : ''));
      set(body, 'sc' + i, G.fmt(cost));
    });
    updateRnd();
    // speelveld
    const c = G.chip();
    if ($('csIcon').textContent !== c.icon) { $('csIcon').textContent = c.icon; $('csName').textContent = `${c.name} · ${c.node}`; }
    $('csCompute').textContent = '';
    $('csHint').textContent = S.rnd
      ? `${G.CHIPS[S.rnd.gen].name}: nog ${G.fmtTime(Math.ceil(Math.max(0, S.rnd.end - Date.now()) / 1000))} · tik op de chip om te versnellen`
      : share < 0.999 ? `Nieuwe chips vervangen de oude: ${Math.floor(share * 100)}%` : '';
    $('csChip').classList.toggle('busy', !!S.rnd);
  }

  // Chipontwikkeling: de balk met generaties, daaronder alleen wat je nodig hebt voor de volgende.
  function updateRnd() {
    const el = $('rnd'), S = G.S, cur = G.chip(), nx = G.nextChip();
    const track = `<div class="track">${G.CHIPS.map((c, i) => `<span class="${i < S.chipGen ? 'done' : i === S.chipGen ? 'cur' : S.rnd && S.rnd.gen === i ? 'busy' : ''}" title="${c.name}">${c.icon}</span>`).join('<i></i>')}</div>
      <p class="rnd-now">Nu: <b>${cur.name}</b> · ×${G.fmt(cur.power)} per chip</p>`;
    if (S.rnd) {
      const t = G.CHIPS[S.rnd.gen];
      keyed(el, 'run' + S.rnd.gen, track + `<button class="rnd-run" data-act="rnd-boost">
        <span class="rnd-line"><b>${t.name}</b><span data-f="rleft"></span></span>
        <span class="bar big"><i data-f="rbar"></i></span>
        <span class="tapme">Tik om te versnellen</span></button>`);
      const left = Math.max(0, S.rnd.end - Date.now());
      set(el, 'rleft', 'nog ' + G.fmtTime(Math.ceil(left / 1000)));
      set(el, 'rbar', { w: (100 * (1 - left / S.rnd.total)) + '%' });
      return;
    }
    if (!nx) { keyed(el, 'max', track + '<p class="muted">Je hebt de krachtigste chip die er bestaat.</p>'); return; }
    const litho = S.chain[2] >= nx.litho, aff = S.tokens >= nx.cost, tech = G.chipTech(S.chipGen + 1), known = G.techDone(tech.id), design = !G.chipNeedsDesign(S.chipGen + 1);
    const req = [];
    if (!known) req.push(`<button class="req-row" data-act="rnd-research"><span>Eerst onderzoeken: <b>${tech.name}</b></span><i>›</i></button>`);
    if (!design) req.push(`<button class="req-row" data-act="design-lab"><span>Eerst lab: <b>Chipontwerpstudio</b></span><i>›</i></button>`);
    if (!litho) req.push(`<p class="req no">Nodig: ${nx.litho} EUV-machines (je hebt er ${S.chain[2]})</p>`);
    keyed(el, ['ready', S.chipGen, S.chain[2], litho, aff, known, design, G.hl('design')].join('|'), track + `
      <div class="rnd-next">
        <p class="rnd-line"><b>Volgende: ${nx.name}</b><span>×${G.fmt(nx.power)} per chip · ${G.fmtTime(nx.time * G.mods.rndTime)}</span></p>
        ${req.join('')}
        <button class="cta" data-act="rnd-start" ${litho && aff && known && design ? '' : 'disabled'}>ontwikkelen · ${G.fmt(nx.cost)}</button>
      </div>`);
  }

  // ---------- apps ----------
  function appStatus(a) {
    const s = G.S.apps[a.id] || {};
    if (!G.appUnlocked(a) && !s.v && !s.b) return 'locked';
    if (s.b) return 'building';
    return s.v ? 'live' + s.v : 'new';
  }

  // Apps: overzichtskaart bovenaan, daaronder compacte kaarten per groep (zoals Chips en Team).
  function appCard(a) {
    const st = appStatus(a), s = G.S.apps[a.id] || {};
    const icon = `<div class="gicon"><span>${a.icon}</span>${s.v ? `<span class="own">v${s.v}</span>` : ''}</div>`;
    if (st === 'locked') {
      const tech = G.appTech(a), known = !G.appNeedsTech(a), model = G.S.owned[a.model] >= a.n;
      return `<div class="gen locked-h" ${known ? '' : `data-act="app-research" data-id="${a.id}"`}>${icon}
        <div class="ginfo"><div class="gname">${a.name}</div>
          <div class="grate">Eerst: ${[known ? '' : tech.name, model ? '' : `${a.n}× ${G.GENS[a.model].name}`].filter(Boolean).join(' en ')}</div></div>
        ${known ? '<span></span>' : `<button class="gbuy"><span class="q">onderzoeken</span><span class="c">${G.fmt(tech.cost)}</span></button>`}</div>`;
    }
    if (st === 'new') return `<div class="gen" data-act="app-build" data-id="${a.id}" data-f="ap-${a.id}">${icon}
      <div class="ginfo"><div class="gname">${a.name}</div><div class="grate">Bouwtijd ${G.fmtTime(a.time)}</div>
        <div class="mlabel">${a.desc}</div></div>
      <button class="gbuy"><span class="q">bouwen</span><span class="c">${G.fmt(G.appCost(a))}</span></button></div>`;
    if (st === 'building') return `<div class="gen">${icon}
      <div class="ginfo"><div class="gname">${a.name}</div><div class="grate">In aanbouw · <span data-f="bl-${a.id}"></span></div>
        <div class="mbar"><i data-f="bb-${a.id}"></i></div></div><span></span></div>`;
    return `<div class="gen app-live" data-f="ap-${a.id}">${icon}
      <div class="ginfo"><div class="gname">${a.name} <span class="fire-badge" data-f="ht-${a.id}">🔥</span></div>
        <div class="grate"><span data-f="au-${a.id}"></span> gebruikers</div>
        <div class="mbar users"><i data-f="ab-${a.id}"></i></div></div>
      <button class="gbuy" data-act="app-build" data-id="${a.id}"><span class="q">nieuwe versie</span><span class="c" data-f="avc-${a.id}"></span></button></div>`;
  }

  function updateApps() {
    const list = $('appList'), S = G.S;
    const groups = { live: [], start: [], next: [] };
    let lockedShown = false;
    for (const a of G.APPS) {
      const st = appStatus(a);
      if (st.startsWith('live')) groups.live.push(a);
      else if (st === 'new' || st === 'building') groups.start.push(a);
      else if (!lockedShown) { groups.next.push(a); lockedShown = true; }
    }
    const key = G.APPS.map(a => appStatus(a) + (G.appNeedsTech(a) ? 't' : '')).join(',') + '|' + groups.next.map(a => a.id + G.S.owned[a.model]).join();
    const section = (title, arr) => arr.length ? `<div class="subhead">${title}</div>${arr.map(appCard).join('')}` : '';
    if (keyed(list, key, `
      <div class="ind-card">
        <div class="stats3">
          <div><small>Gebruikers</small><b data-f="as-u"></b></div>
          <div><small>Data-bonus</small><b data-f="as-d"></b></div>
          <div><small>Apps live</small><b data-f="as-n"></b></div>
        </div>
        <div class="bar"><i data-f="as-bar"></i></div>
        <p class="muted" data-f="as-st"></p>
      </div>` +
      section('Live', groups.live) + section('Nieuw en in aanbouw', groups.start) + section('Hierna', groups.next))) {
      if (!list.dataset.bound) {
        list.dataset.bound = '1';
        list.addEventListener('click', e => {
          const t = e.target.closest('[data-act]');
          if (!t) return;
          const a = G.APPS.find(x => x.id === t.dataset.id);
          if (t.dataset.act === 'app-research') { G.uiRes.open('apps', 'ta' + G.APPS.indexOf(a)); return; }
          if (t.dataset.act === 'app-build') {
            const wasNew = !G.app(a.id).v;
            if (G.buildApp(a)) {
              G.sfx.upgrade(); G.haptic('MEDIUM');
              if (!wasNew) G.ui.toast(a.icon, `${a.name} v${G.app(a.id).v}: ${G.appFeature(G.app(a.id).v)}`, '2× gebruikers en 2× data per gebruiker.');
            } else G.sfx.error();
          } else if (t.dataset.act === 'app-mkt') {
            if (G.campaign(a)) { G.sfx.eureka(); G.haptic('MEDIUM'); floatText(e, '📣 +' + G.fmt(G.appCap(a) * 0.15 + 10)); }
            else G.sfx.error();
          }
          G.uiRefresh(true);
        });
      }
    }
    const now = Date.now();
    let users = 0;
    for (const a of groups.start) {
      const s = G.S.apps[a.id] || {};
      if (s.b) {
        const left = Math.max(0, s.b - now);
        set(list, 'bl-' + a.id, 'nog ' + G.fmtTime(Math.ceil(left / 1000)));
        set(list, 'bb-' + a.id, { w: (100 * (1 - left / (a.time * 1000))) + '%' });
      } else set(list, 'ap-' + a.id, { cls: { can: S.tokens >= G.appCost(a) } });
    }
    for (const a of groups.live) {
      const s = G.S.apps[a.id];
      users += s.u;
      set(list, 'au-' + a.id, G.fmt(Math.floor(s.u)));
      set(list, 'ar-' + a.id, G.fmt(G.appData(a)));
      set(list, 'ab-' + a.id, { w: pct(s.u, G.appCap(a)) });
      set(list, 'ht-' + a.id, { cls: { on: G.trending(a) } });
      set(list, 'avc-' + a.id, G.fmt(G.appCost(a)));
      set(list, 'ap-' + a.id, { cls: { can: S.tokens >= G.appCost(a) } });
    }
    // Overzicht: de balk loopt naar de volgende stap van de data-bonus (elke 10× meer data).
    const data = G.dataValue(), lg = Math.log10(1 + data), frac = lg % 1;
    set(list, 'as-u', G.fmt(Math.floor(users)));
    set(list, 'as-d', G.fmtMult(G.dataBonus()));
    set(list, 'as-n', `${groups.live.length} / ${G.APPS.length}`);
    set(list, 'as-bar', { w: (groups.live.length ? frac * 100 : 0) + '%' });
    const tr = S.trend && S.trend.until > now ? G.APPS.find(a => a.id === S.trend.id) : null;
    set(list, 'as-st', !groups.live.length ? 'Lanceer je eerste app. Gebruikers leveren data, en data maakt je modellen sneller.'
      : tr ? `${tr.name} is trending · nog ${Math.ceil((S.trend.until - now) / 1000)} s`
      : G.trendOffer ? `${G.APPS.find(a => a.id === G.trendOffer.id).name} gaat viraal! Tik erop in de telefoon.` : '');

    $('appHead').textContent = '';
  }

  // ---------- apps-speelveld: een telefoon met je apps ----------
  let reviewAt = 0, upAt = 0;
  function updateAppsStage() {
    const grid = $('asGrid'), S = G.S, now = Date.now();
    const key = G.APPS.map(a => appStatus(a)).join(',');
    if (grid.dataset.k !== key) {
      grid.dataset.k = key;
      grid.innerHTML = G.APPS.map(a => {
        const st = appStatus(a);
        return `<button class="as-app ${st.startsWith('live') ? 'live' : st}" data-id="${a.id}">
          <span class="as-ic">${st === 'locked' ? '' : st === 'building' ? '👷' : a.icon}</span>
          <span class="as-u" data-f="u-${a.id}">${st === 'new' ? 'nieuw' : ''}</span><span class="as-fire">🔥</span></button>`;
      }).join('');
      if (!grid.dataset.bound) {
        grid.dataset.bound = '1';
        grid.addEventListener('pointerdown', e => {
          const b = e.target.closest('.as-app');
          if (!b) return;
          e.preventDefault();
          const a = G.APPS.find(x => x.id === b.dataset.id);
          if (G.trendOffer && G.trendOffer.id === a.id) {
            G.claimTrend();
            G.sfx.eureka(); G.haptic('HEAVY'); G.fx.wave();
            G.ui.toast('🔥', `${a.name} is trending!`, '45 seconden: 5× snellere groei en 50% meer ruimte voor gebruikers.');
          } else if (G.app(a.id).v) {
            const add = G.promoteApp(a);
            G.ui.tapAt(e.clientX, e.clientY, false);
            floatText(e, add >= 1 ? '+' + G.fmt(add) + ' 👤' : 'Vol: nieuwe versie nodig');
          } else { G.ui.switchTab('apps'); return; }
          b.animate([{ transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 180 });
          G.uiRefresh(false);
        });
      }
    }
    let users = 0;
    for (const a of G.APPS) {
      const s = S.apps[a.id];
      const btn = grid.querySelector(`[data-id="${a.id}"]`);
      if (!btn) continue;
      btn.classList.toggle('offer', !!(G.trendOffer && G.trendOffer.id === a.id));
      btn.classList.toggle('trend', G.trending(a));
      if (s && s.v) { users += s.u; set(grid, 'u-' + a.id, G.fmt(Math.floor(s.u))); }
    }
    $('asUsers').textContent = G.fmt(Math.floor(users));
    // Campagne: één knop voor al je live apps tegelijk.
    const live = G.APPS.filter(a => (S.apps[a.id] || {}).v > 0);
    const cdAll = live.length ? Math.max(0, Math.min(...live.map(a => (S.apps[a.id].cd || 0) - now))) : 0;
    const mkt = $('asMkt'), mt = !live.length ? 'campagne' : cdAll ? `nog ${Math.ceil(cdAll / 1000)} s` : 'campagne';
    if (mkt.textContent !== mt) mkt.textContent = mt;
    mkt.disabled = !live.length || cdAll > 0;
    if (!mkt.dataset.bound) {
      mkt.dataset.bound = '1';
      mkt.addEventListener('click', e => {
        const n = G.APPS.filter(a => G.campaign(a)).length;
        if (n) { G.sfx.eureka(); G.haptic('MEDIUM'); floatText(e, '+15% gebruikers'); } else G.sfx.error();
        G.uiRefresh(true);
      });
    }
    $('asData').textContent = G.fmtMult(G.dataBonus());
    const tr = S.trend && S.trend.until > now ? G.APPS.find(a => a.id === S.trend.id) : null;
    const trTxt = tr ? `🔥 ${tr.name} trending · ${Math.ceil((S.trend.until - now) / 1000)} s`
      : G.trendOffer ? `${G.APPS.find(a => a.id === G.trendOffer.id).name} gaat viraal! Tik erop` : G.appsLive() ? 'Tik op een app voor extra gebruikers' : 'Bouw je eerste app hieronder';
    if ($('asTrend').textContent !== trTxt) $('asTrend').textContent = trTxt;
    $('asTrend').classList.toggle('hot', !!(tr || G.trendOffer));

    // gebruikers die omhoog zweven
    if (now > upAt && G.appsLive()) {
      upAt = now + 350;
      const live = [...grid.querySelectorAll('.as-app.live')];
      const b = live[(Math.random() * live.length) | 0];
      if (b && grid.querySelectorAll('.as-up').length < 8) {
        const u = document.createElement('span');
        u.className = 'as-up'; u.textContent = '👤';
        u.style.left = (b.offsetLeft + b.offsetWidth / 2) + 'px';
        u.style.top = b.offsetTop + 'px';
        grid.appendChild(u);
        setTimeout(() => u.remove(), 1400);
      }
    }
    // reviews
    if (now > reviewAt) {
      reviewAt = now + 6000;
      const live = G.APPS.filter(a => (S.apps[a.id] || {}).v > 0);
      const el = $('asReview');
      if (live.length) {
        const a = live[(Math.random() * live.length) | 0], st = G.appStars(a);
        el.textContent = `${'★'.repeat(st)}${'☆'.repeat(5 - st)} "${G.REVIEWS[(Math.random() * G.REVIEWS.length) | 0]}" over ${a.name}`;
      } else el.textContent = '';
    }
  }

  // ---------- team ----------
  // Eén helperkaart, gebruikt in Team en (voor de safety-engineer) in Veiligheid.
  function helperCard(h) {
    if (!G.helperUnlocked(h)) {
      const lab = G.techById(G.HELPER_LAB[h.id]);
      return `<div class="gen helper locked-h" data-act="helper-lab" data-id="${lab.id}">
        <div class="gicon"><span>${h.icon}</span></div>
        <div class="ginfo"><div class="gname">${h.name}</div>
          <div class="grate">Eerst: lab ${lab.name}</div></div>
        <button class="gbuy"><span class="q">onderzoeken</span><span class="c">${G.fmt(lab.cost)}</span></button></div>`;
    }
    const l = G.hl(h.id), max = l >= h.max, r = G.rank(h), lv = G.rankLevels(h);
    const next = lv[r + 1], prev = lv[r];
    return `<div class="gen helper" data-act="hire" data-id="${h.id}" data-f="hc-${h.id}">
      <div class="gicon"><span>${G.rankIcon(h)}</span>${l ? `<span class="own">${l}</span>` : ''}</div>
      <div class="ginfo"><div class="gname">${l ? G.rankName(h) : h.name}</div>
        <div class="grate">${l ? h.eff(G.effAt(h, l), l) : h.eff(G.effAt(h, 1), 1)}</div>
        <div class="mbar"><i style="width:${next == null ? 100 : (l - prev) / (next - prev) * 100}%"></i></div></div>
      <button class="gbuy"${max ? ' disabled' : ''}><span class="q">${max ? 'maximaal' : l ? 'promoveren' + (next === l + 1 ? ' ⭐' : '') : 'aannemen'}</span><span class="c">${max ? '–' : G.fmt(G.helperCost(h))}</span></button>
    </div>`;
  }
  function onHelperClick(e) {
    const lk = e.target.closest('[data-act="helper-lab"]');
    if (lk) { G.uiRes.open('lab', lk.dataset.id); return true; }
    const t = e.target.closest('[data-act="hire"]');
    if (!t) return false;
    const h = G.HELPERS.find(x => x.id === t.dataset.id), first = !G.hl(h.id), r0 = G.rank(h);
    if (G.hire(h)) {
      G.sfx.milestone(); G.haptic('MEDIUM');
      const l = G.hl(h.id);
      if (G.rank(h) > r0) { G.sfx.big(); G.fx.wave(); G.ui.toast(G.rankIcon(h), `Promotie: ${G.rankName(h)}!`, h.eff(G.effAt(h, l), l)); }
      else G.ui.toast(G.rankIcon(h), first ? `${h.name} aangenomen!` : `${G.rankName(h)} → niveau ${l}`, h.eff(G.effAt(h, l), l));
      buildOrbit(true);
    } else G.sfx.error();
    G.uiRefresh(true);
    return true;
  }

  // Team: alle helpers behalve de safety-engineer (die zit in Veiligheid).
  const TEAM = () => G.HELPERS.filter(h => h.id !== 'safety');
  function updateTeam() {
    const list = $('teamList'), S = G.S, team = TEAM();
    const key = team.map(h => G.hl(h.id) + (G.helperUnlocked(h) ? '' : 'x')).join(',') + '|' + Object.keys(S.lab).length;
    const roles = team.filter(h => G.hl(h.id)).length, levels = team.reduce((t, h) => t + G.hl(h.id), 0), depts = G.LAB.filter(([id]) => G.labDone(id)).length;
    if (keyed(list, key, `<div class="ind-card">
        <div class="stats3">
          <div><small>Helpers</small><b>${roles} / ${team.length}</b></div>
          <div><small>Niveaus</small><b>${levels}</b></div>
          <div><small>Afdelingen</small><b>${depts} / ${G.LAB.length}</b></div>
        </div>
        <div class="bar"><i style="width:${depts / G.LAB.length * 100}%"></i></div>
      </div>
      <div class="subhead">Helpers</div>${team.map(helperCard).join('')}`)) {
      if (!list.dataset.bound) { list.dataset.bound = '1'; list.addEventListener('click', onHelperClick); }
    }
    for (const h of team) set(list, 'hc-' + h.id, { cls: { can: G.hl(h.id) < h.max && S.tokens >= G.helperCost(h) } });
    $('teamHead').textContent = '';
  }

  // ---------- veiligheid ----------
  // Overzicht (veiligheid, risico, backlashes), dan de safety-engineer, veiligheidsonderzoek en protocollen.
  const SAFETY_RES = () => G.UPGRADES.filter(u => u.kind === 'safety');
  function safetyItemCard(u) {
    const proto = u.kind === 'protocol';
    return `<div class="gen res-card" data-act="sbuy" data-id="${u.id}" data-f="sb-${u.id}">
      <div class="gicon"><span>${u.icon}</span></div>
      <div class="ginfo"><div class="gname">${u.name}</div><div class="grate">${proto ? u.desc : `+${u.mult} veiligheid`}</div>
        ${proto ? `<div class="mlabel">${u.year}</div>` : ''}</div>
      <button class="gbuy"><span class="q">${proto ? 'invoeren' : 'onderzoeken'}</span><span class="c">${G.fmt(u.cost)}</span></button></div>`;
  }
  const lockedCard = (u, why) => `<div class="gen locked-h res-card"><div class="gicon"><span>${u.icon}</span></div>
    <div class="ginfo"><div class="gname">${u.name}</div><div class="grate">${why}</div></div><span></span></div>`;
  function updateSafety() {
    const body = $('safetyBody'), S = G.S, sh = G.HELPERS.find(h => h.id === 'safety');
    const open = arr => arr.filter(u => !S.upgrades[u.id] && u.unlock(S));
    const res = SAFETY_RES(), resOpen = open(res), resNext = res.find(u => !S.upgrades[u.id] && !u.unlock(S));
    const pro = G.UPGRADES.filter(u => u.kind === 'protocol'), proOpen = open(pro), proNext = pro.find(u => !S.upgrades[u.id] && !u.unlock(S));
    const proDone = pro.filter(u => S.upgrades[u.id]);
    const key = [G.hl('safety'), resOpen.map(u => u.id), proOpen.map(u => u.id), proDone.length, resNext && resNext.id, proNext && proNext.id].join('|');
    if (keyed(body, key, `<div class="ind-card" data-f="sum">
        <div class="stats3">
          <div><small>Veiligheid</small><b data-f="pts"></b></div>
          <div><small>Risico</small><b data-f="rk"></b></div>
          <div><small>Backlashes</small><b data-f="bl"></b></div>
        </div>
        <div class="bar risk"><i data-f="rbar"></i></div>
        <p class="muted" data-f="st"></p>
      </div>
      <div class="subhead">Team</div>${helperCard(sh)}
      <div class="subhead">Onderzoek <span class="muted">· ${res.filter(u => S.upgrades[u.id]).length} van ${res.length}</span></div>
      ${resOpen.map(safetyItemCard).join('')}${resNext ? lockedCard(resNext, resNext.lockText) : ''}
      <div class="subhead">Protocollen <span class="muted">· ${proDone.length} van ${pro.length}</span></div>
      ${proOpen.map(safetyItemCard).join('')}${proNext ? lockedCard(proNext, proNext.lockText) : ''}
      ${proDone.length ? `<p class="done-list">Ingevoerd: ${proDone.map(u => u.name).join(' · ')}</p>` : ''}`)) {
      if (!body.dataset.bound) {
        body.dataset.bound = '1';
        body.addEventListener('click', e => {
          if (onHelperClick(e)) return;
          const t = e.target.closest('[data-act="sbuy"]');
          if (!t) return;
          const u = G.techById(t.dataset.id);
          if (G.buyUpgrade(u.id)) { G.sfx.upgrade(); G.haptic('MEDIUM'); G.ui.toast(u.icon, u.name, u.kind === 'protocol' ? `${u.year}: ${u.story}` : `+${u.mult} veiligheid`); }
          else G.sfx.error();
          G.uiRefresh(true);
        });
      }
    }
    const need = G.safetyNeed(), pts = G.safetyPoints(), def = G.safetyDeficit(), calm = G.calmLeft();
    set(body, 'pts', { t: `${G.fmt(pts)} / ${G.fmt(need)}`, cls: { bad: def > 0 } });
    set(body, 'rk', { t: Math.floor(S.risk) + '%', cls: { bad: S.risk >= 50 } });
    set(body, 'bl', S.backlashes);
    set(body, 'rbar', { w: S.risk + '%' });
    set(body, 'st', need === 0 ? 'Nog niet nodig. Vanaf de LSTM vragen je modellen om veiligheid.'
      : calm && def ? `Rustperiode na de backlash: nog ${G.fmtTime(Math.ceil(calm))}. Werk je veiligheid nu bij.`
      : def ? `${G.fmt(def)} veiligheid tekort: het risico stijgt ${(G.riskPerSec() * 60).toFixed(1).replace('.', ',')}% per minuut. Bij 100% volgt een backlash.`
      : S.lastIncident ? `Veiligheid op orde. Laatste incident: ${S.lastIncident}.` : 'Veiligheid op orde: geen risico.');
    set(body, 'hc-safety', { cls: { can: G.hl('safety') < sh.max && S.tokens >= G.helperCost(sh) } });
    for (const u of [...resOpen, ...proOpen]) set(body, 'sb-' + u.id, { cls: { can: S.tokens >= u.cost } });
  }

  // ---------- helpers rond de kern ----------
  let orbitKey = '';
  function buildOrbit() {
    const ids = G.HELPERS.filter(h => G.hl(h.id)).map(h => h.id);
    const key = ids.map(id => id + G.rank(G.HELPERS.find(h => h.id === id))).join(',');
    if (key === orbitKey) return;
    orbitKey = key;
    $('orbit').innerHTML = ids.map((id, i) => {
      const h = G.HELPERS.find(x => x.id === id);
      return `<span class="hav" data-id="${id}" style="--a:${(360 / ids.length) * i}deg"><i>${G.rankIcon(h)}</i></span>`;
    }).join('');
  }
  G.helperPos = id => {
    const el = document.querySelector(`#orbit .hav[data-id="${id}"] i`);
    return el ? el.getBoundingClientRect() : null;
  };

  // ---------- Ada's opdracht ----------
  function updateQuest() {
    const el = $('quest'), q = G.questNow();
    if (!q) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    const [have, need] = q.goal(G.S), done = have >= need;
    $('questNum').textContent = `${G.S.quest + 1}/${G.QUESTS.length}`;
    $('questText').textContent = q.text + (need > 1 && have < need ? ` (${G.fmt(have)}/${G.fmt(need)})` : '');
    $('questBar').style.width = pct(have, need);
    $('questReward').textContent = done ? `Claim +${G.fmt(G.questReward(q))}` : `+${G.fmt(G.questReward(q))}`;
    el.classList.toggle('done', done);
  }
  $('quest').addEventListener('click', e => {
    const q = G.questNow();
    if (!q) return;
    const r = G.claimQuest();
    if (r) {
      G.sfx.achievement(); G.haptic('HEAVY');
      floatText(e, '+' + G.fmt(r));
      G.fx.wave();
      const nq = G.questNow();
      G.ui.toast('🤖', 'Goed gedaan!', nq ? 'Nieuwe opdracht: ' + nq.text : 'Je hebt alle opdrachten voltooid!');
    } else if (q.tree) G.uiRes.open(q.tree);
    else if (q.tab) G.ui.switchTab(q.tab);
    G.uiRefresh(true);
  });

  // ---------- rode stippen ----------
  function updateDots() {
    const S = G.S;
    $('dotChips').classList.toggle('show', G.tabUnlocked('chips') && (G.canStartRnd() || [0, 1, 2, 3, 4].some(i => !S.chain[i] && S.tokens >= G.chainCost(i))));
    $('dotApps').classList.toggle('show', G.tabUnlocked('apps') && G.APPS.some(a => !G.app(a.id).v && !G.app(a.id).b && G.appUnlocked(a) && S.tokens >= G.appCost(a)));
    $('dotTeam').classList.toggle('show', G.tabUnlocked('team') && TEAM().some(h => G.helperUnlocked(h) && !G.hl(h.id) && S.tokens >= G.helperCost(h)));
    $('dotSafety').classList.toggle('show', G.tabUnlocked('safety') && (G.safetyDeficit() > 0 || (!G.hl('safety') && S.tokens >= G.helperCost(G.HELPERS[1]))));
  }

  G.uiInd = {
    update(tab, force) {
      updateQuest();
      updateDots();
      buildOrbit();
      if (tab === 'chips') updateChips();
      if (tab === 'apps') { updateApps(); updateAppsStage(); }
      if (tab === 'team') updateTeam();
      if (tab === 'safety') updateSafety();
    },
    reset() { for (const k in last) delete last[k]; orbitKey = ''; $('chipBody').removeAttribute('data-built'); buildOrbit(); },
    buildOrbit,
  };
})();

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
  // Volgorde in beeld: eerst inkopen en een datacenter, later je eigen fabriek.
  const BUY_ORDER = [5, 4], OWN_ORDER = [0, 1, 2, 3];
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
          <div><small>Bonus op modellen</small><b data-f="bonus"></b></div>
          <div><small>Chips</small><b data-f="chips"></b></div>
        </div>
        <div class="bar"><i data-f="fill"></i></div>
        <p class="muted" data-f="status"></p>
      </div>
      <div id="rnd" class="ind-card rnd"></div>
      <div class="subhead">Inkopen en plaatsen</div>
      ${BUY_ORDER.map(stageCard).join('')}
      <div class="subhead">Eigen fabriek <span class="muted">· de traagste schakel bepaalt de output</span></div>
      <div id="ownLock"></div>
      <div id="ownCards">${OWN_ORDER.map(stageCard).join('')}</div>`;
    const node = i => `<div class="fnode" data-f="fn${i}"><span>${G.CHAIN[i].icon}</span><small data-f="fc${i}"></small></div>`;
    $('csFlow').innerHTML = node(5) + '<span class="fplus">+</span>' +
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
      else if (act === 'own-lab') G.uiRes.open('lab', 'lab_eng');
      else if (act === 'design-lab') G.uiRes.open('lab', 'lab_design');
      else if (act === 'rnd-research') G.uiRes.open('chips', 'tc' + (G.S.chipGen + 1));
      else if (act === 'rnd-start') {
        if (G.startRnd()) { G.sfx.upgrade(); G.haptic('MEDIUM'); G.ui.toast('🔬', 'Ontwikkeling gestart', 'Tik op het project om het te versnellen.'); }
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
    const own = G.ownFab(), active = G.ownChainActive(), b = G.bottleneck(), slots = G.slots();
    set(body, 'cmp', G.fmt(G.compute()));
    set(body, 'bonus', G.fmtMult(G.computeBonus()));
    set(body, 'chips', `${G.fmt(Math.floor(S.chips))} / ${G.fmt(slots)}`);
    set(body, 'fill', { w: pct(S.chips, slots) });
    const share = G.newShare();
    let status;
    if (!S.chain[4] || !S.chain[5]) status = 'Bouw een datacenter en koop chips in. Chips geven rekenkracht, en rekenkracht maakt al je modellen sneller.';
    else if (share < 0.999) status = `${G.chip().name}: ${Math.floor(share * 100)}% van je chips vervangen · ${rate(G.chipRate())} chips/s`;
    else if (G.chipsFull()) status = 'Datacenter vol. Breid uit voor meer rekenkracht.';
    else status = `${rate(G.chipRate())} chips/s · ${G.chip().name} · ${G.fmtMult(G.chip().power)} per chip`;
    set(body, 'status', status);
    $('ownLock').innerHTML = own ? '' : `<div class="gen locked-h" data-act="own-lab"><div class="gicon"><span>🏭</span></div>
      <div class="ginfo"><div class="gname">Nog geen eigen fabriek</div><div class="grate eff">🔬 Lab: Eigen chipfabriek</div></div>
      <button class="gbuy"><span class="q">onderzoeken</span><span class="c">${G.fmt(G.techById('lab_eng').cost)}</span></button></div>`;
    $('ownCards').classList.toggle('hidden', !own);
    G.CHAIN.forEach((c, i) => {
      const isOwn = i < 4, cost = G.chainCost(i);
      set(flow, 'fc' + i, i === 4 ? G.fmt(slots) : isOwn && !own ? '🔒' : rate(G.stageCap(i)) + '/s');
      set(flow, 'fn' + i, { cls: { bn: active && i === b, off: !S.chain[i], lock: isOwn && !own } });
      if (i > 0 && i <= 4) set(flow, 'ar' + i, { cls: { live: i === 4 ? S.chain[4] > 0 && G.chipRate() > 0 : active } });
      set(body, 'st' + i, { cls: { can: (!isOwn || own) && S.tokens >= cost } });
      set(body, 'lv' + i, S.chain[i]);
      set(body, 'sr' + i, i === 4 ? `${G.fmt(slots)} plekken` : `${rate(G.stageCap(i))} chips/s${active && i === b ? ' · ⚠️ bottleneck' : ''}`);
      const nx = G.stageNextMs(i), pv = G.CHAIN_MS[G.CHAIN_MS.indexOf(nx) - 1] || 0;
      set(body, 'sm' + i, { w: nx ? ((S.chain[i] - pv) / (nx - pv) * 100) + '%' : '100%' });
      set(body, 'sl' + i, nx ? `2× ${i === 4 ? 'ruimte' : 'capaciteit'} bij niveau ${nx}` : 'Alle mijlpalen gehaald');
      set(body, 'sq' + i, (i === 5 ? 'inkopen' : S.chain[i] ? 'uitbreiden' : 'bouwen') + (nx === S.chain[i] + 1 ? ' ⭐' : ''));
      set(body, 'sc' + i, G.fmt(cost));
    });
    updateRnd();
    // speelveld
    const c = G.chip();
    if ($('csIcon').textContent !== c.icon) { $('csIcon').textContent = c.icon; $('csName').textContent = `${c.name} · ${c.node}`; }
    $('csCompute').textContent = `⚡ ${G.fmt(G.compute())} rekenkracht · modellen ${G.fmtMult(G.computeBonus())}`;
    $('csHint').textContent = S.rnd
      ? `🔬 ${G.CHIPS[S.rnd.gen].name}: nog ${G.fmtTime(Math.ceil(Math.max(0, S.rnd.end - Date.now()) / 1000))} · tik op de chip om te versnellen`
      : share < 0.999 ? `Nieuwe chips vervangen de oude: ${Math.floor(share * 100)}%` : 'Tik op de chip voor tokens';
    $('csChip').classList.toggle('busy', !!S.rnd);
  }

  function updateRnd() {
    const el = $('rnd'), S = G.S, cur = G.chip(), nx = G.nextChip();
    const track = `<div class="track">${G.CHIPS.map((c, i) => `<span class="${i < S.chipGen ? 'done' : i === S.chipGen ? 'cur' : S.rnd && S.rnd.gen === i ? 'busy' : ''}" title="${c.name}">${c.icon}</span>`).join('<i></i>')}</div>
      <div class="track-label">Generatie ${S.chipGen + 1} van ${G.CHIPS.length}</div>`;
    const curHtml = track + `<div class="rnd-row"><span class="ri">${cur.icon}</span><div><small>Huidige chip</small><b>${cur.name}</b><span>${cur.node} · ×${G.fmt(cur.power)} per chip</span></div></div>`;
    if (S.rnd) {
      const t = G.CHIPS[S.rnd.gen];
      keyed(el, 'run' + S.rnd.gen, track + `<div class="rnd-run" data-act="rnd-boost">
        <div class="rnd-row"><span class="ri spin">${t.icon}</span><div><small>In ontwikkeling</small><b>${t.name}</b><span data-f="rleft"></span></div></div>
        <div class="bar big"><i data-f="rbar"></i></div>
        <p class="tapme">👆 Tik hier om de ontwikkeling te versnellen</p></div>`);
      const left = Math.max(0, S.rnd.end - Date.now());
      set(el, 'rleft', 'nog ' + G.fmtTime(Math.ceil(left / 1000)));
      set(el, 'rbar', { w: (100 * (1 - left / S.rnd.total)) + '%' });
      return;
    }
    if (!nx) { keyed(el, 'max', curHtml + '<p class="muted">Je hebt de krachtigste chip die er bestaat.</p>'); return; }
    const litho = S.chain[2] >= nx.litho, aff = S.tokens >= nx.cost, tech = G.chipTech(S.chipGen + 1), known = G.techDone(tech.id), design = !G.chipNeedsDesign(S.chipGen + 1);
    keyed(el, ['ready', S.chipGen, S.chain[2], litho, aff, known, design, G.hl('design')].join('|'), curHtml + `
      <div class="rnd-next">
        <div class="rnd-row"><span class="ri">${nx.icon}</span><div><small>Volgende generatie</small><b>${nx.name}</b>
          <span>${nx.node} · ×${G.fmt(nx.power)} per chip · ontwikkeltijd ${G.fmtTime(nx.time * G.mods.rndTime)}</span></div></div>
        <p class="muted chipdesc">${nx.desc}</p>
        <p class="req ${known ? 'ok' : 'no'}">${known ? '✓' : '✗'} Onderzoek: ${tech.icon} ${tech.name}${known ? '' : ' <button class="pill mini" data-act="rnd-research">🔬 naar boom</button>'}</p>
        ${S.chipGen + 1 >= 3 ? `<p class="req ${design ? 'ok' : 'no'}">${design ? '✓' : '✗'} Lab: Chipontwerpstudio${design ? '' : ' <button class="pill mini" data-act="design-lab">🔬 naar lab</button>'}</p>` : ''}
        ${nx.litho ? `<p class="req ${litho ? 'ok' : 'no'}">${litho ? '✓' : '✗'} Vereist ${nx.litho} EUV-machines in je eigen fabriek (je hebt er ${S.chain[2]})</p>` : ''}
        <button class="cta" data-act="rnd-start" ${litho && aff && known && design ? '' : 'disabled'}>Ontwikkel · ${G.fmt(nx.cost)}</button>
      </div>`);
  }

  // ---------- apps ----------
  function appStatus(a) {
    const s = G.S.apps[a.id] || {};
    if (!G.appUnlocked(a) && !s.v && !s.b) return 'locked';
    if (s.b) return 'building';
    return s.v ? 'live' + s.v : 'new';
  }

  function updateApps() {
    const list = $('appList'), S = G.S;
    const shown = [];
    for (const a of G.APPS) { shown.push(a); if (appStatus(a) === 'locked') break; }
    const key = shown.map(a => a.id + ':' + appStatus(a) + (G.appNeedsTech(a) ? 't' : '')).join(',');
    if (keyed(list, key, shown.map(a => {
      const st = appStatus(a), s = G.S.apps[a.id] || {};
      const head = `<div class="gicon"><span>${a.icon}</span>${s.v ? `<span class="own">v${s.v}</span>` : ''}</div>`;
      if (st === 'locked') {
        const tech = G.appTech(a), known = !G.appNeedsTech(a), model = G.S.owned[a.model] >= a.n;
        return `<div class="app locked${known ? '' : ' needs'}"><div class="app-top">${head}<div class="ginfo"><div class="gname">${a.name}</div>
          <div class="grate">${known ? '✓' : '🔬'} Onderzoek: ${tech.icon} ${tech.name}</div>
          <div class="grate">${model ? '✓' : '🔒'} Vereist ${a.n}× ${G.GENS[a.model].name}</div></div>
          ${known ? '' : `<button class="gbuy" data-act="app-research" data-id="${a.id}"><span class="q">onderzoeken</span><span class="c">${G.fmt(tech.cost)}</span></button>`}</div></div>`;
      }
      if (st === 'new') return `<div class="app" data-f="ap-${a.id}"><div class="app-top">${head}<div class="ginfo"><div class="gname">${a.name}</div>
        <div class="grate">${a.desc}</div><div class="grate">Bouwtijd ${G.fmtTime(a.time)} · tot ${G.fmt(a.cap)} gebruikers</div></div>
        <button class="gbuy" data-act="app-build" data-id="${a.id}"><span class="q">bouwen</span><span class="c">${G.fmt(G.appCost(a))}</span></button></div></div>`;
      if (st === 'building') return `<div class="app"><div class="app-top">${head}<div class="ginfo"><div class="gname">${a.name}</div>
        <div class="grate">👷 Wordt gebouwd… <span data-f="bl-${a.id}"></span></div><div class="bar"><i data-f="bb-${a.id}"></i></div></div></div></div>`;
      return `<div class="app live" data-f="ap-${a.id}"><div class="app-top">${head}<div class="ginfo"><div class="gname">${a.name} <span class="ver">v${s.v}</span> <span class="stars">${'★'.repeat(G.appStars(a))}</span> <span class="fire-badge" data-f="ht-${a.id}">🔥</span></div>
        <div class="grate"><span data-f="au-${a.id}"></span> gebruikers · <b class="earn" data-f="ar-${a.id}"></b> data</div>
        <div class="bar users"><i data-f="ab-${a.id}"></i></div>
        <div class="mlabel">Volgende versie: v${s.v + 1} ${G.appFeature(s.v + 1)} · 2× gebruikers en data</div></div>
        <div class="app-actions">
          <button class="gbuy" data-act="app-build" data-id="${a.id}" data-f="av-${a.id}"><span class="q">nieuwe versie</span><span class="c" data-f="avc-${a.id}"></span></button>
          <button class="gbuy mkt" data-act="app-mkt" data-id="${a.id}" data-f="am-${a.id}"></button>
        </div></div></div>`;
    }).join(''))) {
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
              if (!wasNew) G.ui.toast(a.icon, `${a.name} v${G.app(a.id).v}: ${G.appFeature(G.app(a.id).v)}`, 'Nieuwe functie: 2× gebruikers en 2× data per gebruiker.');
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
    let live = 0;
    for (const a of shown) {
      const s = G.S.apps[a.id] || {}, st = appStatus(a);
      if (st === 'new') set(list, 'ap-' + a.id, { cls: { can: S.tokens >= G.appCost(a) } });
      if (st === 'building') {
        const left = Math.max(0, s.b - now);
        set(list, 'bl-' + a.id, 'nog ' + G.fmtTime(Math.ceil(left / 1000)));
        set(list, 'bb-' + a.id, { w: (100 * (1 - left / (a.time * 1000))) + '%' });
      }
      if (st.startsWith('live')) {
        live++;
        set(list, 'au-' + a.id, `${G.fmt(Math.floor(s.u))} / ${G.fmt(G.appCap(a))}`);
        set(list, 'ar-' + a.id, G.fmt(G.appData(a)));
        set(list, 'ab-' + a.id, { w: pct(s.u, G.appCap(a)) });
        set(list, 'ht-' + a.id, { cls: { on: G.trending(a) } });
        const cd = Math.max(0, (s.cd || 0) - now);
        set(list, 'am-' + a.id, { t: cd ? `campagne · ${Math.ceil(cd / 1000)} s` : '📣 campagne', dis: cd > 0 });
        set(list, 'avc-' + a.id, G.fmt(G.appCost(a)));
        set(list, 'ap-' + a.id, { cls: { can: S.tokens >= G.appCost(a) } });
      }
    }
    $('appHead').textContent = live ? `${live} live · modellen ${G.fmtMult(G.dataBonus())}` : 'Apps leveren data voor je modellen';
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
    $('asData').textContent = G.fmtMult(G.dataBonus());
    const tr = S.trend && S.trend.until > now ? G.APPS.find(a => a.id === S.trend.id) : null;
    const trTxt = tr ? `🔥 ${tr.name} trending · ${Math.ceil((S.trend.until - now) / 1000)} s`
      : G.trendOffer ? `🔥 ${G.APPS.find(a => a.id === G.trendOffer.id).name} gaat viraal! Tik erop` : G.appsLive() ? 'Tik op een app voor extra gebruikers' : 'Bouw je eerste app hieronder';
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
  function updateTeam() {
    const list = $('teamList'), S = G.S;
    const key = G.HELPERS.map(h => G.hl(h.id) + (G.helperUnlocked(h) ? '' : 'x')).join(',') + '|' + G.S.chipGen;
    if (keyed(list, key + '|' + Object.keys(S.lab).length, orgChart() + `<div class="ind-card safety" data-f="safety"></div>` + G.HELPERS.map(h => {
      if (!G.helperUnlocked(h)) {
        const lab = G.techById(G.HELPER_LAB[h.id]);
        return `<div class="gen helper locked-h" data-act="helper-lab" data-id="${lab.id}">
          <div class="gicon"><span>${h.icon}</span></div>
          <div class="ginfo"><div class="gname">${h.name}</div>
            <div class="grate eff">🔬 Lab: ${lab.icon} ${lab.name}</div></div>
          <button class="gbuy"><span class="q">onderzoeken</span><span class="c">${G.fmt(lab.cost)}</span></button></div>`;
      }
      const l = G.hl(h.id), max = l >= h.max, r = G.rank(h), lv = G.rankLevels(h);
      const next = lv[r + 1], prev = lv[r];
      const nextTxt = next == null ? 'Hoogste rang bereikt' : `${h.ranks ? G.rankName(h, r + 1) : G.RANK_TITLES[r]} bij niveau ${next}`;
      return `<div class="gen helper" data-act="hire" data-id="${h.id}" data-f="hc-${h.id}">
        <div class="gicon"><span>${G.rankIcon(h)}</span>${l ? `<span class="own">${l}</span>` : ''}</div>
        <div class="ginfo"><div class="gname">${l ? G.rankName(h) : h.name}${r ? ` <span class="stars">${'★'.repeat(r)}</span>` : ''}</div>
          <div class="grate eff">${l ? h.eff(G.effAt(h, l), l) : h.eff(G.effAt(h, 1), 1)}</div>
          <div class="mbar"><i style="width:${next == null ? 100 : (l - prev) / (next - prev) * 100}%"></i></div>
          <div class="mlabel">${nextTxt}</div></div>
        <button class="gbuy"${max ? ' disabled' : ''}><span class="q">${max ? 'maximaal' : l ? 'promoveren' + (next === l + 1 ? ' ⭐' : '') : 'aannemen'}</span><span class="c">${max ? '★' : G.fmt(G.helperCost(h))}</span></button>
      </div>`;
    }).join(''))) {
      if (!list.dataset.bound) {
        list.dataset.bound = '1';
        list.addEventListener('click', e => {
          if (e.target.closest('[data-act="to-research"]')) { G.uiRes.open('models'); return; }
          const lk = e.target.closest('[data-act="helper-lab"]');
          if (lk) { G.uiRes.open('lab', lk.dataset.id); return; }
          const t = e.target.closest('[data-act="hire"]');
          if (!t) return;
          const h = G.HELPERS.find(x => x.id === t.dataset.id), first = !G.hl(h.id), r0 = G.rank(h);
          if (G.hire(h)) {
            G.sfx.milestone(); G.haptic('MEDIUM');
            const l = G.hl(h.id);
            if (G.rank(h) > r0) { G.sfx.big(); G.fx.wave(); G.ui.toast(G.rankIcon(h), `Promotie: ${G.rankName(h)}!`, h.eff(G.effAt(h, l), l)); }
            else G.ui.toast(G.rankIcon(h), first ? `${h.name} aangenomen!` : `${G.rankName(h)} → niveau ${l}`, h.eff(G.effAt(h, l), l));
            buildOrbit(true);
          } else G.sfx.error();
          G.uiRefresh(true);
        });
      }
    }
    for (const h of G.HELPERS) set(list, 'hc-' + h.id, { cls: { can: G.hl(h.id) < h.max && S.tokens >= G.helperCost(h) } });
    updateSafetyCard(list.querySelector('[data-f="safety"]'));
    const n = Object.keys(S.helpers).length;
    $('teamHead').textContent = n ? `${n} van ${G.HELPERS.length} rollen bezet` : '';
  }

  // Organogram: groeit mee met je lab. Open afdelingen, de volgende in opbouw, de rest nog verborgen.
  const DEPT_SHORT = { lab_product: 'Product', lab_hardware: 'Datacenter', lab_hr: 'HR', lab_safety: 'Veiligheid', lab_design: 'Chipontwerp',
    lab_mkt: 'Marketing', lab_eng: 'Fabriek', lab_talent: 'Talent', lab_finance: 'Financiën', lab_sing: 'Singulariteit' };
  function deptMetric(id) {
    const S = G.S, h = G.HELPERS.find(x => G.HELPER_LAB[x.id] === id);
    if (h) return G.hl(h.id) ? `${G.rankIcon(h)} ${G.hl(h.id)}` : `${h.icon} –`;
    if (id === 'lab_product') return `📱 ${G.appsLive()}`;
    if (id === 'lab_hardware') return `🔲 ${G.fmt(Math.floor(S.chips))}`;
    if (id === 'lab_sing') return `🌀 ${G.fmt(S.insights)}`;
    return '';
  }
  function orgChart() {
    const open = G.LAB.filter(([id]) => G.labDone(id)).map(([id]) => id);
    const next = G.LAB.find(([id]) => !G.labDone(id));
    const nodes = open.map(id => {
      const u = G.techById(id);
      return `<div class="org-dept"><span class="od-ic">${u.icon}</span><b>${DEPT_SHORT[id]}</b><small>${deptMetric(id)}</small></div>`;
    });
    if (next) nodes.push(`<button class="org-dept next" data-act="helper-lab" data-id="${next[0]}"><span class="od-ic">${next[2]}</span><b>${DEPT_SHORT[next[0]]}</b><small>🔒 ${G.fmt(next[3])}</small></button>`);
    return `<div class="org">
      <div class="org-top"><div class="org-ceo"><span>🧑‍💼</span><b>Jij</b></div><div class="org-ceo ada"><span>🤖</span><b>Ada</b></div></div>
      <div class="org-bus"></div>
      <div class="org-grid">${nodes.join('')}</div>
      <p class="org-cap">${open.length} van ${G.LAB.length} afdelingen · groeit mee met je lab</p></div>`;
  }

  function updateSafetyCard(el) {
    const S = G.S, need = G.safetyNeed(), pts = G.safetyPoints(), def = G.safetyDeficit();
    const state = need === 0 ? 'none' : def ? 'bad' : 'ok';
    const k = [state, Math.round(pts * 10), need].join('|');
    const risk = () => { el.querySelector('.risk i').style.width = S.risk + '%'; el.querySelector('[data-f="rk"]').textContent = Math.floor(S.risk) + '%'; };
    if (el.dataset.k === k) { risk(); return; }
    el.dataset.k = k;
    el.className = 'ind-card safety ' + state;
    const msg = state === 'none' ? 'Nog niet nodig. Vanaf de LSTM vragen modellen om veiligheid.'
      : def ? `${G.fmt(def)} tekort. Bij 100% risico volgt een backlash.`
      : 'Op orde. Houd het bij als je slimmere modellen koopt.';
    el.innerHTML = `
      <div class="sf-top"><span class="sf-ic">${state === 'bad' ? '⚠️' : '🛡️'}</span>
        <div><small>Veiligheid</small><b>${G.fmt(pts)} / ${G.fmt(need)} nodig</b></div>
        <button class="pill" data-act="to-research">🛡️ Onderzoek</button></div>
      <div class="sf-row"><span>Risico</span><div class="bar risk"><i></i></div><b data-f="rk"></b></div>
      <p class="muted">${msg}</p>`;
    risk();
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
    $('questText').textContent = q.text + (need > 1 ? ` (${G.fmt(have)}/${G.fmt(need)})` : '');
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
    $('dotChips').classList.toggle('show', G.tabUnlocked('chips') && (G.canStartRnd() || [4, 5].some(i => !S.chain[i] && S.tokens >= G.chainCost(i))));
    $('dotApps').classList.toggle('show', G.tabUnlocked('apps') && G.APPS.some(a => !G.app(a.id).v && !G.app(a.id).b && G.appUnlocked(a) && S.tokens >= G.appCost(a)));
    $('dotTeam').classList.toggle('show', G.tabUnlocked('team') && (G.safetyDeficit() > 0 || G.HELPERS.some(h => !G.hl(h.id) && S.tokens >= G.helperCost(h))));
  }

  G.uiInd = {
    update(tab, force) {
      updateQuest();
      updateDots();
      buildOrbit();
      if (tab === 'chips') updateChips();
      if (tab === 'apps') { updateApps(); updateAppsStage(); }
      if (tab === 'team') updateTeam();
    },
    reset() { for (const k in last) delete last[k]; orbitKey = ''; $('chipBody').removeAttribute('data-built'); buildOrbit(); },
    buildOrbit,
  };
})();

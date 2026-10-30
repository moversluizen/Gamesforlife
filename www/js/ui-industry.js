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
  function buildChips() {
    const body = $('chipBody');
    if (body.dataset.built) return;
    body.dataset.built = '1';
    body.innerHTML = `
      <div class="ind-card">
        <div class="stats3">
          <div><small>Rekenkracht</small><b data-f="cmp"></b></div>
          <div><small>Bonus op modellen</small><b data-f="bonus"></b></div>
          <div><small>Chips geplaatst</small><b data-f="chips"></b></div>
        </div>
        <div class="bar"><i data-f="fill"></i></div>
        <p class="muted" data-f="status"></p>
      </div>
      <div id="rnd" class="ind-card rnd"></div>
      <div class="subhead">Supply chain <span class="muted">· de traagste schakel bepaalt je output</span></div>
      ${G.CHAIN.map((c, i) => `
        <div class="gen" data-act="chain" data-i="${i}" data-f="st${i}">
          <div class="gicon"><span>${c.icon}</span><span class="own" data-f="lv${i}"></span></div>
          <div class="ginfo"><div class="gname">${c.name}</div><div class="grate" data-f="sr${i}"></div>
            <div class="mbar"><i data-f="sm${i}"></i></div><div class="mlabel" data-f="sl${i}"></div></div>
          <button class="gbuy"><span class="q" data-f="sq${i}"></span><span class="c" data-f="sc${i}"></span></button>
        </div>`).join('')}`;
    $('csFlow').innerHTML = G.CHAIN.map((c, i) => `${i ? '<span class="arrow" data-f="ar' + i + '"><i></i><i></i></span>' : ''}<div class="fnode" data-f="fn${i}"><span>${c.icon}</span><small data-f="fc${i}"></small></div>`).join('');
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
    const body = $('chipBody'), S = G.S;
    const built = S.chain.slice(0, 4).every(x => x > 0), b = G.bottleneck(), slots = G.slots();
    set(body, 'cmp', G.fmt(G.compute()));
    set(body, 'bonus', '×' + G.computeBonus().toFixed(2).replace('.', ','));
    set(body, 'chips', `${G.fmt(Math.floor(S.chips))} / ${G.fmt(slots)}`);
    set(body, 'fill', { w: pct(S.chips, slots) });
    let status;
    if (!built) status = 'Bouw alle vier productieschakels om chips te maken. Chips geven rekenkracht, en rekenkracht maakt al je modellen sneller.';
    else if (!S.chain[4]) status = `${rate(G.chipRate())} chips/s, maar nog geen datacenter om ze te plaatsen. Bouw er een.`;
    else if (G.chipsFull()) status = 'Datacenter vol. Breid uit om meer chips te plaatsen en je modellen nog sneller te maken.';
    else status = `${rate(G.chipRate())} chips/s · ${G.chip().name} (${G.chip().node}) · ×${G.fmt(G.chip().power)} rekenkracht per chip`;
    set(body, 'status', status);
    G.CHAIN.forEach((c, i) => {
      const cost = G.chainCost(i);
      const flow = $('csFlow');
      set(flow, 'fc' + i, i < 4 ? rate(G.stageCap(i)) + '/s' : G.fmt(slots));
      set(flow, 'fn' + i, { cls: { bn: built && i === b, off: !S.chain[i] } });
      if (i) set(flow, 'ar' + i, { cls: { live: S.chain[i - 1] > 0 && S.chain[i] > 0 } });
      set(body, 'st' + i, { cls: { can: S.tokens >= cost } });
      set(body, 'lv' + i, S.chain[i]);
      set(body, 'sr' + i, i < 4
        ? `${rate(G.stageCap(i))} chips/s${built && i === b ? ' · ⚠️ bottleneck' : ''} · ${c.desc}`
        : `${G.fmt(slots)} plekken · ${c.desc}`);
      const nx = G.stageNextMs(i), pv = G.CHAIN_MS[G.CHAIN_MS.indexOf(nx) - 1] || 0;
      set(body, 'sm' + i, { w: nx ? ((S.chain[i] - pv) / (nx - pv) * 100) + '%' : '100%' });
      set(body, 'sl' + i, nx ? `2× ${i < 4 ? 'capaciteit' : 'ruimte'} bij niveau ${nx}${G.stageMs(i) ? ` · nu ×${Math.pow(2, G.stageMs(i))}` : ''}` : `Alle mijlpalen · ×${Math.pow(2, G.stageMs(i))}`);
      set(body, 'sq' + i, (S.chain[i] ? 'uitbreiden' : 'bouwen') + (nx === S.chain[i] + 1 ? ' ⭐' : ''));
      set(body, 'sc' + i, G.fmt(cost));
    });
    updateRnd();
    // speelveld
    const c = G.chip();
    if ($('csIcon').textContent !== c.icon) { $('csIcon').textContent = c.icon; $('csName').textContent = `${c.name} · ${c.node}`; }
    $('csCompute').textContent = `⚡ ${G.fmt(G.compute())} rekenkracht · modellen ×${G.computeBonus().toFixed(2).replace('.', ',')}`;
    $('csHint').textContent = S.rnd
      ? `🔬 ${G.CHIPS[S.rnd.gen].name}: nog ${G.fmtTime(Math.ceil(Math.max(0, S.rnd.end - Date.now()) / 1000))} · tik op de chip om te versnellen`
      : 'Tik op de chip voor tokens';
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
    const litho = S.chain[2] >= nx.litho, aff = S.tokens >= nx.cost, tech = G.chipTech(S.chipGen + 1), known = G.techDone(tech.id);
    keyed(el, ['ready', S.chipGen, S.chain[2], litho, aff, known, G.hl('design')].join('|'), curHtml + `
      <div class="rnd-next">
        <div class="rnd-row"><span class="ri">${nx.icon}</span><div><small>Volgende generatie</small><b>${nx.name}</b>
          <span>${nx.node} · ×${G.fmt(nx.power)} per chip · ontwikkeltijd ${G.fmtTime(nx.time * G.mods.rndTime)}</span></div></div>
        <p class="req ${known ? 'ok' : 'no'}">${known ? '✓' : '✗'} Onderzoek: ${tech.icon} ${tech.name}${known ? '' : ' <button class="pill mini" data-act="rnd-research">🔬 naar boom</button>'}</p>
        <p class="req ${litho ? 'ok' : 'no'}">${litho ? '✓' : '✗'} Vereist ${nx.litho} EUV-machines (je hebt er ${S.chain[2]})</p>
        <button class="cta" data-act="rnd-start" ${litho && aff && known ? '' : 'disabled'}>Ontwikkel · ${G.fmt(nx.cost)}</button>
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
          ${known ? '' : `<button class="gbuy" data-act="app-research" data-id="${a.id}"><span class="q">🔬 onderzoek</span><span class="c">${G.fmt(tech.cost)}</span></button>`}</div></div>`;
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
          <button class="gbuy" data-act="app-build" data-id="${a.id}" data-f="av-${a.id}"><span class="q">⬆ v${s.v + 1}</span><span class="c" data-f="avc-${a.id}"></span></button>
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
        set(list, 'am-' + a.id, { t: cd ? `📣 ${Math.ceil(cd / 1000)} s` : '📣 campagne', dis: cd > 0 });
        set(list, 'avc-' + a.id, G.fmt(G.appCost(a)));
        set(list, 'ap-' + a.id, { cls: { can: S.tokens >= G.appCost(a) } });
      }
    }
    $('appHead').textContent = live ? `${live} live · modellen ×${G.dataBonus().toFixed(2).replace('.', ',')}` : 'Apps leveren data voor je modellen';
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
    $('asData').textContent = '×' + G.dataBonus().toFixed(2).replace('.', ',');
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
    if (keyed(list, key, `<div class="ind-card safety" data-f="safety"></div>` + G.HELPERS.map(h => {
      if (!G.helperUnlocked(h)) {
        const lab = G.techById(G.HELPER_LAB[h.id]);
        return `<div class="gen helper locked-h" data-act="helper-lab" data-id="${lab.id}">
          <div class="gicon"><span>${h.icon}</span></div>
          <div class="ginfo"><div class="gname">${h.name}</div><div class="grate">${h.desc}</div>
            <div class="grate eff">🔬 Eerst in je Lab: ${lab.icon} ${lab.name}</div></div>
          <button class="gbuy"><span class="q">🔬 onderzoek</span><span class="c">${G.fmt(lab.cost)}</span></button></div>`;
      }
      const l = G.hl(h.id), max = l >= h.max, r = G.rank(h), lv = G.rankLevels(h);
      const next = lv[r + 1], prev = lv[r];
      const nextTxt = next == null ? 'Hoogste rang bereikt' : `${G.rankName(h, r + 1)} bij niveau ${next}${h.ranks ? ' · 2× zo slim' : ' · effect +50%'}`;
      return `<div class="gen helper" data-act="hire" data-id="${h.id}" data-f="hc-${h.id}">
        <div class="gicon"><span>${G.rankIcon(h)}</span>${l ? `<span class="own">${l}</span>` : ''}</div>
        <div class="ginfo"><div class="gname">${l ? G.rankName(h) : h.name}${r ? ` <span class="stars">${'★'.repeat(r)}</span>` : ''}</div>
          <div class="grate">${h.desc}</div>
          <div class="grate eff">${l ? 'Nu: ' + h.eff(G.effAt(h, l), l) : ''}${max ? '' : `${l ? ' → ' : 'Effect: '}${h.eff(G.effAt(h, l + 1), l + 1)}`}</div>
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

  function updateSafetyCard(el) {
    const S = G.S, need = G.safetyNeed(), pts = G.safetyPoints(), def = G.safetyDeficit();
    const state = need === 0 ? 'none' : def ? 'bad' : 'ok';
    const k = [state, Math.round(pts * 10), need].join('|');
    const risk = () => { el.querySelector('.risk i').style.width = S.risk + '%'; el.querySelector('[data-f="rk"]').textContent = Math.floor(S.risk) + '%'; };
    if (el.dataset.k === k) { risk(); return; }
    el.dataset.k = k;
    el.className = 'ind-card safety ' + state;
    const msg = state === 'none' ? 'Je modellen zijn nog simpel. Vanaf de RNN vragen slimmere modellen om veiligheid.'
      : def ? `Je loopt ${G.fmt(def)} achter. Het risico stijgt; bij 100% volgt een backlash: productie −50% en gebruikers haken af.`
      : 'Je veiligheid is op orde. Blijf investeren als je slimmere modellen koopt.';
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
    $('dotChips').classList.toggle('show', G.tabUnlocked('chips') && (G.canStartRnd() || G.CHAIN.some((c, i) => !S.chain[i] && S.tokens >= G.chainCost(i))));
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

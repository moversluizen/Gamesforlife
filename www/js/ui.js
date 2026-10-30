// Interface en spellus.
(function () {
  const G = window.G;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  let currentTab = 'models', moreSub = 'sing';
  const genEls = [];

  // ---------- modellen ----------
  function buildGens() {
    const list = $('genList');
    list.innerHTML = '';
    G.GENS.forEach((g, i) => {
      const card = el('div', 'gen');
      card.innerHTML = `
        <div class="gicon"><span class="ge">${g.icon}</span><span class="own">0</span></div>
        <div class="ginfo"><div class="gname"></div><div class="grate"></div><div class="mbar"><i></i></div><div class="mlabel"></div></div>
        <button class="gbuy"><span class="q"></span><span class="c"></span></button>`;
      card.addEventListener('click', () => buyGen(i, card));
      list.appendChild(card);
      genEls[i] = {
        card, own: card.querySelector('.own'), name: card.querySelector('.gname'), rate: card.querySelector('.grate'),
        mbar: card.querySelector('.mbar i'), ml: card.querySelector('.mlabel'), q: card.querySelector('.q'), c: card.querySelector('.c'),
      };
    });
  }

  function buyGen(i, card) {
    if (!G.isRevealed(i)) return;
    if (G.genNeedsTech(i)) { G.haptic(); G.uiRes.open('models', 'tm' + i); return; }
    const k = G.buyGen(i);
    if (k) {
      G.sfx.buy(); G.haptic('LIGHT');
      card.animate([{ transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 160 });
      refresh(true);
    } else { G.sfx.error(); }
  }

  function updateGens() {
    const S = G.S, tps = G.tps() || 1;
    let shownLocked = false;
    G.GENS.forEach((g, i) => {
      const e = genEls[i], rev = G.isRevealed(i);
      if (!rev && shownLocked) { e.card.style.display = 'none'; return; }
      e.card.style.display = '';
      if (!rev) shownLocked = true;
      e.card.classList.toggle('locked', !rev);
      const k = G.buyQty(i), cost = G.costOf(i, k), tech = rev && G.genNeedsTech(i) ? G.genTech(i) : null;
      e.card.classList.toggle('can', rev && !tech && S.tokens >= cost);
      e.card.classList.toggle('needs', !!tech);
      e.own.textContent = S.owned[i];
      e.own.style.display = S.owned[i] ? '' : 'none';
      e.name.textContent = rev ? g.name : '???';
      if (!rev) e.rate.textContent = 'Nog niet ontdekt';
      else if (tech) e.rate.textContent = `🔬 Eerst onderzoeken: ${tech.icon} ${tech.name}`;
      else if (S.owned[i]) {
        const r = G.genRate(i);
        e.rate.textContent = `${G.fmtRate(r)} · ${Math.round(r / tps * 100)}% van totaal`;
      } else e.rate.textContent = g.desc;
      const next = G.nextMilestone(S.owned[i]);
      const prevIdx = G.MILESTONES.indexOf(next) - 1, prev = prevIdx >= 0 ? G.MILESTONES[prevIdx] : 0;
      e.mbar.style.width = next ? ((S.owned[i] - prev) / (next - prev) * 100) + '%' : '100%';
      const ml = !rev ? '' : next ? `2× productie bij ${next}${G.milestoneLevel(S.owned[i]) ? ` · nu ×${G.fmt(Math.pow(2, G.milestoneLevel(S.owned[i])))}` : ''}` : 'Alle mijlpalen gehaald';
      if (e.ml.textContent !== ml) e.ml.textContent = ml;
      e.q.textContent = tech ? 'onderzoeken' : rev ? `kopen ×${k}` + (next && S.owned[i] + k >= next ? ' ⭐' : '') : '';
      e.c.textContent = G.fmt(tech ? tech.cost : cost);
    });
  }

  // ---------- onderzoek ----------
  let lastUpgKey = '';
  function updateResearch(force) {
    const avail = G.availableUpgrades();
    const key = avail.map(u => u.id).join(',');
    const list = $('upgList');
    if (force || key !== lastUpgKey) {
      lastUpgKey = key;
      list.innerHTML = '';
      if (!avail.length) list.appendChild(el('div', 'empty', 'Nog geen onderzoek beschikbaar.<br>Koop meer modellen om nieuwe doorbraken te ontgrendelen.'));
      for (const u of avail) {
        const row = el('div', 'upg');
        row.dataset.id = u.id;
        row.innerHTML = `<div class="ui">${u.icon}</div><div><div class="us">${u.sub}</div><div class="un">${u.name}</div><div class="ud">${u.desc}</div></div><button>${G.fmt(u.cost)}</button>`;
        row.querySelector('button').addEventListener('click', () => {
          if (G.buyUpgrade(u.id)) { G.sfx.upgrade(); G.haptic('MEDIUM'); toast(u.icon, u.name, u.desc); refresh(true); }
          else G.sfx.error();
        });
        list.appendChild(row);
      }
    }
    let any = false;
    for (const row of list.querySelectorAll('.upg')) {
      const u = G.UPGRADES.find(x => x.id === row.dataset.id), can = G.S.tokens >= u.cost;
      row.classList.toggle('can', can);
      any = any || can;
    }
    G.resListAffordable = any;
  }

  // ---------- singulariteit ----------
  function updateSing() {
    const S = G.S, p = G.pendingInsights();
    const nextAt = G.earnedForInsights(G.insightsFor(S.lifeEarned) + 1);
    const agiHtml = G.agiUnlocked()
      ? `<div class="big-card"><div style="font-size:44px">✨</div><h3>Project AGI</h3>
          <p>Combineer alles wat je hebt gebouwd tot één algemene intelligentie.<br>Beloning: <b>alle productie permanent ×2</b>.</p>
          <div class="big-num">${G.fmt(G.agiCost())}</div>
          <button class="cta gold" id="agiBtn" ${S.tokens >= G.agiCost() ? '' : 'disabled'}>Bouw AGI</button></div>`
      : `<div class="big-card"><div style="font-size:44px">${S.agi ? '✅' : '🔒'}</div><h3>Project AGI</h3>
          <p>${S.agi ? 'Je hebt AGI gebouwd in deze cyclus! Activeer de singulariteit om opnieuw te beginnen met een nóg slimmer startpunt.'
                     : `Ontgrendel het laatste model (${G.GENS[G.GENS.length - 1].name}) om AGI te kunnen bouwen.`}</p>
          <p>AGI gebouwd: <b>${S.agiCount}×</b> (bonus ${G.fmtMult(G.mods.agiBonus)})</p></div>`;
    $('singBody').innerHTML = agiHtml + `
      <div class="big-card"><div style="font-size:44px">🌀</div><h3>Singulariteit</h3>
        <p>Reset je modellen, onderzoek, chips, apps, team en tokens. In ruil krijg je <b>Inzichten</b>: elk inzicht geeft permanent <b>+2% productie</b>.</p>
        <p>Inzichten nu: <b>${S.insights}</b> (+${Math.round((G.mods.insightBonus - 1) * 100)}%)</p>
        <div class="big-num">+${G.fmt(p)}</div>
        <p>${p >= 1 ? 'inzichten bij activeren' : `Volgend inzicht bij ${G.fmt(nextAt)} totaal verdiende tokens`}</p>
        ${G.labDone('lab_sing') ? `<button class="cta" id="singBtn" ${p >= 1 ? '' : 'disabled'}>Activeer singulariteit</button>`
          : `<p>🔒 Onderzoek eerst het <b>Singulariteitsinstituut</b> in je Lab.</p><button class="cta" id="singLab">🔬 Naar het Lab</button>`}</div>`;
    const ab = $('agiBtn');
    if (ab) ab.onclick = buildAGI;
    if ($('singBtn')) $('singBtn').onclick = confirmPrestige;
    if ($('singLab')) $('singLab').onclick = () => G.uiRes.open('lab', 'lab_sing');
    $('dotSing').classList.toggle('show', (G.agiUnlocked() && S.tokens >= G.agiCost()) || p >= Math.max(10, S.insights));
  }

  function confirmPrestige() {
    const p = G.pendingInsights();
    if (p < 1) return;
    modal('🌀', 'Singulariteit activeren?', `Je begint opnieuw, maar met <b>${G.fmt(p)}</b> extra inzichten (+${G.fmt(p * 2)}% productie). Prestaties blijven behouden.`, [
      { label: 'Annuleren' },
      { label: 'Activeren', cls: 'primary', onClick: () => {
        G.prestige(); G.sfx.big(); G.haptic('HEAVY'); flashScreen();
        buildGens(); refresh(true); G.save();
        toast('🌀', 'Een nieuwe cyclus begint', `Productie nu ${G.fmtMult(G.mods.perm)}`);
      } },
    ]);
  }

  function buildAGI() {
    if (!G.buyAGI()) return;
    G.sfx.big(); G.haptic('HEAVY'); flashScreen();
    setTimeout(() => modal('✨', 'AGI bereikt!',
      `Van één perceptron naar algemene intelligentie. De mensheid kijkt vol ontzag toe.<br><br>Je productie is nu permanent <b>×${G.fmt(G.mods.agiBonus)}</b>.<br>Activeer de singulariteit om het nóg sneller te doen. Het volgende AGI-project is 10× zo groot.`,
      [{ label: 'Doorgaan', cls: 'primary' }]), 900);
    refresh(true); G.save();
  }

  function flashScreen() {
    const f = el('div', 'agi-burst');
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 2600);
    G.fx.wave(); G.fx.wave();
  }

  // ---------- prestaties ----------
  function updateAch() {
    const grid = $('achGrid');
    if (!grid.children.length) {
      for (const a of G.ACHS) {
        const b = el('button', 'ach');
        b.dataset.id = a.id;
        b.addEventListener('click', () => {
          const got = G.S.ach[a.id];
          toast(got ? a.icon : '🔒', got ? a.name : '???', a.desc);
        });
        grid.appendChild(b);
      }
    }
    for (const b of grid.children) {
      const a = G.ACHS.find(x => x.id === b.dataset.id), got = !!G.S.ach[a.id];
      b.classList.toggle('got', got);
      b.textContent = got ? a.icon : '?';
    }
    $('achCount').textContent = `${G.mods.achCount} / ${G.ACHS.length} · +${G.mods.achCount}% productie`;
  }

  // ---------- meer ----------
  function updateMore() {
    const S = G.S;
    const played = (Date.now() - S.started) / 1000;
    $('moreBody').innerHTML = `
      <div class="section-title">Statistieken</div>
      <div class="row"><span>Tokens deze cyclus</span><b>${G.fmt(S.runEarned)}</b></div>
      <div class="row"><span>Tokens totaal</span><b>${G.fmt(S.lifeEarned)}</b></div>
      <div class="row"><span>Per tik</span><b>${G.fmt(G.clickValue())}</b></div>
      <div class="row"><span>Aantal tikken</span><b>${S.clicks.toLocaleString('nl-NL')}</b></div>
      <div class="row"><span>Verdiend met tikken</span><b>${G.fmt(S.clickEarned)}</b></div>
      <div class="row"><span>Eureka-momenten</span><b>${S.eurekas}</b></div>
      <div class="row"><span>Singulariteiten</span><b>${S.prestiges}</b></div>
      <div class="row"><span>Rekenkracht</span><b>${G.fmt(G.compute())} (${G.fmtMult(G.computeBonus())})</b></div>
      <div class="row"><span>Data uit apps</span><b>${G.fmt(G.dataValue())} (${G.fmtMult(G.dataBonus())})</b></div>
      <div class="row"><span>Totale bonus</span><b>${G.fmtMult(G.mods.perm)}</b></div>
      <div class="row"><span>Offline productie</span><b>${Math.round(G.mods.offline * 100)}%</b></div>
      <div class="row"><span>Speeltijd</span><b>${G.fmtTime(played)}</b></div>
      <div class="section-title">Instellingen</div>
      <div class="row"><span>Geluid</span><button class="switch ${S.settings.sound ? 'on' : ''}" data-set="sound" aria-label="Geluid"></button></div>
      <div class="row"><span>Trillen</span><button class="switch ${S.settings.haptics ? 'on' : ''}" data-set="haptics" aria-label="Trillen"></button></div>
      <div class="section-title">Hoe speel je?</div>
      <div class="small-print">Tik op de kern om tokens te verdienen. Koop modellen die automatisch tokens maken; bij 10, 25, 50, 100… stuks verdubbelt hun productie. Onderzoek geeft extra boosts. Bouw een supply chain voor chips: rekenkracht maakt al je modellen sneller, en de traagste schakel bepaalt hoeveel chips je maakt. Lanceer apps: hun gebruikers leveren trainingsdata die je modellen versterkt. Neem helpers aan die werk voor je doen. Veeg links of rechts over het paneel om van onderdeel te wisselen. Ada geeft je steeds een nieuwe opdracht met een beloning. Tik op een gouden 💡 voor een Eureka-moment. Bouw uiteindelijk AGI en activeer de singulariteit voor permanente bonussen. Ook als de app dicht is gaat de training door.</div>
      <button class="danger" id="wipeBtn">Voortgang wissen</button>
      <div class="small-print">Road to AGI · versie 1.1<br>Dit spel verzamelt geen persoonsgegevens. Je voortgang wordt alleen op dit apparaat opgeslagen.</div>`;
    for (const sw of $('moreBody').querySelectorAll('.switch')) {
      sw.onclick = () => { const k = sw.dataset.set; S.settings[k] = !S.settings[k]; sw.classList.toggle('on', S.settings[k]); G.haptic(); G.save(); };
    }
    $('wipeBtn').onclick = () => modal('⚠️', 'Alles wissen?', 'Al je voortgang, inzichten en prestaties worden definitief verwijderd.', [
      { label: 'Annuleren' },
      { label: 'Wissen', cls: 'bad', onClick: async () => { await G.wipe(); buildGens(); $('achGrid').innerHTML = ''; G.uiInd.reset(); refresh(true); switchTab('models'); } },
    ]);
  }

  // ---------- tabs ----------
  const TAB_ORDER = ['models', 'chips', 'apps', 'research', 'team'];
  const TAB_META = {
    models:   ['🧠', 'Modellen', 'De basis: je modellen maken tokens'],
    chips:    ['💾', 'Chips', 'Rekenkracht die al je modellen versnelt'],
    apps:     ['📱', 'Apps', 'Gebruikers leveren data voor je modellen'],
    research: ['🔬', 'Onderzoek', 'Hier ontgrendel je alles: afdelingen, modellen, chips en apps'],
    team:     ['👥', 'Team', 'Helpers die het werk voor je doen'],
    more:     ['🌀', 'Meer', 'Singulariteit, prestaties en instellingen'],
  };
  let prevTab = 'models';
  // Modellen, Chips en Apps hebben een eigen speelveld; de rest is een volledig scherm.
  const SCREENS = { models: 'models', chips: 'chips', apps: 'apps' };
  const TAB_NAMES = { models: 'Modellen', research: 'Onderzoek', chips: 'Chips', apps: 'Apps', team: 'Team', more: 'Meer' };
  // Volgende (dir 1) of vorige (dir -1) tab die al open is.
  function neighbor(dir) {
    if (currentTab === 'more') return null;
    let i = TAB_ORDER.indexOf(currentTab);
    do { i += dir; } while (i >= 0 && i < TAB_ORDER.length && !G.tabUnlocked(TAB_ORDER[i]));
    return TAB_ORDER[i] || null;
  }
  function switchTab(t) {
    if (!G.tabUnlocked(t)) {
      G.sfx.error();
      const lock = G.tabLock(t);
      modal(TAB_META[t][0], `${TAB_NAMES[t]} is nog op slot`,
        `Open dit onderdeel door in je <b>Lab</b> de afdeling <b>${lock.icon} ${lock.name}</b> te onderzoeken (${G.fmt(lock.cost)} tokens).`,
        [{ label: 'Later' }, { label: '🔬 Naar het Lab', cls: 'primary', onClick: () => G.uiRes.open('lab', lock.id) }]);
      return;
    }
    if (t === 'more' && currentTab !== 'more') prevTab = currentTab;
    const dir = t === 'more' || currentTab === 'more' ? 0 : TAB_ORDER.indexOf(t) - TAB_ORDER.indexOf(currentTab);
    currentTab = t;
    $('app').dataset.screen = SCREENS[t] || 'full';
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    document.querySelectorAll('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + t));
    const sec = activeSection();
    sec.classList.remove('in-next', 'in-prev');
    if (dir) { void sec.offsetWidth; sec.classList.add(dir > 0 ? 'in-next' : 'in-prev'); }
    placeIndicator();
    refresh(true);
  }
  const activeSection = () => $('tab-' + currentTab);

  // ---------- waar ben je: streepje in de menubalk en navigatie bovenin het paneel ----------
  function placeIndicator() {
    const b = document.querySelector('#tabs button.on'), nav = $('tabs');
    $('tabInd').style.opacity = b ? 1 : 0;
    if (!b) return;
    const r = b.getBoundingClientRect(), nr = nav.getBoundingClientRect();
    $('tabInd').style.transform = `translateX(${r.left - nr.left + r.width / 2 - 14}px)`;
  }
  window.addEventListener('resize', placeIndicator);
  // Kop van het paneel: waar ben je en wat doe je hier.
  function updatePager() {
    const [icon, title, sub] = TAB_META[currentTab];
    $('shIcon').textContent = icon;
    $('shTitle').textContent = title;
    $('shSub').textContent = sub;
    $('pdots').innerHTML = currentTab === 'more' ? '' : TAB_ORDER.map(t => `<i class="${t === currentTab ? 'on' : ''}${G.tabUnlocked(t) ? '' : ' lk'}"></i>`).join('');
    $('shClose').classList.toggle('hidden', currentTab !== 'more');
    $('moreBtn').classList.toggle('on', currentTab === 'more');
  }
  $('moreBtn').addEventListener('click', () => { G.haptic(); switchTab(currentTab === 'more' ? prevTab : 'more'); });
  $('shClose').addEventListener('click', () => { G.haptic(); switchTab(prevTab); });
  window.addEventListener('keydown', e => {
    if (!$('modal').classList.contains('hidden')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = neighbor(e.key === 'ArrowRight' ? 1 : -1); if (n) switchTab(n); }
  });

  // ---------- swipen tussen onderdelen ----------
  const panel = $('panel');
  let sw = null, swallowClick = false;
  panel.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    sw = { x: e.clientX, y: e.clientY, id: e.pointerId, horiz: null };
  });
  panel.addEventListener('pointermove', e => {
    if (!sw || e.pointerId !== sw.id) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (sw.horiz === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) sw.horiz = Math.abs(dx) > Math.abs(dy) * 1.3;
    if (!sw.horiz) return;
    const sec = activeSection(), can = neighbor(dx < 0 ? 1 : -1);
    sec.style.transition = 'none';
    sec.style.transform = `translateX(${dx * (can ? 0.45 : 0.12)}px)`;
  });
  const swipeEnd = e => {
    if (!sw || e.pointerId !== sw.id) return;
    const dx = e.clientX - sw.x, horiz = sw.horiz, sec = activeSection();
    sw = null;
    sec.style.transition = ''; sec.style.transform = '';
    if (!horiz) return;
    swallowClick = true;
    setTimeout(() => { swallowClick = false; }, 50);
    if (Math.abs(dx) < 50) return;
    const n = neighbor(dx < 0 ? 1 : -1);
    if (n) { G.haptic(); switchTab(n); }
  };
  panel.addEventListener('pointerup', swipeEnd);
  panel.addEventListener('pointercancel', swipeEnd);
  // Een veegbeweging mag niet ook nog een knop indrukken.
  panel.addEventListener('click', e => { if (swallowClick) { e.stopPropagation(); e.preventDefault(); swallowClick = false; } }, true);

  // ---------- wat versterkt je modellen ----------
  function updateBoosts() {
    const tiles = [
      { tab: 'research', icon: '🔬', label: 'Onderzoek', v: G.mods.global },
      { tab: 'chips', icon: '⚡', label: 'Chips', v: G.computeBonus() },
      { tab: 'apps', icon: '📊', label: 'Data', v: G.dataBonus() },
      { tab: 'more', icon: '🌀', label: 'Bonus', v: G.mods.perm * G.buffMult('prod') },
      { tab: 'team', icon: '🛡️', label: 'Veilig', v: null },
    ];
    const box = $('boosts');
    if (!box.children.length) {
      box.innerHTML = `<p class="boost-intro">Je modellen zijn de basis. Alles eromheen vermenigvuldigt hun productie:</p>
        <div class="boost-grid">${tiles.map(t => `<button class="boost" data-tab="${t.tab}"><span class="bi">${t.icon}</span><span class="bl">${t.label}</span><span class="bv"></span></button>`).join('')}</div>`;
      box.addEventListener('click', e => { const b = e.target.closest('.boost'); if (b) { G.haptic(); switchTab(b.dataset.tab); } });
    }
    box.querySelectorAll('.boost').forEach((b, i) => {
      const t = tiles[i], open = G.tabUnlocked(t.tab);
      b.classList.toggle('lk', !open);
      const txt = !open ? '🔒' : t.v === null ? (G.safetyDeficit() ? `⚠ ${Math.floor(G.S.risk)}%` : '✓') : G.fmtMult(t.v);
      b.classList.toggle('warn', t.v === null && open && G.safetyDeficit() > 0);
      const v = b.querySelector('.bv');
      if (v.textContent !== txt) v.textContent = txt;
    });
  }
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => { G.haptic(); switchTab(b.dataset.tab); }));
  function switchSub(sub) {
    moreSub = sub;
    document.querySelectorAll('#moreSeg button').forEach(b => b.classList.toggle('on', b.dataset.s === sub));
    document.querySelectorAll('#tab-more .sub').forEach(s => s.classList.toggle('hidden', s.id !== 'sub-' + sub));
    refresh(true);
  }
  document.querySelectorAll('#moreSeg button').forEach(b => b.addEventListener('click', () => { G.haptic(); switchSub(b.dataset.s); }));
  document.querySelectorAll('#buyMode button').forEach(b => b.addEventListener('click', () => {
    G.S.buyMode = b.dataset.m === 'max' ? 'max' : +b.dataset.m;
    G.haptic(); refresh(true);
  }));

  // ---------- modal & toast ----------
  function modal(emoji, title, html, buttons) {
    const card = $('modalCard');
    card.innerHTML = `<div class="emoji">${emoji}</div><h3>${title}</h3><p>${html}</p><div class="btns"></div>`;
    const box = card.querySelector('.btns');
    for (const b of buttons) {
      const btn = el('button', b.cls || '', b.label);
      btn.onclick = () => { $('modal').classList.add('hidden'); b.onClick && b.onClick(); };
      box.appendChild(btn);
    }
    $('modal').classList.remove('hidden');
  }
  function toast(icon, title, sub) {
    const box = $('toasts');
    while (box.children.length >= 2) box.firstChild.remove();
    const t = el('div', 'toast', `<span class="ti">${icon}</span><div><b>${title}</b><small>${sub || ''}</small></div>`);
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2600);
  }
  G.ui = { modal, toast, switchTab, tapAt: (x, y, auto) => tapAt(x, y, auto) };

  // ---------- kern tikken ----------
  const stage = $('stage'), core = $('core'), floaters = $('floaters');
  // auto = getikt door een helper (telt niet mee als eigen tik)
  // Flow: snel achter elkaar tikken bouwt een combo op (tot ×3).
  let flow = 0, lastTap = 0;
  const flowMult = () => 1 + 2 * flow;
  function tapAt(cx, cy, auto) {
    let mult = auto ? G.internPower() : flowMult();
    const crit = !auto && Math.random() < 0.04;
    if (crit) mult *= 8;
    if (!auto) { flow = Math.min(1, flow + 0.06); lastTap = performance.now(); }
    const v = G.clickValue() * mult;
    G.earn(v); G.S.clickEarned += v;
    if (!auto) G.S.clicks++;
    const r = stage.getBoundingClientRect();
    const x = cx - r.left, y = cy - r.top;
    const storm = G.buffMult('click') > 1;
    if (!auto) {
      const w = el('div', 'shock' + (crit ? ' crit' : flow >= 1 ? ' max' : ''));
      w.style.left = x + 'px'; w.style.top = y + 'px';
      floaters.appendChild(w);
      setTimeout(() => w.remove(), 600);
    }
    if (crit || (auto ? (floaters.querySelectorAll('.auto').length < 4 && Math.random() < 0.5) : floaters.children.length < 30)) {
      const f = el('div', 'floater' + (crit ? ' crit big' : storm ? ' crit' : '') + (auto ? ' auto' : ''), (crit ? 'KRITIEK! +' : '+') + G.fmt(v));
      f.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
      f.style.top = (y - 10) + 'px';
      floaters.appendChild(f);
      setTimeout(() => f.remove(), 900);
    }
    G.fx.burst(x, y, auto ? 3 : crit ? 50 : storm ? 18 : 6 + Math.round(flow * 10), crit ? 45 : undefined);
    if (auto) return;
    core.classList.add('hit');
    setTimeout(() => core.classList.remove('hit'), 70);
    if (crit) {
      G.sfx.eureka(); G.haptic('HEAVY');
      $('app').animate([{ transform: 'translate(-4px, 2px)' }, { transform: 'translate(4px, -2px)' }, { transform: 'none' }], { duration: 160 });
    } else { G.sfx.tap(flow); G.haptic(flow >= 1 ? 'MEDIUM' : 'LIGHT'); }
  }
  // Flow zakt weg als je even niet tikt; de ring en het label tonen de stand.
  function updateFlow(dt) {
    if (performance.now() - lastTap > 450) flow = Math.max(0, flow - dt * 0.4);
    $('flowRing').style.strokeDashoffset = 615.8 * (1 - flow);
    core.classList.toggle('flowing', flow >= 1);
    const fl = flow > 0.03 ? (flow >= 1 ? 'FLOW ×3!' : `Flow ×${flowMult().toFixed(1).replace('.', ',')}`) : 'Tik snel voor flow';
    if ($('flowLbl').textContent !== fl) $('flowLbl').textContent = fl;
    $('flowLbl').classList.toggle('max', flow >= 1);
  }
  core.addEventListener('pointerdown', e => { e.preventDefault(); tapAt(e.clientX, e.clientY, false); });
  let autoAcc = 0;
  function autoTaps(dt) {
    const n = G.hl('intern');
    if (!n) return;
    autoAcc += n * dt;
    if (autoAcc < 1) return;
    const c = core.getBoundingClientRect(), visible = c.width > 0;
    while (autoAcc >= 1) {
      autoAcc--;
      if (visible) tapAt(c.left + c.width * (0.3 + Math.random() * 0.4), c.top + c.height * (0.3 + Math.random() * 0.4), true);
      else { const v = G.clickValue() * G.internPower(); G.earn(v); G.S.clickEarned += v; }
    }
  }

  // ---------- Eureka ----------
  let eurekaEl = null;
  function spawnEureka() {
    const r = stage.getBoundingClientRect();
    eurekaEl = el('button', 'eureka', '💡');
    eurekaEl.setAttribute('aria-label', 'Eureka!');
    eurekaEl.style.left = (20 + Math.random() * Math.max(10, r.width - 104)) + 'px';
    eurekaEl.style.top = (20 + Math.random() * Math.max(10, r.height - 120)) + 'px';
    const me = eurekaEl;
    me.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      const res = G.claimEureka();
      const er = me.getBoundingClientRect();
      G.fx.burst(er.left - r.left + 32, er.top - r.top + 32, 40, 45);
      G.fx.wave();
      G.sfx.eureka(); G.haptic('HEAVY');
      toast('💡', res.title, res.text);
      me.remove(); eurekaEl = null;
      refresh(true);
    });
    stage.appendChild(me);
    if (G.hl('scout') >= 5) setTimeout(() => {
      if (eurekaEl !== me) return;
      const b = me.getBoundingClientRect();
      me.dispatchEvent(new PointerEvent('pointerdown', { clientX: b.left + 32, clientY: b.top + 32 }));
      toast('🕵️', 'De talentscout ving een Eureka!', '');
    }, 2500);
    setTimeout(() => {
      if (eurekaEl !== me) return;
      me.classList.add('fade');
      setTimeout(() => me.remove(), 1000);
      eurekaEl = null;
      G.scheduleEureka();
    }, 13000);
  }

  // ---------- bovenbalk, buffs, tijdperk ----------
  function topIndex() { let t = -1; G.S.owned.forEach((n, i) => { if (n > 0) t = i; }); return t; }

  function updateTop() {
    const S = G.S;
    $('tokens').textContent = G.fmt(S.tokens);
    $('tps').textContent = G.fmtRate(G.totalTps());
    $('tapVal').textContent = `+${G.fmt(G.clickValue() * flowMult())} per tik`;
    const p = G.agiProgress();
    $('agiBar').style.width = (p * 100).toFixed(1) + '%';
    $('agiPct').textContent = S.agi ? 'AGI ✨' : `AGI ${(p * 100).toFixed(p < 0.1 ? 1 : 0).replace('.', ',')}%`;
    const ti = topIndex();
    core.dataset.era = Math.min(3, Math.floor((ti + 1) / 3));
    const ck = G.chapterIndex(), ch = G.CHAPTERS[ck];
    if ($('eraName').textContent !== ch.title) { $('eraName').textContent = ch.title; $('chIcon').textContent = ch.icon; $('chNum').textContent = 'H' + (ck + 1); }
    const hue = S.agi ? 290 : 195 + Math.max(0, ti) * 9;
    document.documentElement.style.setProperty('--hue', hue % 360);
    G.fx.setHue(hue % 360);
    const owned = S.owned.reduce((a, b) => a + b, 0);
    G.fx.setActivity(Math.min(1, 0.05 + Math.log10(1 + G.tps()) / 12), Math.min(80, 22 + Math.floor(Math.sqrt(owned) * 3)));

    const now = Date.now();
    const active = S.buffs.filter(b => b.until > now);
    const def = G.safetyDeficit();
    const html = active.map(b => `<span class="buff${b.mult < 1 ? ' bad' : ''}">${b.name} ×${String(b.mult).replace('.', ',')} · ${Math.ceil((b.until - now) / 1000)}s</span>`).join('')
      + (def && S.risk >= 10 ? `<button class="buff risk" id="riskPill">⚠️ Risico ${Math.floor(S.risk)}%</button>` : '');
    if ($('buffs').innerHTML !== html) $('buffs').innerHTML = html;
  }

  // ---------- nieuws ----------
  function nextNews() {
    const ti = G.S.agi ? 99 : topIndex();
    const pool = G.NEWS.filter(([e]) => e <= ti || (e === 0 && ti < 0));
    const recent = pool.filter(([e]) => e >= ti - 2);
    const pick = (recent.length && Math.random() < 0.75 ? recent : pool);
    const txt = pick.length ? pick[(Math.random() * pick.length) | 0][1] : '';
    const t = $('tickerText');
    t.style.opacity = 0;
    setTimeout(() => { t.textContent = '📰 ' + txt; t.style.opacity = 1; }, 500);
  }

  // ---------- verversen ----------
  function refresh(force) {
    updateTop();
    if (currentTab === 'models' || force) updateGens();
    updateResearch(force);
    if (force) updateSing();
    if (currentTab === 'more' && moreSub === 'ach' && force) updateAch();
    if (currentTab === 'more' && moreSub === 'set' && force) updateMore();
    G.uiInd.update(currentTab, force);
    G.uiRes.dots();
    if (currentTab === 'research') G.uiRes.update();
    if (currentTab === 'models') updateBoosts();
    if (force) updatePager();
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('locked', !G.tabUnlocked(b.dataset.tab)));
    document.querySelectorAll('#buyMode button').forEach(b => b.classList.toggle('on', String(G.S.buyMode) === b.dataset.m));
  }

  G.uiRefresh = refresh;
  G.on('chipDone', c => {
    G.sfx.big(); G.haptic('HEAVY'); G.fx.wave();
    toast(c.icon, `${c.name} ontwikkeld!`, `Al je chips zijn geüpgraded: ×${G.fmt(c.power)} rekenkracht per chip.`);
  });
  G.on('appLive', a => {
    G.sfx.milestone(); G.haptic('HEAVY');
    toast(a.icon, `${a.name} is live!`, 'Gebruikers leveren nu trainingsdata voor je modellen.');
  });
  $('buffs').addEventListener('click', e => { if (e.target.closest('#riskPill')) switchTab('team'); });
  G.on('chainMilestone', i => {
    G.sfx.milestone();
    toast(G.CHAIN[i].icon, `${G.CHAIN[i].name} ×2!`, `Mijlpaal bereikt: niveau ${G.S.chain[i]}`);
  });
  G.on('safetyWarn', w => {
    G.sfx.error(); G.haptic('MEDIUM');
    toast('⚠️', `Veiligheidsrisico ${w}%`, 'Neem safety-engineers aan of koop veiligheidsonderzoek, anders volgt een backlash.');
  });
  G.on('backlash', ([title, text]) => {
    G.sfx.error(); G.haptic('HEAVY');
    document.getElementById('app').animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300, iterations: 2 });
    modal('📰', `Backlash: ${title}`, `${text}<br><br><b style="color:var(--bad)">Productie −50% voor 2 minuten</b> en je apps verliezen 30% van hun gebruikers.<br><br>Investeer in veiligheid om dit te voorkomen.`,
      [{ label: 'Later' }, { label: 'Naar Team', cls: 'primary', onClick: () => switchTab('team') }]);
  });
  G.on('trendOffer', o => {
    const a = G.APPS.find(x => x.id === o.id);
    G.sfx.eureka();
    if (currentTab !== 'apps') toast('🔥', `${a.name} gaat viraal!`, 'Ga naar Apps en tik op de app om de hype te benutten.');
  });
  G.on('autoCampaign', () => { if (currentTab === 'apps') toast('📣', 'De marketeer startte een campagne', ''); });
  // ---------- verhaal ----------
  function showChapter(k) {
    const ch = G.CHAPTERS[k];
    modal(ch.icon, `Hoofdstuk ${k + 1} · ${ch.title}`, `${ch.text}<br><br><b>Doel:</b> ${ch.goal}`, [{ label: 'Verder', cls: 'primary' }]);
  }
  function showNewChapter() {
    if (!$('modal').classList.contains('hidden')) return;
    const k = G.unseenChapter();
    if (k < 0) return;
    G.markChapter(k);
    if (k) { G.sfx.big(); G.fx.wave(); }
    showChapter(k);
  }
  $('chapterChip').addEventListener('click', () => { G.haptic(); showChapter(G.chapterIndex()); });

  G.on('labDone', u => {
    G.sfx.big(); G.fx.wave();
    const h = G.HELPERS.find(x => G.HELPER_LAB[x.id] === u.id);
    if (h && u.id !== 'lab_hr') toast(h.icon, `Nieuwe helper: ${h.name}`, 'Neem hem aan in Team.');
    updatePager();
  });
  const seenTabs = {};
  function checkUnlocks() {
    for (const t of Object.keys(G.TAB_UNLOCK)) {
      const u = G.tabUnlocked(t);
      if (u && seenTabs[t] === false) { G.sfx.achievement(); toast('🔓', `Nieuw: ${TAB_NAMES[t]}!`, { chips: 'Bouw je eigen chip-supply chain.', apps: 'Bouw apps met je modellen.', team: 'Neem helpers aan.' }[t]); }
      if (u !== seenTabs[t]) updatePager();
      seenTabs[t] = u;
    }
  }

  G.on('milestone', ({ i }) => {
    G.sfx.milestone();
    toast(G.GENS[i].icon, `${G.GENS[i].name} ×2!`, `Mijlpaal bereikt: ${G.S.owned[i]} stuks`);
  });

  function showOffline(off) {
    if (off.secs < 60 || off.amt < 1) return;
    modal('🌙', 'Welkom terug!', `Terwijl je weg was (${G.fmtTime(off.secs)}) bleven je modellen trainen.<br><br><b style="color:var(--gold);font-size:26px">+${G.fmt(off.amt)}</b> tokens`, [{ label: 'Ophalen', cls: 'primary', onClick: () => { G.sfx.eureka(); G.fx.wave(); } }]);
  }

  // ---------- spellus ----------
  let lastFrame = performance.now(), uiTimer = 0, achTimer = 0, saveTimer = 0, newsTimer = 0;
  function frame(t) {
    const dt = Math.min(0.1, (t - lastFrame) / 1000);
    lastFrame = t;
    const off = G.tick();
    if (off) { showOffline(off); refresh(true); }
    G.fx.frame(dt, t);
    autoTaps(dt);
    updateFlow(dt);

    uiTimer += dt; achTimer += dt; saveTimer += dt; newsTimer += dt;
    if (uiTimer > 0.15) { uiTimer = 0; refresh(false); }
    if (achTimer > 1) {
      achTimer = 0;
      for (const a of G.checkAchievements()) { toast(a.icon, 'Prestatie: ' + a.name, a.desc + ' (+1% productie)'); G.sfx.achievement(); }
      if (!eurekaEl && Date.now() > G.nextEureka && stage.offsetHeight > 0) spawnEureka();
      if (currentTab === 'more' && moreSub === 'ach') updateAch();
      updateSing();
      checkUnlocks();
      showNewChapter();
    }
    if (saveTimer > 10) { saveTimer = 0; G.save(); }
    if (newsTimer > 9) { newsTimer = 0; nextNews(); }
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden) G.save(); });
  window.addEventListener('pagehide', () => G.save());

  // ---------- native (Capacitor) ----------
  const Cap = window.Capacitor;
  if (Cap && Cap.isNativePlatform && Cap.isNativePlatform()) {
    const P = Cap.Plugins;
    const safe = f => { try { const r = f(); if (r && r.catch) r.catch(() => {}); } catch (e) {} };
    if (Cap.getPlatform() === 'android' && P.StatusBar) {
      safe(() => P.StatusBar.setOverlaysWebView({ overlay: false }));
      safe(() => P.StatusBar.setBackgroundColor({ color: '#060914' }));
    }
    if (P.StatusBar) safe(() => P.StatusBar.setStyle({ style: 'DARK' }));
    if (P.App) {
      safe(() => P.App.addListener('backButton', () => {
        if (!$('modal').classList.contains('hidden')) { $('modal').classList.add('hidden'); return; }
        if (currentTab !== 'models') { switchTab('models'); return; }
        G.save();
        safe(() => P.App.minimizeApp());
      }));
      safe(() => P.App.addListener('pause', () => G.save()));
    }
  }

  // ---------- start ----------
  (async () => {
    await G.load();
    G.migrateTree();
    G.fx.init($('fx'));
    buildGens();
    G.scheduleEureka();
    G.nextEureka = Math.min(G.nextEureka, Date.now() + 120000);
    const off = G.tick();
    refresh(true);
    nextNews();
    checkUnlocks();
    placeIndicator();
    setTimeout(() => {
      if (G.S.settings.swipeHint) return;
      G.S.settings.swipeHint = true;
      toast('👆', 'Tip: veeg om te wisselen', 'Veeg over het paneel naar links of rechts om naar een ander onderdeel te gaan.');
    }, 20000);
    if (off) showOffline(off);
    else showNewChapter();
    requestAnimationFrame(frame);
  })();
})();

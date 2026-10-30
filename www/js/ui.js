// Interface en spellus.
(function () {
  const G = window.G;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  const TEST_TOKENS = 1e30; // genoeg voor alles, zonder dat de getallen onleesbaar worden
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
    const S = G.S;
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
      if (!rev) e.rate.textContent = T('Nog niet ontdekt');
      else if (tech) e.rate.textContent = T('Eerst onderzoeken: {0}', tech.name);
      const next = G.nextMilestone(S.owned[i]);
      // Eén regel: wat het oplevert en wanneer de volgende verdubbeling komt (de balk loopt ernaartoe).
      if (rev && !tech) e.rate.textContent = S.owned[i] ? `${G.fmtRate(G.genRate(i))}${next ? T(' · 2× bij {0}', next) : ''}` : g.desc;
      const prevIdx = G.MILESTONES.indexOf(next) - 1, prev = prevIdx >= 0 ? G.MILESTONES[prevIdx] : 0;
      e.mbar.style.width = next ? ((S.owned[i] - prev) / (next - prev) * 100) + '%' : '100%';
      const ml = !rev ? '' : next ? T('2× productie bij {0}{1}', next, G.milestoneLevel(S.owned[i]) ? T(' · nu ×{0}', G.fmt(Math.pow(2, G.milestoneLevel(S.owned[i])))) : '') : T('Alle mijlpalen gehaald');
      if (e.ml.textContent !== ml) e.ml.textContent = ml;
      e.q.textContent = tech ? T('onderzoeken') : rev ? T('kopen ×{0}', k) + (next && S.owned[i] + k >= next ? ' ⭐' : '') : '';
      e.c.textContent = G.fmt(tech ? tech.cost : cost);
    });
  }

  // ---------- onderzoek ----------
  let lastUpgKey = '';
  // Boosts: losse verbeteringen per soort, steeds alleen de goedkoopste die nu kan (per model één).
  const BOOST_GROUPS = [
    [T('Modellen'), u => u.kind === 'gen'],
    [T('Tikken'), u => u.kind === 'click' || u.kind === 'clickPct'],
    [T('Infrastructuur'), u => u.kind === 'global'],
    [T('Eureka en offline'), u => /^eureka|^offline/.test(u.kind)],
  ];
  const boostName = u => (u.kind === 'gen' ? `${u.sub}: ${u.name.toLowerCase()}` : u.name);
  const boostDesc = u => (u.kind === 'gen' ? T('2× productie van dit model.') : u.desc);
  function updateResearch(force) {
    const all = G.UPGRADES.filter(u => !u.tree && !u.safetyTab);
    const avail = G.availableUpgrades().filter(u => !u.safetyTab).sort((x, y) => x.cost - y.cost);
    const groups = BOOST_GROUPS.map(([title, f]) => {
      const seen = new Set();
      const list = avail.filter(f).filter(u => { const k = u.kind === 'gen' ? u.gen : u.kind; return !seen.has(k) && seen.add(k); });
      const items = all.filter(f);
      return { title, list: title === 'Modellen' ? list.slice(0, 4) : list.slice(0, 1), done: items.filter(u => G.S.upgrades[u.id]).length, total: items.length };
    });
    const key = groups.map(g => g.list.map(u => u.id).join()).join('|');
    const list = $('upgList');
    if (force || key !== lastUpgKey) {
      lastUpgKey = key;
      list.innerHTML = '';
      if (!avail.length) list.appendChild(el('div', 'empty', T('Nu even geen boosts. Koop meer modellen om nieuwe vrij te spelen.')));
      for (const g of groups) {
        if (!g.list.length) continue;
        list.appendChild(el('div', 'subhead', `${g.title} <span class="muted">${T('· {0} van {1}', g.done, g.total)}</span>`));
        for (const u of g.list) {
          // Zelfde kaart als in de bomen: één tik onderzoekt meteen.
          const row = el('div', 'gen res-card upg');
          row.dataset.id = u.id;
          row.innerHTML = `<div class="gicon"><span>${u.icon}</span></div><div class="ginfo"><div class="gname">${boostName(u)}</div><div class="grate">${boostDesc(u)}</div></div><button class="gbuy"><span class="q">${T('kopen')}</span><span class="c">${G.fmt(u.cost)}</span></button>`;
          row.addEventListener('click', () => {
            if (G.buyUpgrade(u.id)) { G.sfx.upgrade(); G.haptic('MEDIUM'); toast(u.icon, boostName(u), boostDesc(u)); refresh(true); }
            else G.sfx.error();
          });
          list.appendChild(row);
        }
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
      ? `<div class="big-card"><div style="font-size:44px">✨</div><h3>${T('Project AGI')}</h3>
          <p>${T('Combineer alles wat je hebt gebouwd tot één algemene intelligentie.')}<br>${T('Beloning: {0}.', `<b>${T('alle productie permanent ×2')}</b>`)}</p>
          <div class="big-num">${G.fmt(G.agiCost())}</div>
          <button class="cta gold" id="agiBtn" ${S.tokens >= G.agiCost() ? '' : 'disabled'}>${T('Bouw AGI')}</button></div>`
      : `<div class="big-card"><div style="font-size:44px">${S.agi ? '✅' : '🔒'}</div><h3>${T('Project AGI')}</h3>
          <p>${S.agi ? T('Je hebt AGI gebouwd in deze cyclus! Activeer de singulariteit om opnieuw te beginnen met een nóg slimmer startpunt.')
                     : T('Ontgrendel het laatste model ({0}) om AGI te kunnen bouwen.', G.GENS[G.GENS.length - 1].name)}</p>
          <p>${T('AGI gebouwd: {0} (bonus {1})', `<b>${S.agiCount}×</b>`, G.fmtMult(G.mods.agiBonus))}</p></div>`;
    $('singBody').innerHTML = agiHtml + `
      <div class="big-card"><div style="font-size:44px">🌀</div><h3>${T('Singulariteit')}</h3>
        <p>${T('Je modellen, chips, apps, team en tokens beginnen opnieuw; je lab blijft. In ruil krijg je inzichten: elk inzicht geeft permanent {0}.', `<b>${T('+2% productie')}</b>`)}</p>
        <p>${T('Inzichten nu: {0}', `<b>${S.insights}</b>`)} (+${Math.round((G.mods.insightBonus - 1) * 100)}%)</p>
        <div class="big-num">+${G.fmt(p)}</div>
        <p>${p >= 1 ? T('inzichten bij activeren') : T('Volgend inzicht bij {0} totaal verdiende tokens', G.fmt(nextAt))}</p>
        ${G.labDone('lab_sing') ? `<button class="cta" id="singBtn" ${p >= 1 ? '' : 'disabled'}>${T('Activeer singulariteit')}</button>`
          : `<p>${T('Onderzoek eerst het {0} in je lab.', `<b>${T('Singulariteitsinstituut')}</b>`)}</p><button class="cta" id="singLab">${T('naar het lab')}</button>`}</div>`;
    const ab = $('agiBtn');
    if (ab) ab.onclick = buildAGI;
    if ($('singBtn')) $('singBtn').onclick = confirmPrestige;
    if ($('singLab')) $('singLab').onclick = () => G.uiRes.open('lab', 'lab_sing');
    $('dotSing').classList.toggle('show', (G.agiUnlocked() && S.tokens >= G.agiCost()) || p >= Math.max(10, S.insights));
  }

  function confirmPrestige() {
    const p = G.pendingInsights();
    if (p < 1) return;
    modal('🌀', T('Singulariteit activeren?'), T('Je begint opnieuw, maar met {0} extra inzichten (+{1}% productie). Prestaties blijven behouden.', `<b>${G.fmt(p)}</b>`, G.fmt(p * 2)), [
      { label: T('Annuleren') },
      { label: T('Activeren'), cls: 'primary', onClick: () => {
        G.prestige(); G.sfx.big(); G.haptic('HEAVY'); flashScreen();
        buildGens(); refresh(true); G.save();
        toast('🌀', T('Een nieuwe cyclus begint'), T('Productie nu {0}', G.fmtMult(G.mods.perm)));
      } },
    ]);
  }

  function buildAGI() {
    if (!G.buyAGI()) return;
    G.sfx.big(); G.haptic('HEAVY'); flashScreen();
    setTimeout(() => modal('✨', T('AGI bereikt!'),
      `${T('Van één perceptron naar algemene intelligentie. De mensheid kijkt vol ontzag toe.')}<br><br>${T('Je productie is nu permanent {0}.', `<b>×${G.fmt(G.mods.agiBonus)}</b>`)}<br>${T('Activeer de singulariteit om het nóg sneller te doen. Het volgende AGI-project is 10× zo groot.')}`,
      [{ label: T('Doorgaan'), cls: 'primary' }]), 900);
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
      <div class="section-title">${T('Statistieken')}</div>
      <div class="row"><span>${T('Tokens deze cyclus')}</span><b>${G.fmt(S.runEarned)}</b></div>
      <div class="row"><span>${T('Tokens totaal')}</span><b>${G.fmt(S.lifeEarned)}</b></div>
      <div class="row"><span>${T('Per tik')}</span><b>${G.fmt(G.clickValue())}</b></div>
      <div class="row"><span>${T('Aantal tikken')}</span><b>${S.clicks.toLocaleString(G.LOCALE)}</b></div>
      <div class="row"><span>${T('Verdiend met tikken')}</span><b>${G.fmt(S.clickEarned)}</b></div>
      <div class="row"><span>${T('Eureka-momenten')}</span><b>${S.eurekas}</b></div>
      <div class="row"><span>${T('Singulariteiten')}</span><b>${S.prestiges}</b></div>
      <div class="row"><span>${T('Rekenkracht')}</span><b>${G.fmt(G.compute())} (${G.fmtMult(G.computeBonus())})</b></div>
      <div class="row"><span>${T('Data uit apps')}</span><b>${G.fmt(G.dataValue())} (${G.fmtMult(G.dataBonus())})</b></div>
      <div class="row"><span>${T('Totale bonus')}</span><b>${G.fmtMult(G.mods.perm)}</b></div>
      <div class="row"><span>${T('Offline productie')}</span><b>${Math.round(G.mods.offline * 100)}%</b></div>
      <div class="row"><span>${T('Speeltijd')}</span><b>${G.fmtTime(played)}</b></div>
      <div class="section-title">${T('Instellingen')}</div>
      <button class="row row-btn" id="langBtn"><span>${T('Taal')}</span><b>${G.LANGS.find(l => l.code === G.LANG).flag} ${G.LANGS.find(l => l.code === G.LANG).name} ›</b></button>
      <div class="row"><span>${T('Muziek')}</span><button class="switch ${S.settings.music ? 'on' : ''}" data-set="music" aria-label="Muziek"></button></div>
      <div class="row"><span>${T('Geluidseffecten')}</span><button class="switch ${S.settings.sound ? 'on' : ''}" data-set="sound" aria-label="Geluidseffecten"></button></div>
      <div class="row"><span>${T('Trillen')}</span><button class="switch ${S.settings.haptics ? 'on' : ''}" data-set="haptics" aria-label="Trillen"></button></div>
      <div class="section-title">${T('Testen')}</div>
      <div class="row"><span>${T('Onbeperkt tokens')}<small class="row-sub">${T('Om alles uit te proberen. Bij uitzetten krijg je je eigen tokens terug.')}</small></span><button class="switch ${S.settings.cheat ? 'on' : ''}" data-set="cheat" aria-label="Onbeperkt tokens"></button></div>
      <div class="section-title">${T('Hoe speel je?')}</div>
      <div class="small-print">${T('Tik op de kern om tokens te verdienen. Koop modellen die automatisch tokens maken; bij 25, 50, 100… stuks verdubbelt hun productie. Onderzoek geeft extra boosts. Chips geven rekenkracht die al je modellen sneller maakt: je maakt ze zelf in je eigen keten, van zand tot chip, en zet ze in je datacenter. Nieuwe chips vervangen de oude geleidelijk. Lanceer apps: hun gebruikers leveren trainingsdata die je modellen versterkt. Neem helpers aan die werk voor je doen. Veeg links of rechts over het paneel om van onderdeel te wisselen. Ada geeft je steeds een nieuwe opdracht met een beloning. Tik op een gouden 💡 voor een Eureka-moment. Bouw uiteindelijk AGI en activeer de singulariteit voor permanente bonussen. Ook als de app dicht is gaat de training door.')}</div>
      <button class="danger" id="wipeBtn">${T('Voortgang wissen')}</button>
      <div class="small-print">${T('Road to AGI · versie 1.1')}<br>${T('Dit spel verzamelt geen persoonsgegevens. Je voortgang wordt alleen op dit apparaat opgeslagen.')}</div>`;
    for (const sw of $('moreBody').querySelectorAll('.switch')) {
      sw.onclick = () => {
        const k = sw.dataset.set; S.settings[k] = !S.settings[k]; sw.classList.toggle('on', S.settings[k]); G.haptic(); G.save();
        if (k === 'music') S.settings.music ? G.music.start() : G.music.stop();
        if (k === 'cheat') {
          // Bewaar je echte tokens, zodat uitzetten je terugbrengt waar je was.
          if (S.settings.cheat) { S.cheatBackup = S.tokens; S.tokens = TEST_TOKENS; toast('🧪', T('Testmodus aan'), T('Onbeperkt tokens: probeer alles uit.')); }
          else { S.tokens = S.cheatBackup || 0; delete S.cheatBackup; toast('🧪', T('Testmodus uit'), T('Je eigen tokens zijn terug.')); }
          refresh(true);
        }
      };
    }
    $('langBtn').onclick = () => { G.haptic(); showLangPicker(false); };
    $('wipeBtn').onclick = () => modal('⚠️', T('Alles wissen?'), T('Al je voortgang, inzichten en prestaties worden definitief verwijderd.'), [
      { label: T('Annuleren') },
      { label: T('Wissen'), cls: 'bad', onClick: async () => { await G.wipe(); buildGens(); $('achGrid').innerHTML = ''; G.uiInd.reset(); refresh(true); switchTab('models'); } },
    ]);
  }

  // ---------- tabs ----------
  const TAB_ORDER = ['models', 'chips', 'apps', 'research', 'team', 'safety'];
  const TAB_META = {
    models:   ['🧠', T('Modellen'), T('Je modellen maken tokens')],
    chips:    ['💾', T('Chips'), T('Rekenkracht voor je modellen')],
    apps:     ['📱', T('Apps'), T('Gebruikers leveren data')],
    research: ['🔬', T('Onderzoek'), T('Elke stap opent iets nieuws')],
    team:     ['👥', T('Team'), T('Helpers die voor je werken')],
    safety:   ['🛡️', T('Veiligheid'), T('Bouw verantwoord, voorkom backlash')],
    more:     ['☰', T('Menu'), T('Singulariteit en instellingen')],
  };
  let prevTab = 'models';
  // Modellen, Chips en Apps hebben een eigen speelveld; de rest is een volledig scherm.
  const SCREENS = { models: 'models', chips: 'chips', apps: 'apps' };
  const TAB_NAMES = { models: T('Modellen'), research: T('Onderzoek'), chips: T('Chips'), apps: T('Apps'), team: T('Team'), safety: T('Veiligheid'), more: T('Menu') };
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
      modal(TAB_META[t][0], T('{0} is nog op slot', TAB_NAMES[t]),
        T('Open dit onderdeel door in je lab de afdeling {0} te onderzoeken ({1} tokens).', `<b>${lock.icon} ${lock.name}</b>`, G.fmt(lock.cost)),
        [{ label: T('Later') }, { label: T('Naar het lab'), cls: 'primary', onClick: () => G.uiRes.open('lab', lock.id) }]);
      return;
    }
    if (t === 'more' && currentTab !== 'more') prevTab = currentTab;
    const dir = t === 'more' || currentTab === 'more' ? 0 : TAB_ORDER.indexOf(t) - TAB_ORDER.indexOf(currentTab);
    currentTab = t;
    $('app').dataset.screen = SCREENS[t] || 'full';
    $('app').dataset.tab = t;
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
    $('buyCycle').classList.toggle('hidden', currentTab !== 'models');
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
      { tab: 'research', icon: '🔬', label: T('Boosts'), v: G.mods.global },
      { tab: 'chips', icon: '💾', label: T('Chips'), v: G.computeBonus() },
      { tab: 'apps', icon: '📊', label: T('Data'), v: G.dataBonus() },
      { tab: 'more', icon: '🌀', label: T('Bonus'), v: G.mods.perm * G.buffMult('prod') },
      { tab: 'safety', icon: '🛡️', label: T('Veilig'), v: null },
    ];
    const box = $('boosts');
    if (!box.children.length) {
      box.innerHTML = `<div class="boost-grid">${tiles.map(t => `<button class="boost" data-tab="${t.tab}"><span class="bi">${t.icon}</span><span class="bl">${t.label}</span><span class="bv"></span></button>`).join('')}</div>`;
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
  // Eén knop in de kop die rondgaat: ×1 → ×10 → ×100 → max.
  const MODES = [1, 10, 100, 'max'];
  $('buyCycle').addEventListener('click', () => {
    G.S.buyMode = MODES[(MODES.indexOf(G.S.buyMode) + 1) % MODES.length];
    G.haptic(); refresh(true);
  });
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
  // Taalkeuze: vlag, taalnaam en land in die taal. Bij de eerste start en via Instellingen.
  function showLangPicker(first) {
    const card = $('modalCard');
    card.innerHTML = `<div class="emoji">🌐</div><h3>${first ? T('Kies je taal · Choose your language') : T('Taal')}</h3>
      <div class="lang-grid">${G.LANGS.map(l => `<button class="lang${l.code === G.LANG ? ' on' : ''}" data-l="${l.code}">
        <span class="lf">${l.flag}</span><span class="ln"><b>${l.name}</b><small>${l.country}</small></span></button>`).join('')}</div>
      <div class="btns">${first ? '' : `<button>${T('Annuleren')}</button>`}</div>`;
    card.querySelectorAll('.lang').forEach(b => b.onclick = () => {
      G.haptic('MEDIUM');
      if (b.dataset.l === G.LANG && !first) { $('modal').classList.add('hidden'); return; }
      G.setLang(b.dataset.l);
    });
    const cancel = card.querySelector('.btns button');
    if (cancel) cancel.onclick = () => $('modal').classList.add('hidden');
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
  // De kern groeit mee met het verhaal: van één neuron tot AGI.
  function setCoreArt(k) {
    core.dataset.ch = k;
    core.querySelector('.net').innerHTML = G.CORE_ART[k];
    const orb = core.querySelector('.orb');
    orb.setAttribute('r', 50 + k * 1.6);
    orb.setAttribute('fill', k === G.CHAPTERS.length - 1 ? 'url(#orbGold)' : 'url(#orbGrad)');
  }
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
      const f = el('div', 'floater' + (crit ? ' crit big' : storm ? ' crit' : '') + (auto ? ' auto' : ''), (crit ? T('KRITIEK! +') : '+') + G.fmt(v));
      f.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
      f.style.top = (y - 10) + 'px';
      floaters.appendChild(f);
      setTimeout(() => f.remove(), 900);
    }
    G.fx.burst(x, y, auto ? 3 : crit ? 50 : storm ? 18 : 6 + Math.round(flow * 10), crit ? 45 : undefined);
    if (auto) return;
    core.classList.add('hit');
    const net = core.querySelector('.net');
    net.classList.remove('zap'); void net.getBoundingClientRect(); net.classList.add('zap');
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
    const fl = flow > 0.03 ? (flow >= 1 ? T('FLOW ×3!') : T('Flow ×{0}', flowMult().toFixed(1).replace('.', G.DEC))) : '';
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
    eurekaEl.setAttribute('aria-label', T('Eureka!'));
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
      toast('🕵️', T('De talentscout ving een Eureka!'), '');
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
    $('tapVal').textContent = T('+{0} per tik', G.fmt(G.clickValue() * flowMult()));
    const p = G.agiProgress();
    $('agiBar').style.width = (p * 100).toFixed(1) + '%';
    $('agiPct').textContent = S.agi ? T('AGI ✨') : T('AGI {0}%', (p * 100).toFixed(p < 0.1 ? 1 : 0).replace('.', G.DEC));
    const ti = topIndex();
    core.dataset.era = Math.min(3, Math.floor((ti + 1) / 3));
    const ck = G.chapterIndex(), ch = G.CHAPTERS[ck];
    if ($('eraName').textContent !== ch.title) {
      $('eraName').textContent = ch.title; $('chIcon').textContent = ch.icon; $('chNum').textContent = 'H' + (ck + 1);
      G.music.setLevel(ck, !!S.agi);
      setCoreArt(ck);
    }
    const hue = S.agi ? 290 : 195 + Math.max(0, ti) * 9;
    document.documentElement.style.setProperty('--hue', hue % 360);
    G.fx.setHue(hue % 360);
    const owned = S.owned.reduce((a, b) => a + b, 0);
    G.fx.setActivity(Math.min(1, 0.05 + Math.log10(1 + G.tps()) / 12), Math.min(80, 22 + Math.floor(Math.sqrt(owned) * 3)));

    const now = Date.now();
    const active = S.buffs.filter(b => b.until > now);
    const def = G.safetyDeficit();
    const html = active.map(b => `<span class="buff${b.mult < 1 ? ' bad' : ''}">${b.name} ×${String(b.mult).replace('.', G.DEC)} · ${Math.ceil((b.until - now) / 1000)}s</span>`).join('')
      + (def && S.risk >= 50 ? `<button class="buff risk" id="riskPill">${T('Risico {0}%', Math.floor(S.risk))}</button>` : '');
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
    const bm = G.S.buyMode === 'max' ? 'max' : '×' + G.S.buyMode;
    if ($('buyCycle').textContent !== bm) $('buyCycle').textContent = bm;
  }

  G.uiRefresh = refresh;
  G.on('chipDone', c => {
    G.sfx.big(); G.haptic('HEAVY'); G.fx.wave();
    toast(c.icon, T('{0} ontwikkeld!', c.name), T('Nieuwe chips vervangen je oude geleidelijk: ×{0} rekenkracht per chip.', G.fmt(c.power)));
  });
  G.on('appLive', a => {
    G.sfx.milestone(); G.haptic('HEAVY');
    toast(a.icon, T('{0} is live!', a.name), T('Gebruikers leveren nu trainingsdata voor je modellen.'));
  });
  $('buffs').addEventListener('click', e => { if (e.target.closest('#riskPill')) switchTab('safety'); });
  G.on('chainMilestone', i => {
    G.sfx.milestone();
    toast(G.CHAIN[i].icon, `${G.CHAIN[i].name} ×2!`, T('Mijlpaal bereikt: niveau {0}', G.S.chain[i]));
  });
  G.on('safetyWarn', w => {
    G.sfx.error(); G.haptic('MEDIUM');
    toast('⚠️', T('Veiligheidsrisico {0}%', w), T('Kijk in Veiligheid: neem safety-engineers aan of onderzoek veiligheid.'));
  });
  // Een backlash is zeldzaam (daarna volgt een rustperiode). Alleen de eerste keer een groot venster.
  G.on('backlash', ([title, text]) => {
    G.sfx.error(); G.haptic('HEAVY');
    const effect = T('Productie −50% voor {0}, apps verliezen {1}% van hun gebruikers.', G.fmtTime(G.backlashDuration()), Math.round(G.backlashUserLoss() * 100));
    if (G.S.backlashes === 1) {
      document.getElementById('app').animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300, iterations: 2 });
      modal('📰', T('Backlash: {0}', title), `${text}<br><br><b style="color:var(--bad)">${effect}</b><br><br>${T('Daarna heb je {0} rust om je veiligheid op orde te brengen.', G.fmtTime(G.calmDuration()))}`,
        [{ label: T('Later') }, { label: T('Naar Veiligheid'), cls: 'primary', onClick: () => switchTab('safety') }]);
    } else toast('📰', T('Backlash: {0}', title), effect);
  });
  G.on('trendOffer', o => {
    const a = G.APPS.find(x => x.id === o.id);
    G.sfx.eureka();
    if (currentTab !== 'apps') toast('🔥', T('{0} gaat viraal!', a.name), T('Tik op de app in Apps om de hype te benutten.'));
  });
  G.on('autoCampaign', () => { if (currentTab === 'apps') toast('📣', T('De marketeer startte een campagne'), ''); });
  // ---------- verhaal ----------
  function showChapter(k) {
    const ch = G.CHAPTERS[k];
    modal(ch.icon, T('Hoofdstuk {0} · {1}', k + 1, ch.title), `<span class="ch-year">${ch.year}</span><br>${ch.text}<br><br><b>${T('Doel:')}</b> ${ch.goal}`, [{ label: T('Verder'), cls: 'primary' }]);
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
    if (h && u.id !== 'lab_hr' && h.id !== 'safety') toast(h.icon, T('Nieuwe helper: {0}', h.name), T('Je vindt deze helper in Team.'));
    updatePager();
  });
  const seenTabs = {};
  function checkUnlocks() {
    for (const t of Object.keys(G.TAB_UNLOCK)) {
      const u = G.tabUnlocked(t);
      if (u && seenTabs[t] === false) { G.sfx.achievement(); toast('🔓', T('Nieuw: {0}!', TAB_NAMES[t]), { chips: T('Bouw je eigen chipketen en een datacenter.'), apps: T('Bouw apps met je modellen.'), team: T('Neem helpers aan.'), safety: T('Houd je modellen veilig en voorkom backlash.') }[t]); }
      if (u !== seenTabs[t]) updatePager();
      seenTabs[t] = u;
    }
  }

  G.on('milestone', ({ i }) => {
    G.sfx.milestone();
    toast(G.GENS[i].icon, `${G.GENS[i].name} ×2!`, T('Mijlpaal bereikt: {0} stuks', G.S.owned[i]));
  });

  function showOffline(off) {
    if (off.secs < 60 || off.amt < 1) return;
    modal('🌙', T('Welkom terug!'), `${T('Terwijl je weg was ({0}) bleven je modellen trainen.', G.fmtTime(off.secs))}<br><br><b style="color:var(--gold);font-size:26px">+${G.fmt(off.amt)}</b> ${T('tokens')}`, [{ label: T('Ophalen'), cls: 'primary', onClick: () => { G.sfx.eureka(); G.fx.wave(); } }]);
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
    if (G.S.settings.cheat && G.S.tokens < TEST_TOKENS) G.S.tokens = TEST_TOKENS;
    $('app').classList.toggle('cheat', !!G.S.settings.cheat);
    updateFlow(dt);

    uiTimer += dt; achTimer += dt; saveTimer += dt; newsTimer += dt;
    if (uiTimer > 0.15) { uiTimer = 0; refresh(false); }
    if (achTimer > 1) {
      achTimer = 0;
      for (const a of G.checkAchievements()) { toast(a.icon, T('Prestatie: {0}', a.name), T('{0} (+1% productie)', a.desc)); G.sfx.achievement(); }
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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { G.save(); G.music.stop(); } else if (heardTap) G.music.start();
  });
  // Muziek mag pas klinken na een aanraking; daarna start hij vanzelf.
  let heardTap = false;
  document.addEventListener('pointerdown', () => { heardTap = true; G.music.start(); });
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
  G.translateDom(document.getElementById('app'));
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
      toast('👆', T('Tip: veeg om te wisselen'), T('Veeg over het paneel naar links of rechts om naar een ander onderdeel te gaan.'));
    }, 20000);
    if (!G.LANG_SET) showLangPicker(true);
    else if (off) showOffline(off);
    else showNewChapter();
    requestAnimationFrame(frame);
  })();
})();

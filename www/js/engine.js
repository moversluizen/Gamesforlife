// Spelregels: productie, kosten, aankopen, Eureka, singulariteit en opslaan.
(function () {
  const G = window.G;
  const GROW = 1.15;
  const SAVE_KEY = 'road-to-agi-save-v1';
  const OFFLINE_CAP = 8 * 3600;

  G.newState = () => ({
    v: 1,
    tokens: 0, runEarned: 0, lifeEarned: 0,
    clicks: 0, clickEarned: 0,
    owned: G.GENS.map(() => 0),
    upgrades: {}, ach: {},
    insights: 0, prestiges: 0, eurekas: 0,
    agi: false, agiCount: 0,
    buffs: [],
    started: Date.now(), runStarted: Date.now(), lastTick: Date.now(),
    buyMode: 1,
    settings: { sound: true, haptics: true },
    ...(G.industryDefaults ? G.industryDefaults() : {}),
  });

  G.S = G.newState();

  // ---------- multipliers ----------
  G.recalc = function () {
    const S = G.S;
    const m = { gen: G.GENS.map(() => 1), global: 1, click: 1, clickPct: 0, euFreq: 1, euDur: 1, offline: 0.5, chain: 1, slots: 1, app: 1, rndTime: 1 };
    for (const u of G.UPGRADES) {
      if (!S.upgrades[u.id]) continue;
      if (u.kind === 'gen') m.gen[u.gen] *= u.mult;
      else if (u.kind === 'global') m.global *= u.mult;
      else if (u.kind === 'click') m.click *= u.mult;
      else if (u.kind === 'clickPct') m.clickPct += u.mult;
      else if (u.kind === 'eurekaFreq') m.euFreq *= u.mult;
      else if (u.kind === 'eurekaDur') m.euDur *= u.mult;
      else if (u.kind === 'offline') m.offline = Math.max(m.offline, u.mult);
      else if (u.kind === 'chain') m.chain *= u.mult;
      else if (u.kind === 'slots') m.slots *= u.mult;
      else if (u.kind === 'app') m.app *= u.mult;
    }
    if (G.industryMods) G.industryMods(m);
    m.achCount = Object.keys(S.ach).length;
    m.insightBonus = 1 + 0.02 * S.insights;
    m.achBonus = 1 + 0.01 * m.achCount;
    m.agiBonus = Math.pow(2, S.agiCount);
    m.perm = m.insightBonus * m.achBonus * m.agiBonus;
    G.mods = m;
  };

  G.buffMult = type => {
    const now = Date.now();
    let x = 1;
    for (const b of G.S.buffs) if (b.type === type && b.until > now) x *= b.mult;
    return x;
  };

  G.milestoneLevel = owned => { let n = 0; for (const m of G.MILESTONES) if (owned >= m) n++; return n; };
  G.nextMilestone = owned => G.MILESTONES.find(m => owned < m) || null;

  G.genUnitRate = i => G.GENS[i].rate * G.mods.gen[i] * Math.pow(2, G.milestoneLevel(G.S.owned[i])) * G.mods.global * G.mods.perm * (G.computeBonus ? G.computeBonus() * G.dataBonus() : 1);
  G.genRate = i => G.genUnitRate(i) * G.S.owned[i] * G.buffMult('prod');
  G.tps = () => { let t = 0; for (let i = 0; i < G.GENS.length; i++) t += G.genRate(i); return t; };
  G.baseTps = () => (G.totalTps ? G.totalTps() : G.tps()) / G.buffMult('prod');
  G.clickValue = () => (G.mods.click * G.mods.perm + G.tps() * G.mods.clickPct) * G.buffMult('click');

  G.earn = x => { G.S.tokens += x; G.S.runEarned += x; G.S.lifeEarned += x; };

  // ---------- kopen ----------
  G.costOf = (i, k) => {
    const b = G.GENS[i].cost * Math.pow(GROW, G.S.owned[i]);
    return b * (Math.pow(GROW, k) - 1) / (GROW - 1);
  };
  G.maxAffordable = i => {
    const b = G.GENS[i].cost * Math.pow(GROW, G.S.owned[i]);
    return Math.max(0, Math.floor(Math.log(G.S.tokens * (GROW - 1) / b + 1) / Math.log(GROW)));
  };
  G.buyQty = i => G.S.buyMode === 'max' ? Math.max(1, G.maxAffordable(i)) : G.S.buyMode;

  G.buyGen = i => {
    const k = G.buyQty(i), c = G.costOf(i, k);
    if (G.S.tokens < c) return 0;
    const before = G.milestoneLevel(G.S.owned[i]);
    G.S.tokens -= c;
    G.S.owned[i] += k;
    const after = G.milestoneLevel(G.S.owned[i]);
    if (after > before) G.emit('milestone', { i, count: after - before });
    return k;
  };

  G.isRevealed = i => i === 0 || G.S.owned[i - 1] > 0 || G.S.owned[i] > 0 || G.S.runEarned >= G.GENS[i].cost;

  G.availableUpgrades = () => G.UPGRADES.filter(u => !G.S.upgrades[u.id] && u.unlock(G.S)).sort((a, b) => a.cost - b.cost);
  G.buyUpgrade = id => {
    const u = G.UPGRADES.find(x => x.id === id);
    if (!u || G.S.upgrades[id] || G.S.tokens < u.cost) return false;
    G.S.tokens -= u.cost;
    G.S.upgrades[id] = 1;
    G.recalc();
    return true;
  };

  // ---------- AGI-project ----------
  G.agiCost = () => 1e15 * Math.pow(10, G.S.agiCount);
  G.agiProgress = () => Math.min(1, Math.log10(Math.max(1, G.S.runEarned)) / Math.log10(G.agiCost()));
  G.agiUnlocked = () => !G.S.agi && G.S.owned[G.GENS.length - 1] > 0;
  G.buyAGI = () => {
    if (!G.agiUnlocked() || G.S.tokens < G.agiCost()) return false;
    G.S.tokens -= G.agiCost();
    G.S.agi = true;
    G.S.agiCount++;
    G.recalc();
    return true;
  };

  // ---------- singulariteit (prestige) ----------
  G.insightsFor = earned => Math.floor(Math.sqrt(earned / 1e9));
  G.pendingInsights = () => Math.max(0, G.insightsFor(G.S.lifeEarned) - G.S.insights);
  G.prestige = () => {
    const p = G.pendingInsights();
    if (p < 1) return 0;
    const old = G.S, s = G.newState();
    Object.assign(s, {
      insights: old.insights + p, prestiges: old.prestiges + 1,
      lifeEarned: old.lifeEarned, clicks: old.clicks, clickEarned: old.clickEarned,
      eurekas: old.eurekas, ach: old.ach, agiCount: old.agiCount,
      started: old.started, settings: old.settings, buyMode: old.buyMode,
      quest: old.quest || 0,
      lab: old.lab || {},
    });
    G.S = s;
    G.recalc();
    return p;
  };

  // ---------- Eureka-momenten (gouden bonus) ----------
  G.nextEureka = Date.now() + 40000;
  G.scheduleEureka = () => {
    const base = (60 + Math.random() * 150) * 1000;
    G.nextEureka = Date.now() + base / G.mods.euFreq;
  };
  G.claimEureka = () => {
    const S = G.S, dur = G.mods.euDur, r = Math.random();
    S.eurekas++;
    let res;
    if (r < 0.5) {
      const amt = Math.min(S.tokens * 0.15, G.baseTps() * 900) + 13;
      G.earn(amt);
      res = { title: 'Doorbraak!', text: `+${G.fmt(amt)} tokens` };
    } else if (r < 0.85) {
      S.buffs.push({ type: 'prod', mult: 7, until: Date.now() + 77000 * dur, name: 'Datastorm' });
      res = { title: 'Datastorm!', text: `Productie ×7 voor ${Math.round(77 * dur)} s` };
    } else {
      S.buffs.push({ type: 'click', mult: 777, until: Date.now() + 13000 * dur, name: 'Klikstorm' });
      res = { title: 'Klikstorm!', text: `Tikken ×777 voor ${Math.round(13 * dur)} s` };
    }
    G.scheduleEureka();
    return res;
  };

  // ---------- prestaties ----------
  G.checkAchievements = () => {
    const tps = G.totalTps();
    let got = [];
    for (const a of G.ACHS) if (!G.S.ach[a.id] && a.check(G.S, tps)) { G.S.ach[a.id] = Date.now(); got.push(a); }
    if (got.length) G.recalc();
    return got;
  };

  // ---------- tijd ----------
  // Geeft het aantal seconden terug dat als "offline" telde (0 bij een normale tik).
  G.tick = () => {
    const now = Date.now();
    let dt = (now - G.S.lastTick) / 1000;
    G.S.lastTick = now;
    if (dt <= 0) return 0;
    if (dt > 5) {
      const secs = Math.min(dt, OFFLINE_CAP);
      const amt = G.tps() / G.buffMult('prod') * secs * G.mods.offline;
      G.earn(amt);
      G.industryTick(secs);
      G.S.buffs = G.S.buffs.filter(b => b.until > now);
      return { secs, amt };
    }
    G.earn(G.tps() * dt);
    G.industryTick(dt);
    if (G.S.buffs.length && G.S.buffs.some(b => b.until <= now)) G.S.buffs = G.S.buffs.filter(b => b.until > now);
    return 0;
  };

  // ---------- opslag (Capacitor Preferences op iOS, anders localStorage) ----------
  const prefs = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences;
  G.save = async () => {
    const data = JSON.stringify(G.S);
    try { localStorage.setItem(SAVE_KEY, data); } catch (e) {}
    try { const P = prefs(); if (P) await P.set({ key: SAVE_KEY, value: data }); } catch (e) {}
  };
  G.load = async () => {
    let raw = null;
    try { const P = prefs(); if (P) raw = (await P.get({ key: SAVE_KEY })).value; } catch (e) {}
    if (!raw) { try { raw = localStorage.getItem(SAVE_KEY); } catch (e) {} }
    if (raw) {
      try {
        const d = JSON.parse(raw), s = G.newState();
        Object.assign(s, d);
        s.settings = Object.assign(G.newState().settings, d.settings || {});
        s.owned = G.GENS.map((_, i) => (d.owned && d.owned[i]) || 0);
        s.chain = G.CHAIN.map((_, i) => (d.chain && d.chain[i]) || 0);
        G.S = s;
      } catch (e) { G.S = G.newState(); }
    }
    G.recalc();
  };
  G.wipe = async () => {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    try { const P = prefs(); if (P) await P.remove({ key: SAVE_KEY }); } catch (e) {}
    G.S = G.newState();
    G.recalc();
  };

  // ---------- kleine event-bus ----------
  const handlers = {};
  G.on = (ev, fn) => (handlers[ev] = handlers[ev] || []).push(fn);
  G.emit = (ev, data) => (handlers[ev] || []).forEach(fn => fn(data));

  // ---------- getallen ----------
  const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];
  G.fmt = n => {
    if (!isFinite(n)) return '∞';
    if (n < 1000) return (n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n).toString()).replace('.', ',');
    const e = Math.floor(Math.log10(n) / 3);
    if (e >= SUF.length) return n.toExponential(2).replace('.', ',');
    const v = n / Math.pow(10, e * 3);
    return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)).replace('.', ',') + ' ' + SUF[e];
  };
  G.fmtTime = secs => {
    secs = Math.floor(secs);
    const h = Math.floor(secs / 3600), m = Math.floor(secs % 3600 / 60), s = secs % 60;
    if (h) return `${h} u ${m} min`;
    if (m) return `${m} min ${s} s`;
    return `${s} s`;
  };

  G.recalc();
})();

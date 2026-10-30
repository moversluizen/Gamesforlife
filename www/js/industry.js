// Supply chain, chipontwikkeling, apps, helpers en opdrachten.
(function () {
  const G = window.G;

  // ---------- data ----------
  // Schakels 0-3 bepalen samen de chipproductie (de traagste wint); 4 is opslag.
  G.CHAIN = [
    { id: 'mine',  name: 'Zandgroeve',       icon: '⛏️', cost: 300,  grow: 1.18, cap: 0.5,  desc: 'Haalt zuiver silicium uit zand.' },
    { id: 'wafer', name: 'Waferfabriek',     icon: '💿', cost: 1000, grow: 1.18, cap: 0.4,  desc: 'Zaagt siliciumstaven tot spiegelgladde wafers.' },
    { id: 'litho', name: 'EUV-lithografie',  icon: '🔦', cost: 5000, grow: 1.18, cap: 0.25, desc: 'Belicht chippatronen met extreem UV-licht. De moeilijkste machine ter wereld.' },
    { id: 'fab',   name: 'Chipfabriek',      icon: '🏭', cost: 2500, grow: 1.18, cap: 0.35, desc: 'Etst, test en verpakt de chips.' },
    { id: 'dc',    name: 'Datacenter',       icon: '🗄️', cost: 1500, grow: 1.22, slots: 25, desc: 'Ruimte voor 25 extra chips per uitbreiding.' },
  ];

  G.CHIPS = [
    { name: 'CPU',              node: '90 nm',   icon: '🔲', power: 1,     cost: 0,    time: 0,     litho: 0 },
    { name: 'GPU',              node: '28 nm',   icon: '🎮', power: 8,     cost: 2e4,  time: 60,    litho: 5 },
    { name: 'AI-versneller',    node: '7 nm',    icon: '⚡', power: 60,    cost: 1e6,  time: 180,   litho: 15 },
    { name: 'Tensor-chip',      node: '3 nm',    icon: '🧮', power: 500,   cost: 5e7,  time: 480,   litho: 30 },
    { name: 'Wafer-scale chip', node: '2 nm',    icon: '🟪', power: 4000,  cost: 2e9,  time: 1200,  litho: 50 },
    { name: 'Fotonische chip',  node: 'licht',   icon: '🌈', power: 3.5e4, cost: 1e11, time: 2700,  litho: 75 },
    { name: 'Neuromorfe chip',  node: 'synaps',  icon: '🧬', power: 3e5,   cost: 5e12, time: 5400,  litho: 100 },
    { name: 'Quantumchip',      node: 'qubit',   icon: '⚛️', power: 3e6,   cost: 2e14, time: 10800, litho: 130 },
  ];

  // model = index in G.GENS, n = benodigd aantal
  G.APPS = [
    { id: 'chat',    name: 'Praatbot',           icon: '💬', model: 1,  n: 1,  cost: 2000,   time: 20,   cap: 1000,  rev: 0.03, desc: 'Een chatbot die vooral "interessant!" zegt.' },
    { id: 'trans',   name: 'Vertaal-app',        icon: '🌍', model: 2,  n: 5,  cost: 3e4,    time: 45,   cap: 1e4,   rev: 0.06, desc: 'Vertaalt menu\'s, soms correct.' },
    { id: 'voice',   name: 'Spraakassistent',    icon: '🎙️', model: 3,  n: 10, cost: 4e5,    time: 90,   cap: 5e4,   rev: 0.15, desc: '"Ik heb drie timers voor je gezet."' },
    { id: 'vision',  name: 'Fotoherkenning',     icon: '📷', model: 4,  n: 10, cost: 5e6,    time: 120,  cap: 2e5,   rev: 0.3,  desc: 'Weet precies welke plant er in je tuin staat.' },
    { id: 'code',    name: 'Code-copiloot',      icon: '👨‍💻', model: 5,  n: 10, cost: 6e7,    time: 180,  cap: 1e6,   rev: 0.6,  desc: 'Schrijft code mee terwijl jij koffie haalt.' },
    { id: 'image',   name: 'Beeldgenerator',     icon: '🎨', model: 6,  n: 10, cost: 8e8,    time: 240,  cap: 5e6,   rev: 0.9,  desc: 'Tekent alles, behalve handen.' },
    { id: 'video',   name: 'Videostudio',        icon: '🎬', model: 7,  n: 10, cost: 1e10,   time: 360,  cap: 2e7,   rev: 1.5,  desc: 'Maakt films op basis van één zin.' },
    { id: 'agent',   name: 'Persoonlijke agent', icon: '🤖', model: 8,  n: 10, cost: 1.5e11, time: 480,  cap: 1e8,   rev: 2.4,  desc: 'Regelt je agenda, belastingaangifte en verjaardagscadeaus.' },
    { id: 'science', name: 'Wetenschapper-AI',   icon: '🔬', model: 9,  n: 10, cost: 2e12,   time: 720,  cap: 3e8,   rev: 6,    desc: 'Publiceert elke dag tien papers.' },
    { id: 'robot',   name: 'Robot-butler',       icon: '🦾', model: 10, n: 10, cost: 3e13,   time: 1200, cap: 1e9,   rev: 12,    desc: 'Vouwt eindelijk de was op.' },
  ];

  G.HELPERS = [
    { id: 'intern', name: 'Stagiair',            icon: '🧑‍🎓', cost: 800,   grow: 1.6, max: 20, desc: 'Tikt elke seconde op de kern.',                 eff: l => `${l} tik${l === 1 ? '' : 'ken'} per seconde` },
    { id: 'eng',    name: 'Fab-ingenieur',       icon: '🧑‍🔧', cost: 5000,  grow: 1.7, max: 40, desc: 'Verhoogt de capaciteit van de hele keten.',      eff: l => `keten +${l * 25}%` },
    { id: 'design', name: 'Chipontwerper',       icon: '👩‍🔬', cost: 3e4,   grow: 2,   max: 15, desc: 'Ontwikkelt nieuwe chips sneller.',               eff: l => `ontwikkeling ${Math.round((1 - Math.pow(0.85, l)) * 100)}% sneller` },
    { id: 'mkt',    name: 'Marketeer',           icon: '📣', cost: 5e4,   grow: 1.9, max: 20, desc: 'Start vanzelf campagnes en verhoogt app-omzet.', eff: l => l ? `campagne elke ${G.mktInterval(l)} s, omzet +${l * 10}%` : 'geen campagnes' },
    { id: 'scout',  name: 'Talentscout',         icon: '🕵️', cost: 1e5,   grow: 2.2, max: 10, desc: 'Meer Eureka-momenten. Vanaf niveau 5 vangt de scout ze voor je.', eff: l => `Eureka +${l * 15}%${l >= 5 ? ', vangt automatisch' : ''}` },
    { id: 'cfo',    name: 'Financieel directeur', icon: '💼', cost: 2e5,  grow: 2.5, max: 10, desc: 'Meer opbrengst terwijl je weg bent.',            eff: l => `offline +${l * 10}%` },
  ];

  G.UPGRADES.push(
    { id: 'ch0', icon: '🏭', name: 'Hogere yield',         sub: 'Keten',      desc: 'Hele keten 2× capaciteit.', cost: 5e4,  kind: 'chain', mult: 2, unlock: s => s.chain[3] >= 10 },
    { id: 'ch1', icon: '🔦', name: 'High-NA EUV',          sub: 'Keten',      desc: 'Hele keten 2× capaciteit.', cost: 5e7,  kind: 'chain', mult: 2, unlock: s => s.chain[2] >= 30 },
    { id: 'ch2', icon: '🧩', name: 'Chiplets',             sub: 'Keten',      desc: 'Hele keten 2× capaciteit.', cost: 5e9,  kind: 'chain', mult: 2, unlock: s => s.chain[3] >= 50 },
    { id: 'ch3', icon: '🔬', name: 'Gate-all-around',      sub: 'Keten',      desc: 'Hele keten 3× capaciteit.', cost: 5e11, kind: 'chain', mult: 3, unlock: s => s.chain[2] >= 80 },
    { id: 'sl0', icon: '❄️', name: 'Vloeistofkoeling',     sub: 'Datacenter', desc: 'Datacenters 2× zoveel ruimte.', cost: 1e5,  kind: 'slots', mult: 2, unlock: s => s.chain[4] >= 10 },
    { id: 'sl1', icon: '🌊', name: 'Onderzeese datacenters', sub: 'Datacenter', desc: 'Datacenters 2× zoveel ruimte.', cost: 1e9, kind: 'slots', mult: 2, unlock: s => s.chain[4] >= 40 },
    { id: 'sl2', icon: '🛰️', name: 'Orbitale racks',       sub: 'Datacenter', desc: 'Datacenters 3× zoveel ruimte.', cost: 1e13, kind: 'slots', mult: 3, unlock: s => s.chain[4] >= 80 },
    { id: 'ap0', icon: '📱', name: 'App-store-optimalisatie', sub: 'Apps',    desc: 'Alle apps 2× omzet.', cost: 1e5,  kind: 'app', mult: 2, unlock: s => G.appsLive() >= 1 },
    { id: 'ap1', icon: '🚀', name: 'Virale groei',         sub: 'Apps',       desc: 'Alle apps 2× omzet.', cost: 1e8,  kind: 'app', mult: 2, unlock: s => G.appsLive() >= 3 },
    { id: 'ap2', icon: '🌐', name: 'Wereldwijde lancering', sub: 'Apps',      desc: 'Alle apps 2× omzet.', cost: 1e11, kind: 'app', mult: 2, unlock: s => G.appsLive() >= 5 },
    { id: 'ap3', icon: '💳', name: 'Abonnementsmodel',     sub: 'Apps',       desc: 'Alle apps 3× omzet.', cost: 1e14, kind: 'app', mult: 3, unlock: s => G.appsLive() >= 7 },
  );

  // ---------- staat ----------
  G.industryDefaults = () => ({
    chain: G.CHAIN.map(() => 0), chips: 0, chipGen: 0, rnd: null,
    apps: {}, helpers: {}, quest: 0, mktAuto: 0,
  });

  G.hl = id => G.S.helpers[id] || 0;
  G.mktInterval = l => Math.max(8, 60 - 4 * l);

  G.industryMods = m => {
    m.chain *= 1 + 0.25 * G.hl('eng');
    m.app *= 1 + 0.1 * G.hl('mkt');
    m.euFreq *= 1 + 0.15 * G.hl('scout');
    m.offline = Math.min(1.5, m.offline + 0.1 * G.hl('cfo'));
    m.rndTime = Math.pow(0.85, G.hl('design'));
  };

  // ---------- keten ----------
  G.chainCost = i => G.CHAIN[i].cost * Math.pow(G.CHAIN[i].grow, G.S.chain[i]);
  G.buyChain = i => {
    const c = G.chainCost(i);
    if (G.S.tokens < c) return false;
    G.S.tokens -= c;
    G.S.chain[i]++;
    return true;
  };
  G.stageCap = i => G.S.chain[i] * G.CHAIN[i].cap * G.mods.chain;
  G.chipRate = () => Math.min(G.stageCap(0), G.stageCap(1), G.stageCap(2), G.stageCap(3));
  G.bottleneck = () => {
    let b = 0;
    for (let i = 1; i < 4; i++) if (G.stageCap(i) < G.stageCap(b)) b = i;
    return b;
  };
  G.slots = () => G.S.chain[4] * G.CHAIN[4].slots * G.mods.slots;
  G.chip = () => G.CHIPS[G.S.chipGen];
  G.compute = () => G.S.chips * G.chip().power;
  G.computeBonus = () => 1 + Math.pow(G.compute(), 0.4) / 10;
  G.chipPrice = () => G.chip().power * 4 * G.mods.perm;
  G.chipsFull = () => G.S.chain[4] > 0 && G.S.chips >= G.slots() - 1e-9;
  G.chipSales = () => (G.chipsFull() || G.S.chain[4] === 0 ? G.chipRate() : 0) * G.chipPrice() * G.buffMult('prod');

  // ---------- chipontwikkeling ----------
  G.nextChip = () => G.CHIPS[G.S.chipGen + 1] || null;
  G.canStartRnd = () => {
    const n = G.nextChip();
    return n && !G.S.rnd && G.S.tokens >= n.cost && G.S.chain[2] >= n.litho;
  };
  G.startRnd = () => {
    if (!G.canStartRnd()) return false;
    const n = G.nextChip(), total = n.time * G.mods.rndTime * 1000;
    G.S.tokens -= n.cost;
    G.S.rnd = { gen: G.S.chipGen + 1, end: Date.now() + total, total };
    return true;
  };
  // Eén tik op het ontwikkelproject haalt er een stukje tijd af.
  G.boostRnd = () => {
    const r = G.S.rnd;
    if (!r) return 0;
    const cut = 500 + r.total * 0.001;
    r.end -= cut;
    return cut;
  };

  // ---------- apps ----------
  G.app = id => G.S.apps[id] || (G.S.apps[id] = { v: 0, u: 0, b: 0, cd: 0 });
  G.appsLive = () => G.APPS.filter(a => (G.S.apps[a.id] || {}).v > 0).length;
  G.appUnlocked = a => G.S.owned[a.model] >= a.n;
  G.appCost = a => a.cost * Math.pow(6, G.app(a.id).v);
  G.appCap = a => { const s = G.app(a.id); return a.cap * Math.pow(2, Math.max(0, s.v - 1)); };
  G.appRate = a => { const s = G.app(a.id); return s.v ? s.u * a.rev * Math.pow(2, s.v - 1) * G.mods.app * G.mods.perm * G.buffMult('prod') : 0; };
  G.appRevenue = () => G.APPS.reduce((t, a) => t + G.appRate(a), 0);
  G.buildApp = a => {
    const s = G.app(a.id), c = G.appCost(a);
    if (!G.appUnlocked(a) || s.b || G.S.tokens < c) return false;
    G.S.tokens -= c;
    if (s.v === 0) s.b = Date.now() + a.time * 1000;
    else s.v++;
    return true;
  };
  G.campaign = (a, auto) => {
    const s = G.app(a.id), now = Date.now();
    if (!s.v || (!auto && s.cd > now)) return false;
    s.u = Math.min(G.appCap(a), s.u + G.appCap(a) * 0.15 + 10);
    if (!auto) s.cd = now + 30000;
    return true;
  };

  // ---------- helpers ----------
  G.helperCost = h => h.cost * Math.pow(h.grow, G.hl(h.id));
  G.hire = h => {
    const c = G.helperCost(h);
    if (G.hl(h.id) >= h.max || G.S.tokens < c) return false;
    G.S.tokens -= c;
    G.S.helpers[h.id] = G.hl(h.id) + 1;
    G.recalc();
    return true;
  };

  // ---------- tijd ----------
  // Geeft de verdiende tokens terug (apps + verkochte chips) over dt seconden.
  G.industryTick = dt => {
    const S = G.S, now = Date.now();
    let earned = 0;

    if (S.rnd && now >= S.rnd.end) {
      S.chipGen = S.rnd.gen;
      S.rnd = null;
      G.emit('chipDone', G.chip());
    }
    for (const a of G.APPS) {
      const s = S.apps[a.id];
      if (s && s.b && now >= s.b) { s.b = 0; s.v = 1; s.u = 10; G.emit('appLive', a); }
    }

    // In stappen rekenen, zodat lange offline-periodes kloppen.
    const steps = Math.min(200, Math.max(1, Math.ceil(dt)));
    const h = dt / steps;
    for (let k = 0; k < steps; k++) {
      const rate = G.chipRate();
      if (S.chain[4] > 0) {
        const room = G.slots() - S.chips;
        const add = Math.min(room, rate * h);
        S.chips += Math.max(0, add);
        if (rate * h > add) earned += (rate * h - Math.max(0, add)) * G.chipPrice() * G.buffMult('prod');
      } else earned += rate * h * G.chipPrice() * G.buffMult('prod');

      for (const a of G.APPS) {
        const s = S.apps[a.id];
        if (!s || !s.v) continue;
        const cap = G.appCap(a);
        s.u = Math.min(cap, s.u + Math.min(cap - s.u, 0.06 * s.u * (1 - s.u / cap) * h + 0.5 * h));
        earned += G.appRate(a) * h;
      }
    }

    const ml = G.hl('mkt');
    if (ml && dt < 5 && now >= S.mktAuto) {
      S.mktAuto = now + G.mktInterval(ml) * 1000;
      let any = false;
      for (const a of G.APPS) if (G.campaign(a, true)) any = true;
      if (any) G.emit('autoCampaign');
    }
    return earned;
  };

  G.totalTps = () => G.tps() + G.appRevenue() + G.chipSales();

  // ---------- tabbladen ontgrendelen ----------
  G.TAB_UNLOCK = { chips: 250, apps: 150, team: 800 };
  G.tabUnlocked = t => !(t in G.TAB_UNLOCK) || G.S.lifeEarned >= G.TAB_UNLOCK[t];

  // ---------- opdrachten van Ada ----------
  const own = (i, n) => s => [Math.min(s.owned[i], n), n];
  G.QUESTS = [
    { text: 'Tik 10 keer op de kern',                     goal: s => [Math.min(s.clicks, 10), 10], reward: 15 },
    { text: 'Koop je eerste Perceptron',                   goal: own(0, 1), reward: 20 },
    { text: 'Bezit 10 Perceptrons',                        goal: own(0, 10), reward: 100 },
    { text: 'Koop een Markov-keten',                       goal: own(1, 1), reward: 150 },
    { text: 'Bouw je eerste app: de Praatbot',             goal: s => [G.appsLive() >= 1 ? 1 : 0, 1], reward: 600, tab: 'apps' },
    { text: 'Bouw een Zandgroeve',                         goal: s => [Math.min(s.chain[0], 1), 1], reward: 400, tab: 'chips' },
    { text: 'Bouw alle vijf schakels van de keten',        goal: s => [s.chain.filter(x => x > 0).length, 5], reward: 3000, tab: 'chips' },
    { text: 'Neem een Stagiair aan',                       goal: s => [Math.min(G.hl('intern'), 1), 1], reward: 2000, tab: 'team' },
    { text: 'Vul je datacenter helemaal met chips',        goal: s => [G.chipsFull() ? 1 : 0, 1], reward: 5000, tab: 'chips' },
    { text: 'Ontwikkel de GPU',                            goal: s => [Math.min(s.chipGen, 1), 1], reward: 3e4, tab: 'chips' },
    { text: 'Bezit 25 N-gram modellen',                    goal: own(2, 25), reward: 5e4 },
    { text: 'Laat de Praatbot groeien tot 1.000 gebruikers', goal: s => [Math.min(Math.floor((s.apps.chat || {}).u || 0), 1000), 1000], reward: 8e4, tab: 'apps' },
    { text: 'Koop 15 onderzoeken',                         goal: s => [Math.min(Object.keys(s.upgrades).length, 15), 15], reward: 2e5, tab: 'research' },
    { text: 'Ontwikkel de AI-versneller',                  goal: s => [Math.min(s.chipGen, 2), 2], reward: 2e6, tab: 'chips' },
    { text: 'Bouw de Code-copiloot',                       goal: s => [(s.apps.code || {}).v > 0 ? 1 : 0, 1], reward: 1e8, tab: 'apps' },
    { text: 'Neem 5 verschillende helpers aan',            goal: s => [Math.min(Object.keys(s.helpers).length, 5), 5], reward: 3e8, tab: 'team' },
    { text: 'Ontwikkel de Wafer-scale chip',               goal: s => [Math.min(s.chipGen, 4), 4], reward: 4e9, tab: 'chips' },
    { text: 'Bouw een Persoonlijke agent',                 goal: s => [(s.apps.agent || {}).v > 0 ? 1 : 0, 1], reward: 3e11, tab: 'apps' },
    { text: 'Ontwikkel de Quantumchip',                    goal: s => [Math.min(s.chipGen, 7), 7], reward: 4e14, tab: 'chips' },
    { text: 'Bouw AGI',                                    goal: s => [Math.min(s.agiCount, 1), 1], reward: 1e16, tab: 'more' },
  ];
  G.questNow = () => G.QUESTS[G.S.quest] || null;
  G.questReward = q => Math.max(q.reward, G.totalTps() * 60);
  G.claimQuest = () => {
    const q = G.questNow();
    if (!q) return 0;
    const [have, need] = q.goal(G.S);
    if (have < need) return 0;
    const r = G.questReward(q);
    G.earn(r);
    G.S.quest++;
    return r;
  };

  // ---------- extra prestaties en nieuws ----------
  const ach = (id, icon, name, desc, check) => G.ACHS.push({ id, icon, name, desc, check });
  ach('chip1', '🎮', 'Gamer-hardware', 'Ontwikkel de GPU.', s => s.chipGen >= 1);
  ach('chip4', '🟪', 'Bord-groot', 'Ontwikkel de Wafer-scale chip.', s => s.chipGen >= 4);
  ach('chip7', '⚛️', 'Qubits', 'Ontwikkel de Quantumchip.', s => s.chipGen >= 7);
  ach('lit50', '🔦', 'Monopolie op licht', 'Bouw 50 EUV-machines.', s => s.chain[2] >= 50);
  ach('cmp6', '⚡', 'Exaschaal', 'Haal een miljoen rekenkracht.', s => G.compute() >= 1e6);
  ach('app1', '📱', 'Live!', 'Lanceer je eerste app.', s => G.appsLive() >= 1);
  ach('app5', '🏪', 'App-imperium', 'Heb 5 apps live.', s => G.appsLive() >= 5);
  ach('appv5', '🔢', 'Versie 5.0', 'Breng een app naar versie 5.', s => Object.values(s.apps).some(a => a.v >= 5));
  ach('usr', '👥', 'Miljard gebruikers', 'Heb in totaal een miljard gebruikers.', s => Object.values(s.apps).reduce((t, a) => t + (a.u || 0), 0) >= 1e9);
  ach('team', '👥', 'Voltallig team', 'Neem alle soorten helpers aan.', s => G.HELPERS.every(h => (s.helpers[h.id] || 0) > 0));
  ach('quests', '🤖', 'Ada is trots', 'Voltooi 10 opdrachten van Ada.', s => s.quest >= 10);

  G.NEWS.push(
    [2, 'Wachtlijst voor EUV-machines loopt op tot 2031.'],
    [2, 'Zandprijzen stijgen. Strandgangers bezorgd.'],
    [3, 'Chipfabriek gebruikt evenveel water als een kleine stad. Eenden boos.'],
    [4, 'Nieuwe GPU uitverkocht binnen 4 seconden.'],
    [5, 'Code-copiloot schrijft 40% van alle code. De andere 60% is commentaar.'],
    [6, 'Praatbot verliest debat van zijn eigen opvolger.'],
    [8, 'Persoonlijke agent zegt namens eigenaar alle vergaderingen af. Productiviteit stijgt.'],
  );

  // engine.js maakte de beginstand al voordat dit bestand laadde
  Object.keys(G.industryDefaults()).forEach(k => { if (!(k in G.S)) G.S[k] = G.industryDefaults()[k]; });
  G.recalc();
})();

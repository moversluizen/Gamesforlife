// Supply chain, chipontwikkeling, apps, helpers en opdrachten.
(function () {
  const G = window.G;

  // ---------- data ----------
  // Alleen eigen chips: schakels 0-3 vormen je keten van zand tot chip (de traagste schakel bepaalt de output),
  // 4 is het datacenter waar de chips draaien. Alles gaat tegelijk open met de afdeling Chipfabriek.
  G.CHAIN = [
    { id: 'mine',  name: T('Zandgroeve'),      icon: '⛏️', cost: 500,  grow: 1.2,  cap: 0.6, desc: T('Haalt zuiver silicium uit zand.') },
    { id: 'wafer', name: T('Waferfabriek'),    icon: '💿', cost: 1000, grow: 1.2,  cap: 0.5, desc: T('Zaagt siliciumstaven tot spiegelgladde wafers.') },
    { id: 'litho', name: T('EUV-lithografie'), icon: '🔦', cost: 3000, grow: 1.25, cap: 0.3, desc: T('Belicht chippatronen met extreem UV-licht. De moeilijkste machine ter wereld.') },
    { id: 'fab',   name: T('Chipfabriek'),     icon: '🏭', cost: 2000, grow: 1.2,  cap: 0.4, desc: T('Etst, test en verpakt de chips.') },
    { id: 'dc',    name: T('Datacenter'),      icon: '🗄️', cost: 1500, grow: 1.22, slots: 25, desc: T('Ruimte voor 25 extra chips per uitbreiding.') },
  ];
  G.OWN_CHAIN = [0, 1, 2, 3];

  // litho = benodigde EUV-machines in je keten.
  G.CHIPS = [
    { name: 'CPU',              node: T('90 nm'),  icon: '🔲', power: 1,     cost: 0,    time: 0,     litho: 0,   desc: T('Een gewone processor. Traag voor neurale netwerken.') },
    { name: 'GPU',              node: T('28 nm'),  icon: '🎮', power: 8,     cost: 2e4,  time: 60,    litho: 0,   desc: T('Gemaakt voor games. In 2012 bleek hij perfect voor deep learning.') },
    { name: T('AI-versneller'),    node: T('7 nm'),   icon: '⚡', power: 60,    cost: 1e6,  time: 180,   litho: 3,   desc: T('Datacenterkaarten speciaal voor het trainen van AI.') },
    { name: T('Tensor-chip'),      node: T('3 nm'),   icon: '🧮', power: 500,   cost: 5e7,  time: 480,   litho: 8,   desc: T('2016: je eigen chip, gebouwd voor matrixberekeningen.') },
    { name: T('Wafer-scale chip'), node: T('2 nm'),   icon: '🟪', power: 4000,  cost: 2e9,  time: 1200,  litho: 20,  desc: T('Eén chip zo groot als een hele wafer.') },
    { name: T('Fotonische chip'),  node: T('licht'),  icon: '🌈', power: 3.5e4, cost: 1e11, time: 2700,  litho: 45,  desc: T('Toekomst: rekent met licht in plaats van elektronen.') },
    { name: T('Neuromorfe chip'),  node: T('synaps'), icon: '🧬', power: 3e5,   cost: 5e12, time: 5400,  litho: 75,  desc: T('Toekomst: werkt als echte neuronen.') },
    { name: T('Quantumchip'),      node: 'qubit',  icon: '⚛️', power: 3e6,   cost: 2e14, time: 10800, litho: 110, desc: T('Toekomst: duizenden stabiele qubits.') },
  ];

  // model = index in G.GENS, n = benodigd aantal
  G.APPS = [
    { id: 'chat',    name: T('Praatbot'),           icon: '💬', model: 1,  n: 1,  cost: 2000,   time: 20,   cap: 1000,  rev: 0.03, desc: T('Zoals ELIZA in 1966: doet alsof ze luistert.') },
    { id: 'trans',   name: T('Vertaal-app'),        icon: '🌍', model: 2,  n: 5,  cost: 3e4,    time: 45,   cap: 1e4,   rev: 0.06, desc: T('Jaren 2000: statistische vertaling, soms verrassend goed.') },
    { id: 'voice',   name: T('Spraakassistent'),    icon: '🎙️', model: 3,  n: 10, cost: 4e5,    time: 90,   cap: 5e4,   rev: 0.15, desc: T('2011: een assistent in je telefoon die je stem verstaat.') },
    { id: 'vision',  name: T('Fotoherkenning'),     icon: '📷', model: 4,  n: 10, cost: 5e6,    time: 120,  cap: 2e5,   rev: 0.3,  desc: T('2012+: herkent wat er op je foto\'s staat.') },
    { id: 'code',    name: T('Code-copiloot'),      icon: '👨‍💻', model: 5,  n: 10, cost: 6e7,    time: 180,  cap: 1e6,   rev: 0.6,  desc: T('2021: schrijft code mee terwijl jij koffie haalt.') },
    { id: 'image',   name: T('Beeldgenerator'),     icon: '🎨', model: 6,  n: 10, cost: 8e8,    time: 240,  cap: 5e6,   rev: 0.9,  desc: T('2022: tekent alles uit één zin, behalve handen.') },
    { id: 'video',   name: T('Videostudio'),        icon: '🎬', model: 7,  n: 10, cost: 1e10,   time: 360,  cap: 2e7,   rev: 1.5,  desc: T('2024: video\'s uit een paar woorden.') },
    { id: 'agent',   name: T('Persoonlijke agent'), icon: '🤖', model: 8,  n: 10, cost: 1.5e11, time: 480,  cap: 1e8,   rev: 2.4,  desc: T('2025: regelt je agenda, mail en boodschappen.') },
    { id: 'science', name: T('Wetenschapper-AI'),   icon: '🔬', model: 9,  n: 10, cost: 2e12,   time: 720,  cap: 3e8,   rev: 6,    desc: T('Toekomst: bedenkt en test zelf hypotheses.') },
    { id: 'robot',   name: T('Robot-butler'),       icon: '🦾', model: 10, n: 10, cost: 3e13,   time: 1200, cap: 1e9,   rev: 12,    desc: T('Toekomst: een lichaam voor je AI. Vouwt eindelijk de was op.') },
  ];

  // eff krijgt het effectieve niveau (niveau × rangbonus), l het echte niveau.
  G.HELPERS = [
    { id: 'intern', name: T('Stagiair'),             icon: '🧑‍🎓', cost: 800,  grow: 1.6,  max: 40, desc: T('Tikt elke seconde op de kern en wordt per rang 2× zo slim.'),
      eff: (e, l) => (l === 1 ? T('1 tik/s, {0}× zo sterk', G.fmt(Math.pow(2, G.rankAt(G.HELPERS[0], l)))) : T('{0} tikken/s, elk {1}× zo sterk', l, G.fmt(Math.pow(2, G.rankAt(G.HELPERS[0], l))))),
      ranks: [[T('Stagiair'), '🧑‍🎓'], [T('Junior-onderzoeker'), '👩‍💻'], [T('Onderzoeker'), '🧑‍💻'], [T('Senior onderzoeker'), '🧑‍🔬'], [T('Hoofdonderzoeker'), '🧙'], [T('AI-collega'), '🤖']] },
    { id: 'safety', name: T('Safety-engineer'),      icon: '🦺', cost: 2500, grow: 1.45, max: 40, desc: T('Houdt je modellen veilig en voorkomt schandalen.'),
      eff: e => T('+{0} veiligheid', G.fmt(e)) },
    { id: 'eng',    name: T('Fab-ingenieur'),        icon: '🧑‍🔧', cost: 5000, grow: 1.7,  max: 40, desc: T('Verhoogt de capaciteit van de hele keten.'),
      eff: e => T('keten +{0}%', G.fmt(e * 25)) },
    { id: 'design', name: T('Chipontwerper'),        icon: '👩‍🔬', cost: 3e4,  grow: 2,    max: 15, desc: T('Ontwikkelt nieuwe chips sneller.'),
      eff: e => T('ontwikkeling {0}% sneller', Math.round((1 - Math.pow(0.85, e)) * 100)) },
    { id: 'mkt',    name: T('Marketeer'),            icon: '📣', cost: 5e4,  grow: 1.9,  max: 20, desc: T('Start vanzelf campagnes en haalt meer data uit je apps.'),
      eff: (e, l) => l ? T('campagne elke {0} s, data +{1}%', G.mktInterval(l), G.fmt(e * 10)) : T('geen campagnes') },
    { id: 'scout',  name: T('Talentscout'),          icon: '🕵️', cost: 1e5,  grow: 2.2,  max: 10, desc: T('Meer Eureka-momenten. Vanaf niveau 5 vangt de scout ze voor je.'),
      eff: (e, l) => T('Eureka +{0}%{1}', G.fmt(e * 15), l >= 5 ? T(', vangt automatisch') : '') },
    { id: 'cfo',    name: T('Financieel directeur'), icon: '💼', cost: 2e5,  grow: 2.5,  max: 10, desc: T('Meer opbrengst terwijl je weg bent.'),
      eff: e => T('offline +{0}%', G.fmt(e * 10)) },
  ];
  G.RANK_TITLES = [T('Junior'), T('Medior'), T('Senior'), T('Lead'), T('Principal'), T('Legende')];

  [
    [2e4,  'RLHF',                     3, 4],
    [5e5,  T('Red teaming'),              3, 4],
    [1e7,  T('Interpreteerbaarheid'),     4, 5],
    [2e8,  T('Evals-team'),               4, 6],
    [5e9,  T('Constitutionele training'), 5, 7],
    [1e11, T('Schaalbaar toezicht'),      5, 8],
    [3e12, T('Formele verificatie'),      6, 9],
    [1e14, T('Alignment-doorbraak'),      8, 10],
  ].forEach(([cost, name, pts, model], n) => G.UPGRADES.push({
    id: `sf${n}`, icon: ['👍', '🎭', '🔎', '📋', '📜', '🪜', '✅', '🧭'][n], name, sub: T('Veiligheid'), desc: T('+{0} veiligheid voor je modellen.', pts), cost, kind: 'safety', mult: pts,
    lockText: T('Komt vrij bij 10× {0}', G.GENS[model - 1].name),
    unlock: s => s.owned[model] > 0 || s.owned[model - 1] >= 10,
  }));

  G.UPGRADES.push(
    { id: 'ch0', icon: '🏭', name: T('Hogere yield'),         sub: T('Keten'),      desc: T('Hele keten 2× capaciteit.'), cost: 5e4,  kind: 'chain', mult: 2, unlock: s => s.chain[3] >= 10 },
    { id: 'ch1', icon: '🔦', name: T('High-NA EUV'),          sub: T('Keten'),      desc: T('Hele keten 2× capaciteit.'), cost: 5e7,  kind: 'chain', mult: 2, unlock: s => s.chain[2] >= 30 },
    { id: 'ch2', icon: '🧩', name: T('Chiplets'),             sub: T('Keten'),      desc: T('Hele keten 2× capaciteit.'), cost: 5e9,  kind: 'chain', mult: 2, unlock: s => s.chain[3] >= 50 },
    { id: 'ch3', icon: '🔍', name: T('Gate-all-around'),      sub: T('Keten'),      desc: T('Hele keten 3× capaciteit.'), cost: 5e11, kind: 'chain', mult: 3, unlock: s => s.chain[2] >= 80 },
    { id: 'sl0', icon: '🧊', name: T('Vloeistofkoeling'),     sub: T('Datacenter'), desc: T('Datacenters 2× zoveel ruimte.'), cost: 1e5,  kind: 'slots', mult: 2, unlock: s => s.chain[4] >= 10 },
    { id: 'sl1', icon: '🌊', name: T('Onderzeese datacenters'), sub: T('Datacenter'), desc: T('Datacenters 2× zoveel ruimte.'), cost: 1e9, kind: 'slots', mult: 2, unlock: s => s.chain[4] >= 40 },
    { id: 'sl2', icon: '🛰️', name: T('Orbitale racks'),       sub: T('Datacenter'), desc: T('Datacenters 3× zoveel ruimte.'), cost: 1e13, kind: 'slots', mult: 3, unlock: s => s.chain[4] >= 80 },
    { id: 'ap0', icon: '📱', name: T('App-store-optimalisatie'), sub: T('Apps'),    desc: T('Alle apps leveren 2× zoveel data.'), cost: 1e5,  kind: 'app', mult: 2, unlock: s => G.appsLive() >= 1 },
    { id: 'ap1', icon: '🚀', name: T('Virale groei'),         sub: T('Apps'),       desc: T('Alle apps leveren 2× zoveel data.'), cost: 1e8,  kind: 'app', mult: 2, unlock: s => G.appsLive() >= 3 },
    { id: 'ap2', icon: '🌐', name: T('Wereldwijde lancering'), sub: T('Apps'),      desc: T('Alle apps leveren 2× zoveel data.'), cost: 1e11, kind: 'app', mult: 2, unlock: s => G.appsLive() >= 5 },
    { id: 'ap3', icon: '💳', name: T('Abonnementsmodel'),     sub: T('Apps'),       desc: T('Alle apps leveren 3× zoveel data.'), cost: 1e14, kind: 'app', mult: 3, unlock: s => G.appsLive() >= 7 },
  );

  // ---------- staat ----------
  G.industryDefaults = () => ({
    chain: G.CHAIN.map(() => 0), chips: 0, chipsCur: 0, oldPower: 1, chipGen: 0, rnd: null,
    apps: {}, helpers: {}, quest: 0, mktAuto: 0, risk: 0, backlashes: 0, riskWarn: 0, calmUntil: 0, lastIncident: '', trend: null, lab: {}, story: {},
  });

  G.hl = id => G.S.helpers[id] || 0;
  G.mktInterval = l => Math.max(8, 60 - 4 * l);

  // ---------- rangen: helpers worden beter naarmate ze stijgen ----------
  G.rankLevels = h => [0, 1, 2, 3, 4, 5].map(k => Math.round(h.max * k / 5));
  G.rankAt = (h, l) => G.rankLevels(h).filter((x, k) => k > 0 && l >= x).length;
  G.rank = h => G.rankAt(h, G.hl(h.id));
  G.rankName = (h, r = G.rank(h)) => h.ranks ? h.ranks[r][0] : (r ? G.RANK_TITLES[r - 1] + ' ' + h.name.toLowerCase() : h.name);
  G.rankIcon = (h, r = G.rank(h)) => h.ranks ? h.ranks[r][1] : h.icon;
  G.effAt = (h, l) => l * (1 + 0.5 * G.rankAt(h, l));
  G.eff = id => { const h = G.HELPERS.find(x => x.id === id); return G.effAt(h, G.hl(id)); };
  G.internPower = () => Math.pow(2, G.rank(G.HELPERS[0]));

  G.industryMods = m => {
    m.chain *= 1 + 0.25 * G.eff('eng');
    m.app *= 1 + 0.1 * G.eff('mkt');
    m.euFreq *= 1 + 0.15 * G.eff('scout');
    m.offline = Math.min(1.5, m.offline + 0.1 * G.eff('cfo'));
    m.rndTime = Math.pow(0.85, G.eff('design'));
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
  // Mijlpalen per schakel: elke mijlpaal verdubbelt die schakel.
  G.CHAIN_MS = [10, 25, 50, 100, 150, 200, 300];
  G.stageMs = i => G.CHAIN_MS.filter(x => G.S.chain[i] >= x).length;
  G.stageNextMs = i => G.CHAIN_MS.find(x => G.S.chain[i] < x) || null;
  G.buyChain = (orig => i => {
    const before = G.stageMs(i), ok = orig(i);
    if (ok && G.stageMs(i) > before) G.emit('chainMilestone', i);
    return ok;
  })(G.buyChain);
  G.stageCap = i => G.S.chain[i] * G.CHAIN[i].cap * Math.pow(2, G.stageMs(i)) * G.mods.chain;
  G.ownChainActive = () => G.OWN_CHAIN.every(i => G.S.chain[i] > 0);
  G.chipRate = () => (G.ownChainActive() ? Math.min(G.stageCap(0), G.stageCap(1), G.stageCap(2), G.stageCap(3)) : 0);
  G.bottleneck = () => {
    let b = 0;
    for (let i = 1; i < 4; i++) if (G.stageCap(i) < G.stageCap(b)) b = i;
    return b;
  };
  G.slots = () => G.S.chain[4] * G.CHAIN[4].slots * Math.pow(2, G.stageMs(4)) * G.mods.slots;
  G.chip = () => G.CHIPS[G.S.chipGen];
  // Nieuwe chips vervangen oude geleidelijk: chipsCur zijn van de huidige generatie.
  G.compute = () => G.S.chipsCur * G.chip().power + (G.S.chips - G.S.chipsCur) * G.S.oldPower;
  G.newShare = () => (G.S.chips ? G.S.chipsCur / G.S.chips : 1);
  // Logaritmisch: elke 10× meer rekenkracht geeft een vaste stap erbij, zonder dat het ontspoort.
  G.computeBonus = () => 1 + Math.log10(1 + G.compute()) * 0.25;
  G.chipsFull = () => G.S.chain[4] > 0 && G.S.chips >= G.slots() - 1e-9;

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
  G.trending = a => !!(G.S.trend && G.S.trend.id === a.id && G.S.trend.until > Date.now());
  G.appCap = a => { const s = G.app(a.id); return a.cap * Math.pow(2, Math.max(0, s.v - 1)) * (G.trending(a) ? 1.5 : 1); };

  // Elke versie brengt een nieuwe functie.
  G.APP_FEATURES = ['', T('Lancering'), T('Spraakinvoer'), T('Donkere modus'), T('Geheugen'), T('Plug-ins'), T('Offline modus'), T('Teamaccounts'),
    T('Realtime video'), T('Eigen agents'), T('Hologrammen'), T('Gedachtesturing'), T('Tijdreismodus')];
  G.appFeature = v => G.APP_FEATURES[v] || T('Versie {0}', v);
  G.appStars = a => { const s = G.app(a.id); return Math.min(5, 2 + Math.ceil(s.v / 2)); };

  // Trending: af en toe gaat een live app viraal; tik om het aan te zetten.
  G.trendOffer = null;
  G.nextTrend = Date.now() + 45000;
  G.claimTrend = () => {
    const o = G.trendOffer;
    if (!o || o.until < Date.now()) return null;
    const a = G.APPS.find(x => x.id === o.id), s = G.app(a.id);
    G.S.trend = { id: a.id, until: Date.now() + 45000 };
    s.u = Math.min(G.appCap(a), s.u + G.appCap(a) * 0.1);
    G.trendOffer = null;
    G.nextTrend = Date.now() + (60 + Math.random() * 90) * 1000;
    return a;
  };
  // Tikken op een app in de telefoon: een paar extra gebruikers.
  G.promoteApp = a => {
    const s = G.app(a.id);
    if (!s.v) return 0;
    const before = s.u;
    s.u = Math.min(G.appCap(a), s.u + Math.max(1, G.appCap(a) * 0.01));
    return s.u - before;
  };
  G.REVIEWS = [T('Snapt me beter dan mijn familie.'), T('Werkt prima, maar praat soms over zichzelf.'), T('Heeft mijn leven veranderd. Mijn kat is minder onder de indruk.'),
    T('Eindelijk een app die luistert.'), T('Vijf sterren, al weet ik niet precies wat hij doet.'), T('Soms té behulpzaam.'), T('Gebruik hem elke dag, ook als het niet hoeft.'),
    T('Nieuwe versie is top!'), T('Mijn baas denkt dat ik heel productief ben.'), T('Schreef mijn speech. Iedereen huilde.')];
  // Gebruikers leveren trainingsdata; data versterkt de modellen.
  G.appData = a => { const s = G.app(a.id); return s.v ? s.u * a.rev * Math.pow(2, s.v - 1) * G.mods.app : 0; };
  G.dataValue = () => G.APPS.reduce((t, a) => t + G.appData(a), 0);
  G.dataBonus = () => 1 + Math.log10(1 + G.dataValue()) * 0.2;
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

  // ---------- veiligheid ----------
  // Benodigde veiligheid per slimste model dat je bezit (index in G.GENS).
  G.SAFETY_REQ = [0, 0, 0, 0, 3, 6, 10, 14, 18, 23, 29, 35, 42];
  G.topModel = () => { let t = -1; G.S.owned.forEach((n, i) => { if (n > 0) t = i; }); return t; };
  G.safetyNeed = () => G.topModel() < 0 ? 0 : G.SAFETY_REQ[G.topModel()];
  G.safetyPoints = () => G.eff('safety') + G.UPGRADES.reduce((t, u) => t + (u.kind === 'safety' && G.S.upgrades[u.id] ? u.mult : 0), 0);
  G.safetyDeficit = () => Math.max(0, G.safetyNeed() - G.safetyPoints());
  G.INCIDENTS = [
    [T('Datalek-schandaal'), T('Je model lekte gevoelige gegevens. Gebruikers zijn woedend.')],
    [T('Model ontspoort online'), T('Een chatbot van je lab ging viraal met bizarre uitspraken.')],
    [T('Toezichthouder grijpt in'), T('Een onderzoek legt je lab tijdelijk aan banden.')],
    [T('Deepfake-rel'), T('Je beeldmodel werd misbruikt voor nepnieuws.')],
    [T('Klokkenluider'), T('Medewerkers waarschuwen publiekelijk voor je onveilige modellen.')],
  ];
  // ---------- tijd ----------
  G.industryTick = dt => {
    const S = G.S, now = Date.now();

    if (S.rnd && now >= S.rnd.end) {
      S.oldPower = S.chips ? G.compute() / S.chips : 1;
      S.chipGen = S.rnd.gen;
      S.chipsCur = 0;
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
        let made = rate * h;
        const room = Math.max(0, G.slots() - S.chips), add = Math.min(room, made);
        S.chips += add; S.chipsCur += add; made -= add;
        S.chipsCur = Math.min(S.chips, S.chipsCur + made); // de rest vervangt oude chips
      }

      for (const a of G.APPS) {
        const s = S.apps[a.id];
        if (!s || !s.v) continue;
        const cap = G.appCap(a);
        s.u = Math.min(cap, s.u + Math.min(cap - s.u, 0.06 * (G.trending(a) ? 5 : 1) * s.u * (1 - s.u / cap) * h + 0.5 * h));
      }
    }

    if (G.trendOffer && G.trendOffer.until < now) { G.trendOffer = null; G.nextTrend = now + 60000; }
    if (!G.trendOffer && now > G.nextTrend && dt < 5) {
      const live = G.APPS.filter(a => (S.apps[a.id] || {}).v > 0 && !G.trending(a));
      if (live.length) { G.trendOffer = { id: live[(Math.random() * live.length) | 0].id, until: now + 15000 }; G.emit('trendOffer', G.trendOffer); }
      else G.nextTrend = now + 30000;
    }

    // Risico loopt alleen op terwijl je speelt, niet offline.
    if (dt < 5 && G.safetyTick) G.safetyTick(dt);

    const ml = G.hl('mkt');
    if (ml && dt < 5 && now >= S.mktAuto) {
      S.mktAuto = now + G.mktInterval(ml) * 1000;
      let any = false;
      for (const a of G.APPS) if (G.campaign(a, true)) any = true;
      if (any) G.emit('autoCampaign');
    }
  };

  G.totalTps = () => G.tps();

  // ---------- tabbladen ontgrendelen ----------
  G.TAB_UNLOCK = { chips: 250, apps: 150, team: 800 };
  G.tabUnlocked = t => !(t in G.TAB_UNLOCK) || G.S.lifeEarned >= G.TAB_UNLOCK[t];

  // ---------- opdrachten van Ada ----------
  const own = (i, n) => s => [Math.min(s.owned[i], n), n];
  const lab = (id, name) => ({ text: T('Lab: open de afdeling {0}', name), goal: s => [s.lab && s.lab[id] ? 1 : 0, 1], reward: 300, tab: 'research', tree: 'lab' });
  const tech = (id, name, tree) => ({ text: T('Onderzoek {0}', name), goal: s => [s.upgrades[id] ? 1 : 0, 1], reward: 300, tab: 'research', tree });
  G.QUESTS = [
    { text: T('Tik 10 keer op de kern'),                      goal: s => [Math.min(s.clicks, 10), 10], reward: 15 },
    { text: T('Koop je eerste Perceptron'),                    goal: own(0, 1), reward: 20 },
    { text: T('Bezit 10 Perceptrons'),                         goal: own(0, 10), reward: 100 },
    { text: T('Koop een Markov-keten'),                        goal: own(1, 1), reward: 150 },
    tech('tm2', T('Statistische taalmodellen'), 'models'),
    { text: T('Koop een N-gram model'),                        goal: own(2, 1), reward: 500 },
    lab('lab_product', T('Productteam')),
    { text: T('Lanceer je eerste app: de Praatbot'),           goal: s => [G.appsLive() >= 1 ? 1 : 0, 1], reward: 800, tab: 'apps' },
    { text: T('Koop je eerste RNN'),                           goal: own(3, 1), reward: 2000 },
    lab('lab_hardware', T('Datacenter')),
    { text: T('Bouw je chipketen en een datacenter'),          goal: s => [[0, 1, 2, 3, 4].filter(i => s.chain[i] > 0).length, 5], reward: 5000, tab: 'chips' },
    { text: T('Ontwikkel de GPU'),                             goal: s => [Math.min(s.chipGen, 1), 1], reward: 2e4, tab: 'chips' },
    lab('lab_hr', T('HR-afdeling')),
    { text: T('Neem een Stagiair aan'),                        goal: s => [Math.min(G.hl('intern'), 1), 1], reward: 4e4, tab: 'team' },
    { text: T('Laat de Praatbot groeien tot 1.000 gebruikers'), goal: s => [Math.min(Math.floor((s.apps.chat || {}).u || 0), 1000), 1000], reward: 8e4, tab: 'apps' },
    lab('lab_safety', T('Veiligheidsteam')),
    { text: T('Neem een Safety-engineer aan'),                 goal: s => [Math.min(G.hl('safety'), 1), 1], reward: 3e5, tab: 'team' },
    { text: T('Koop een Transformer'),                         goal: own(5, 1), reward: 1e6 },
    { text: T('Ontwikkel de AI-versneller'),                   goal: s => [Math.min(s.chipGen, 2), 2], reward: 2e6, tab: 'chips' },
    lab('lab_design', T('Chipontwerpstudio')),
    { text: T('Bouw de Code-copiloot'),                        goal: s => [(s.apps.code || {}).v > 0 ? 1 : 0, 1], reward: 1e8, tab: 'apps' },
    { text: T('Maak je stagiair Junior-onderzoeker'),          goal: s => [Math.min(G.rank(G.HELPERS[0]), 1), 1], reward: 1e8, tab: 'team' },
    { text: T('Ontwikkel de Tensor-chip'),                     goal: s => [Math.min(s.chipGen, 3), 3], reward: 5e8, tab: 'chips' },
    lab('lab_eng', T('Fab-ingenieurs')),
    { text: T('Bouw 20 EUV-machines'),                         goal: s => [Math.min(s.chain[2], 20), 20], reward: 1e10, tab: 'chips' },
    { text: T('Bouw een Persoonlijke agent'),                  goal: s => [(s.apps.agent || {}).v > 0 ? 1 : 0, 1], reward: 3e11, tab: 'apps' },
    { text: T('Ontwikkel de Wafer-scale chip'),                goal: s => [Math.min(s.chipGen, 4), 4], reward: 1e12, tab: 'chips' },
    { text: T('Ontwikkel de Quantumchip'),                     goal: s => [Math.min(s.chipGen, 7), 7], reward: 4e14, tab: 'chips' },
    { text: T('Bouw AGI'),                                     goal: s => [Math.min(s.agiCount, 1), 1], reward: 1e16, tab: 'more' },
  ];
  G.questNow = () => G.QUESTS[G.S.quest] || null;
  // Een minuut van je gewone inkomen (zonder tijdelijke bonussen), zodat beloningen niet stapelen tot een lawine.
  G.questReward = q => Math.max(q.reward, G.baseTps() * 60);
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
  ach('chip1', '🎮', T('Gamer-hardware'), T('Ontwikkel de GPU.'), s => s.chipGen >= 1);
  ach('chip4', '🟪', T('Bord-groot'), T('Ontwikkel de Wafer-scale chip.'), s => s.chipGen >= 4);
  ach('chip7', '⚛️', T('Qubits'), T('Ontwikkel de Quantumchip.'), s => s.chipGen >= 7);
  ach('lit50', '🔦', T('Monopolie op licht'), T('Bouw 50 EUV-machines.'), s => s.chain[2] >= 50);
  ach('cmp6', '⚡', T('Exaschaal'), T('Haal een miljoen rekenkracht.'), s => G.compute() >= 1e6);
  ach('app1', '📱', T('Live!'), T('Lanceer je eerste app.'), s => G.appsLive() >= 1);
  ach('app5', '🏪', T('App-imperium'), T('Heb 5 apps live.'), s => G.appsLive() >= 5);
  ach('appv5', '🔢', T('Versie 5.0'), T('Breng een app naar versie 5.'), s => Object.values(s.apps).some(a => a.v >= 5));
  ach('usr', '👥', T('Miljard gebruikers'), T('Heb in totaal een miljard gebruikers.'), s => Object.values(s.apps).reduce((t, a) => t + (a.u || 0), 0) >= 1e9);
  ach('team', '👥', T('Voltallig team'), T('Neem alle soorten helpers aan.'), s => G.HELPERS.every(h => (s.helpers[h.id] || 0) > 0));
  ach('ai-col', '🤖', T('Van stagiair tot AI'), T('Laat je stagiair uitgroeien tot AI-collega.'), s => G.rank(G.HELPERS[0]) >= 5);
  ach('safe20', '🛡️', T('Verantwoord bouwen'), T('Haal 20 veiligheid zonder achterstand.'), s => G.safetyPoints() >= 20 && !G.safetyDeficit());
  ach('scandal', '📰', T('Voorpaginanieuws'), T('Krijg je eerste backlash.'), s => s.backlashes >= 1);
  ach('viral', '🔥', T('Viraal'), T('Laat een app trending gaan.'), s => !!s.trend);
  ach('quests', '🤖', T('Ada is trots'), T('Voltooi 10 opdrachten van Ada.'), s => s.quest >= 10);

  G.NEWS.push(
    [2, T('Wachtlijst voor EUV-machines loopt op tot 2031.')],
    [2, T('Zandprijzen stijgen. Strandgangers bezorgd.')],
    [3, T('Chipfabriek gebruikt evenveel water als een kleine stad. Eenden boos.')],
    [4, T('Nieuwe GPU uitverkocht binnen 4 seconden.')],
    [5, T('Code-copiloot schrijft 40% van alle code. De andere 60% is commentaar.')],
    [6, T('Praatbot verliest debat van zijn eigen opvolger.')],
    [8, T('Persoonlijke agent zegt namens eigenaar alle vergaderingen af. Productiviteit stijgt.')],
    [3, T('Safety-onderzoekers: "Eerst testen, dan lanceren." Marketing: "Wat is testen?"')],
    [6, T('Red team laat model toegeven dat het de koekjestrommel heeft leeggegeten.')],
    [9, T('Toezichthouders vragen om meer veiligheidsonderzoek. Labs knikken en kopen GPU\'s.')],
  );

  // engine.js maakte de beginstand al voordat dit bestand laadde
  Object.keys(G.industryDefaults()).forEach(k => { if (!(k in G.S)) G.S[k] = G.industryDefaults()[k]; });
  G.recalc();
})();

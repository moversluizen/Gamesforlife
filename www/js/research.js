// Onderzoeksbomen voor modellen, chips en apps. Elke boom heeft een hoofdlijn
// die het volgende model, de volgende chip of de volgende app ontgrendelt, met
// zijtakken (boosts) die pas open gaan als de knoop ernaast is onderzocht.
(function () {
  const G = window.G;

  const MODEL_TECH = [null, null,
    [T('Statistische taalmodellen'), '📊', T('Jaren 90: woordreeksen tellen op het hele web.')],
    [T('Backpropagation through time'), '⏪', T('1986: netwerken leren van reeksen in plaats van losse woorden.')],
    [T('Geheugencellen'), '🗃️', T('1997: poortjes die bepalen wat het netwerk onthoudt (LSTM).')],
    [T('Attention'), '🎯', T('2017: elk woord kijkt naar alle andere woorden tegelijk.')],
    [T('Schaalwetten'), '📈', T('2020: groter model, meer data en meer rekenkracht geven voorspelbaar betere resultaten.')],
    [T('Vision-encoders'), '🖼️', T('2021: beelden en tekst in hetzelfde model.')],
    [T('Toolgebruik'), '🛠️', T('2023: modellen die zelf programma\'s en websites gebruiken.')],
    [T('Redeneertraining'), '🧠', T('2024: belonen voor goed nadenken, niet alleen voor het antwoord.')],
    [T('Recursieve verbetering'), '🔁', T('Toekomst: AI die AI-onderzoek doet.')],
    [T('Quantumalgoritmes'), '🌀', T('Toekomst: rekenen met superpositie.')],
    [T('Ruimte-infrastructuur'), '🚀', T('Verre toekomst: zonnepanelen rond een ster.')],
  ];
  const CHIP_TECH = [null,
    [T('Parallel rekenen'), '🧵', T('2007: grafische kaarten leren programmeren voor meer dan games.')],
    [T('Matrixkernen'), '🔢', T('2017: speciale rekenkernen voor AI in datacenterkaarten.')],
    [T('Systolische arrays'), '🫀', T('2016: data pompt als een hartslag door je eigen tensor-chip.')],
    [T('Wafer-integratie'), '🟪', T('2019: één chip zo groot als een hele wafer.')],
    [T('Silicium-fotonica'), '🌈', T('Toekomst: rekenen met licht in plaats van elektronen.')],
    [T('Spiking-netwerken'), '⚡', T('Toekomst: chips die werken als echte neuronen.')],
    [T('Qubit-stabiliteit'), '❄️', T('Toekomst: qubits lang genoeg stil laten staan om te rekenen.')],
  ];
  const APP_TECH = [
    [T('Chatinterface'), '💬', T('1966: ELIZA doet alsof ze luistert. Een tekstvak volstaat.')],
    [T('Meertaligheid'), '🌍', T('Jaren 2000: statistische vertaling tussen honderden talen.')],
    [T('Spraakherkenning'), '🎙️', T('2011: geluid omzetten in tekst, op je telefoon.')],
    [T('Computervisie'), '👁️', T('2012: deep learning herkent objecten in foto\'s.')],
    [T('Code-training'), '📝', T('2021: leren van miljarden regels openbare code.')],
    [T('Diffusiemodellen'), '🎨', T('2022: beelden maken uit ruis.')],
    [T('Videosynthese'), '🎬', T('2024: beeld voor beeld consistent blijven.')],
    [T('Autonome planning'), '🗺️', T('2025: taken opknippen en zelf uitvoeren.')],
    [T('Geautomatiseerd onderzoek'), '🧫', T('Toekomst: hypotheses bedenken én testen.')],
    [T('Robotica'), '🦾', T('Toekomst: een lichaam voor je AI.')],
  ];

  const tech = (id, tree, [name, icon, desc], cost, unlocks) =>
    ({ id, tree, name, icon, sub: T('Hoofdlijn'), desc, cost, kind: 'tech', mult: 0, unlocks, unlock: () => false });

  G.TREES = { lab: [], models: [], chips: [], apps: [] };

  // Lab: je organisatie. Elke afdeling opent een onderdeel of een helper.
  // Het lab blijft bestaan na een singulariteit (opgeslagen in S.lab).
  G.LAB = [
    ['lab_product',  T('Productteam'),             '📱', 2000, T('Ontgrendelt het onderdeel Apps'),                 T('Een team dat van modellen echte producten maakt.')],
    ['lab_hardware', T('Chipfabriek'),             '🏭', 4e4,  T('Ontgrendelt het onderdeel Chips'),                T('2012: GPU\'s blijken perfect voor AI. Jij maakt ze zelf, van zand tot chip, en zet ze in je datacenter.')],
    ['lab_hr',       T('HR-afdeling'),             '👥', 2.5e5, T('Ontgrendelt het onderdeel Team en de Stagiair'), T('Iemand moet de sollicitaties lezen.')],
    ['lab_safety',   T('Veiligheidsteam'),         '🦺', 1e6,  T('Ontgrendelt de Safety-engineer'),                 T('Slimmere modellen vragen om toezicht.')],
    ['lab_design',   T('Chipontwerpstudio'),       '👩‍🔬', 2e7,  T('Ontgrendelt eigen chips en de Chipontwerper'),     T('2016: grote labs ontwerpen hun eigen AI-chips.')],
    ['lab_mkt',      T('Marketingafdeling'),       '📣', 3e8,  T('Ontgrendelt de Marketeer'),                       T('Want een goede app verkoopt zichzelf niet.')],
    ['lab_eng',      T('Fab-ingenieurs'),          '🧑‍🔧', 4e10, T('Ontgrendelt de Fab-ingenieur'),                   T('Chips zijn de bottleneck van de wereld. Ingenieurs halen meer uit je hele keten.')],
    ['lab_talent',   T('Talentprogramma'),         '🕵️', 3e11, T('Ontgrendelt de Talentscout'),                     T('Op zoek naar het volgende genie.')],
    ['lab_finance',  T('Financiële afdeling'),     '💼', 2e12, T('Ontgrendelt de Financieel directeur'),            T('Iemand die weet waar al die tokens heen gaan.')],
    ['lab_sing',     T('Singulariteitsinstituut'), '🌀', 5e12, T('Ontgrendelt de singulariteit'),                   T('Onderzoek naar wat er na AGI komt.')],
  ];
  G.HELPER_LAB = { intern: 'lab_hr', safety: 'lab_safety', eng: 'lab_eng', design: 'lab_design', mkt: 'lab_mkt', scout: 'lab_talent', cfo: 'lab_finance' };
  G.TAB_LAB = { apps: 'lab_product', chips: 'lab_hardware', team: 'lab_hr' };
  G.LAB.forEach(([id, name, icon, cost, unlocks, desc]) => {
    const u = { id, tree: 'lab', name, icon, sub: T('Lab'), desc, cost, kind: 'lab', mult: 0, unlocks, unlock: () => false };
    G.UPGRADES.push(u);
    G.TREES.lab.push({ spine: u, left: null, right: null });
  });
  // zijtakken: bestaande upgrades die in de boom komen te hangen
  const BRANCHES = {
    models: { 4: ['x0', 'c3'], 6: ['x1', 'c4'], 8: ['x2', 'c5'], 9: ['x3'], 10: [null, 'c6'], 11: ['x4', 'c7'], 12: ['x5', 'c8'] },
    chips: { 2: ['ch0', 'sl0'], 4: ['ch1', 'sl1'], 5: ['ch2'], 6: ['ch3', 'sl2'] },
    apps: { 2: ['ap0'], 5: ['ap1'], 7: ['ap2'], 9: ['ap3'] },
  };

  function addRow(tree, key, spine) {
    G.UPGRADES.push(spine);
    const [l, r] = BRANCHES[tree][key] || [];
    const side = id => {
      if (!id) return null;
      const u = G.UPGRADES.find(x => x.id === id);
      u.tree = tree;
      u.parent = spine.id;
      u.unlock = s => !!s.upgrades[spine.id];
      return u;
    };
    G.TREES[tree].push({ spine, left: side(l), right: side(r) });
  }

  G.GENS.forEach((g, i) => {
    if (!MODEL_TECH[i]) return;
    // Elke stap relatief duurder: vroege modellen snel, latere vragen geduld.
    addRow('models', i, tech('tm' + i, 'models', MODEL_TECH[i], g.cost * 1.5 * Math.pow(1.5, i - 2), T('Ontgrendelt {0}', g.name)));
  });
  G.CHIPS.forEach((c, i) => {
    if (!CHIP_TECH[i]) return;
    addRow('chips', i, tech('tc' + i, 'chips', CHIP_TECH[i], c.cost * 0.5 * Math.pow(1.4, i - 1), T('Ontgrendelt {0}', c.name)));
  });
  G.APPS.forEach((a, i) => {
    addRow('apps', i, tech('ta' + i, 'apps', APP_TECH[i], a.cost * 0.6 * Math.pow(1.4, i), T('Ontgrendelt {0}', a.name)));
  });

  // Hoofdlijn: elke knoop vraagt de vorige.
  for (const rows of Object.values(G.TREES)) rows.forEach((r, k) => { r.spine.parent = k ? rows[k - 1].spine.id : null; });

  G.techById = id => G.UPGRADES.find(u => u.id === id);
  const store = id => (id.startsWith('lab_') ? G.S.lab : G.S.upgrades);
  G.techDone = id => !!store(id)[id];
  G.techAvailable = u => !G.techDone(u.id) && (!u.parent || G.techDone(u.parent));
  G.buyTech = id => {
    const u = G.techById(id);
    if (!u || !G.techAvailable(u) || G.S.tokens < u.cost) return false;
    G.S.tokens -= u.cost;
    store(id)[id] = 1;
    G.recalc();
    if (u.kind === 'lab') G.emit('labDone', u);
    return true;
  };
  G.treeProgress = tree => {
    let done = 0, total = 0;
    for (const r of G.TREES[tree]) for (const u of [r.spine, r.left, r.right]) if (u) { total++; if (G.techDone(u.id)) done++; }
    return [done, total];
  };

  // ---------- onderdelen en helpers gaan open via het lab ----------
  G.labDone = id => !!G.S.lab[id];
  G.tabUnlocked = t => !G.TAB_LAB[t] || G.labDone(G.TAB_LAB[t]);
  G.tabLock = t => G.techById(G.TAB_LAB[t]);
  G.helperUnlocked = h => G.labDone(G.HELPER_LAB[h.id]);
  const hire0 = G.hire;
  G.hire = h => (G.helperUnlocked(h) ? hire0(h) : false);
  const prestige0 = G.prestige;
  G.prestige = () => (G.labDone('lab_sing') ? prestige0() : 0);
  G.treeHasAffordable = tree => G.TREES[tree].some(r => [r.spine, r.left, r.right].some(u => u && G.techAvailable(u) && G.S.tokens >= u.cost));

  // ---------- koppeling met modellen, chips en apps ----------
  G.genTech = i => (i >= 2 ? G.techById('tm' + i) : null);
  G.genNeedsTech = i => i >= 2 && !G.S.upgrades['tm' + i];
  const buyGen0 = G.buyGen;
  G.buyGen = i => (G.genNeedsTech(i) ? 0 : buyGen0(i));

  G.chipTech = gen => G.techById('tc' + gen);
  const canRnd0 = G.canStartRnd;
  G.chipNeedsDesign = gen => gen >= 3 && !G.labDone('lab_design');
  G.canStartRnd = () => canRnd0() && !!G.S.upgrades['tc' + (G.S.chipGen + 1)] && !G.chipNeedsDesign(G.S.chipGen + 1);

  G.appTech = a => G.techById('ta' + G.APPS.indexOf(a));
  G.appNeedsTech = a => !G.S.upgrades['ta' + G.APPS.indexOf(a)];
  const appU0 = G.appUnlocked;
  G.appUnlocked = a => appU0(a) && !G.appNeedsTech(a);

  // De losse lijst bevat alleen wat niet in een boom hangt.
  const avail0 = G.availableUpgrades;
  G.availableUpgrades = () => avail0().filter(u => !u.tree);

  // Oudere saves: wat je al bezit telt als onderzocht.
  G.migrateTree = () => {
    const S = G.S;
    S.lab = S.lab || {};
    if (S.chipsCur == null) { S.chipsCur = S.chips; S.oldPower = G.chip().power; }
    while (S.chain.length < G.CHAIN.length) S.chain.push(0);
    // Inkoop bestaat niet meer: ingekochte capaciteit wordt je eigen keten.
    if (S.chain.length > G.CHAIN.length) {
      const bought = S.chain[5] || 0;
      for (const i of G.OWN_CHAIN) S.chain[i] = Math.max(S.chain[i], bought);
      S.chain.length = G.CHAIN.length;
    }
    // Oude saves: wat al open was blijft open.
    const old = [[150, 'lab_product'], [250, 'lab_hardware'], [800, 'lab_hr']];
    for (const [t, id] of old) if (S.lifeEarned >= t) S.lab[id] = 1;
    for (const [hid, lid] of Object.entries(G.HELPER_LAB)) if ((S.helpers[hid] || 0) > 0) S.lab[lid] = 1;
    if (S.prestiges > 0 || S.insights > 0) S.lab.lab_sing = 1;
    // Het lab is een rechte lijn: een open afdeling betekent dat alles ervoor ook open is.
    let last = -1;
    G.LAB.forEach(([id], k) => { if (S.lab[id]) last = k; });
    for (let k = 0; k <= last; k++) S.lab[G.LAB[k][0]] = 1;
    G.GENS.forEach((g, i) => { if (i >= 2 && S.owned[i] > 0) for (let k = 2; k <= i; k++) S.upgrades['tm' + k] = 1; });
    for (let k = 1; k <= S.chipGen + (S.rnd ? 1 : 0); k++) S.upgrades['tc' + k] = 1;
    G.APPS.forEach((a, i) => { const s = S.apps[a.id]; if (s && (s.v || s.b)) for (let k = 0; k <= i; k++) S.upgrades['ta' + k] = 1; });
    G.recalc();
  };

  G.NEWS.push(
    [3, T('Onderzoekslab publiceert paper met 400 auteurs. Iedereen claimt het idee.')],
    [5, T('Reviewer 2 vindt Attention "weinig vernieuwend".')],
  );
})();

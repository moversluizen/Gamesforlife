// Onderzoeksbomen voor modellen, chips en apps. Elke boom heeft een hoofdlijn
// die het volgende model, de volgende chip of de volgende app ontgrendelt, met
// zijtakken (boosts) die pas open gaan als de knoop ernaast is onderzocht.
(function () {
  const G = window.G;

  const MODEL_TECH = [null, null,
    ['Statistische taalmodellen', '📊', 'Jaren 90: woordreeksen tellen op het hele web.'],
    ['Backpropagation through time', '⏪', '1986: netwerken leren van reeksen in plaats van losse woorden.'],
    ['Geheugencellen', '🗃️', '1997: poortjes die bepalen wat het netwerk onthoudt (LSTM).'],
    ['Attention', '🎯', '2017: elk woord kijkt naar alle andere woorden tegelijk.'],
    ['Schaalwetten', '📈', '2020: groter model, meer data en meer rekenkracht geven voorspelbaar betere resultaten.'],
    ['Vision-encoders', '🖼️', '2021: beelden en tekst in hetzelfde model.'],
    ['Toolgebruik', '🛠️', '2023: modellen die zelf programma\'s en websites gebruiken.'],
    ['Redeneertraining', '🧠', '2024: belonen voor goed nadenken, niet alleen voor het antwoord.'],
    ['Recursieve verbetering', '🔁', 'Toekomst: AI die AI-onderzoek doet.'],
    ['Quantumalgoritmes', '🌀', 'Toekomst: rekenen met superpositie.'],
    ['Ruimte-infrastructuur', '🚀', 'Verre toekomst: zonnepanelen rond een ster.'],
  ];
  const CHIP_TECH = [null,
    ['Parallel rekenen', '🧵', '2007: grafische kaarten leren programmeren voor meer dan games.'],
    ['Matrixkernen', '🔢', '2017: speciale rekenkernen voor AI in datacenterkaarten.'],
    ['Systolische arrays', '🫀', '2016: data pompt als een hartslag door je eigen tensor-chip.'],
    ['Wafer-integratie', '🟪', '2019: één chip zo groot als een hele wafer.'],
    ['Silicium-fotonica', '🌈', 'Toekomst: rekenen met licht in plaats van elektronen.'],
    ['Spiking-netwerken', '⚡', 'Toekomst: chips die werken als echte neuronen.'],
    ['Qubit-stabiliteit', '❄️', 'Toekomst: qubits lang genoeg stil laten staan om te rekenen.'],
  ];
  const APP_TECH = [
    ['Chatinterface', '💬', '1966: ELIZA doet alsof ze luistert. Een tekstvak volstaat.'],
    ['Meertaligheid', '🌍', 'Jaren 2000: statistische vertaling tussen honderden talen.'],
    ['Spraakherkenning', '🎙️', '2011: geluid omzetten in tekst, op je telefoon.'],
    ['Computervisie', '👁️', '2012: deep learning herkent objecten in foto\'s.'],
    ['Code-training', '⌨️', '2021: leren van miljarden regels openbare code.'],
    ['Diffusiemodellen', '🎨', '2022: beelden maken uit ruis.'],
    ['Videosynthese', '🎬', '2024: beeld voor beeld consistent blijven.'],
    ['Autonome planning', '🗺️', '2025: taken opknippen en zelf uitvoeren.'],
    ['Geautomatiseerd onderzoek', '🔬', 'Toekomst: hypotheses bedenken én testen.'],
    ['Robotica', '🦾', 'Toekomst: een lichaam voor je AI.'],
  ];

  const tech = (id, tree, [name, icon, desc], cost, unlocks) =>
    ({ id, tree, name, icon, sub: 'Hoofdlijn', desc, cost, kind: 'tech', mult: 0, unlocks, unlock: () => false });

  G.TREES = { lab: [], models: [], chips: [], apps: [] };

  // Lab: je organisatie. Elke afdeling opent een onderdeel of een helper.
  // Het lab blijft bestaan na een singulariteit (opgeslagen in S.lab).
  G.LAB = [
    ['lab_product',  'Productteam',             '📱', 2000, 'Ontgrendelt het onderdeel Apps',                 'Een team dat van modellen echte producten maakt.'],
    ['lab_hardware', 'Datacenter',              '🗄️', 4e4,  'Ontgrendelt het onderdeel Chips',                '2012: gaming-GPU\'s blijken perfect voor AI. Koop ze in en zet ze in een datacenter.'],
    ['lab_hr',       'HR-afdeling',             '👥', 2.5e5, 'Ontgrendelt het onderdeel Team en de Stagiair', 'Iemand moet de sollicitaties lezen.'],
    ['lab_safety',   'Veiligheidsteam',         '🦺', 1e6,  'Ontgrendelt de Safety-engineer',                 'Slimmere modellen vragen om toezicht.'],
    ['lab_design',   'Chipontwerpstudio',       '👩‍🔬', 2e7,  'Ontgrendelt eigen chips en de Chipontwerper',     '2016: grote labs ontwerpen hun eigen AI-chips.'],
    ['lab_mkt',      'Marketingafdeling',       '📣', 3e8,  'Ontgrendelt de Marketeer',                       'Want een goede app verkoopt zichzelf niet.'],
    ['lab_eng',      'Eigen chipfabriek',       '🏭', 4e10, 'Ontgrendelt je eigen fabriek en de Fab-ingenieur', 'Chips zijn de bottleneck van de wereld. Maak ze zelf, van zand tot chip.'],
    ['lab_talent',   'Talentprogramma',         '🕵️', 3e11, 'Ontgrendelt de Talentscout',                     'Op zoek naar het volgende genie.'],
    ['lab_finance',  'Financiële afdeling',     '💼', 2e12, 'Ontgrendelt de Financieel directeur',            'Iemand die weet waar al die tokens heen gaan.'],
    ['lab_sing',     'Singulariteitsinstituut', '🌀', 5e12, 'Ontgrendelt de singulariteit',                   'Onderzoek naar wat er na AGI komt.'],
  ];
  G.HELPER_LAB = { intern: 'lab_hr', safety: 'lab_safety', eng: 'lab_eng', design: 'lab_design', mkt: 'lab_mkt', scout: 'lab_talent', cfo: 'lab_finance' };
  G.TAB_LAB = { apps: 'lab_product', chips: 'lab_hardware', team: 'lab_hr' };
  G.LAB.forEach(([id, name, icon, cost, unlocks, desc]) => {
    const u = { id, tree: 'lab', name, icon, sub: 'Lab', desc, cost, kind: 'lab', mult: 0, unlocks, unlock: () => false };
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
    addRow('models', i, tech('tm' + i, 'models', MODEL_TECH[i], g.cost * 1.5 * Math.pow(1.5, i - 2), `Ontgrendelt ${g.icon} ${g.name}`));
  });
  G.CHIPS.forEach((c, i) => {
    if (!CHIP_TECH[i]) return;
    addRow('chips', i, tech('tc' + i, 'chips', CHIP_TECH[i], c.cost * 0.5 * Math.pow(1.4, i - 1), `Ontgrendelt ${c.icon} ${c.name}`));
  });
  G.APPS.forEach((a, i) => {
    addRow('apps', i, tech('ta' + i, 'apps', APP_TECH[i], a.cost * 0.6 * Math.pow(1.4, i), `Ontgrendelt ${a.icon} ${a.name}`));
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
    [3, 'Onderzoekslab publiceert paper met 400 auteurs. Iedereen claimt het idee.'],
    [5, 'Reviewer 2 vindt Attention "weinig vernieuwend".'],
  );
})();

// Onderzoeksbomen voor modellen, chips en apps. Elke boom heeft een hoofdlijn
// die het volgende model, de volgende chip of de volgende app ontgrendelt, met
// zijtakken (boosts) die pas open gaan als de knoop ernaast is onderzocht.
(function () {
  const G = window.G;

  const MODEL_TECH = [null, null,
    ['Statistische taalmodellen', '📊', 'Woorden tellen, maar dan slim.'],
    ['Backpropagation through time', '⏪', 'Leren van wat er eerder in de zin stond.'],
    ['Geheugencellen', '🗃️', 'Poortjes die bepalen wat het netwerk onthoudt.'],
    ['Attention', '🎯', 'Elk woord kijkt naar alle andere woorden.'],
    ['Schaalwetten', '📈', 'Groter model, meer data, beter resultaat.'],
    ['Vision-encoders', '🖼️', 'Beelden omzetten in iets wat een taalmodel snapt.'],
    ['Toolgebruik', '🛠️', 'Modellen die zelf programma\'s en websites gebruiken.'],
    ['Redeneertraining', '🧠', 'Belonen voor goed nadenken, niet alleen voor het antwoord.'],
    ['Recursieve verbetering', '🔁', 'AI die AI-onderzoek doet.'],
    ['Quantumalgoritmes', '🌀', 'Rekenen met superpositie.'],
    ['Ruimte-infrastructuur', '🚀', 'Zonnepanelen rond een ster.'],
  ];
  const CHIP_TECH = [null,
    ['Parallel rekenen', '🧵', 'Duizenden kleine rekenkernen tegelijk.'],
    ['Matrixkernen', '🔢', 'Hardware die vooral matrices vermenigvuldigt.'],
    ['Systolische arrays', '🫀', 'Data pompt als een hartslag door de chip.'],
    ['Wafer-integratie', '🟪', 'Eén chip zo groot als een hele wafer.'],
    ['Silicium-fotonica', '🌈', 'Rekenen met licht in plaats van elektronen.'],
    ['Spiking-netwerken', '⚡', 'Chips die werken als echte neuronen.'],
    ['Qubit-stabiliteit', '❄️', 'Qubits lang genoeg stil laten staan om te rekenen.'],
  ];
  const APP_TECH = [
    ['Chatinterface', '💬', 'Een tekstvak en een verzendknop. Revolutionair.'],
    ['Meertaligheid', '🌍', 'Eén model voor honderd talen.'],
    ['Spraakherkenning', '🎙️', 'Geluid omzetten in tekst.'],
    ['Computervisie', '👁️', 'Objecten herkennen in foto\'s.'],
    ['Code-training', '⌨️', 'Leren van miljarden regels code.'],
    ['Diffusiemodellen', '🎨', 'Beelden maken uit ruis.'],
    ['Videosynthese', '🎬', 'Beeld voor beeld consistent blijven.'],
    ['Autonome planning', '🗺️', 'Taken opknippen en zelf uitvoeren.'],
    ['Geautomatiseerd onderzoek', '🔬', 'Hypotheses bedenken én testen.'],
    ['Robotica', '🦾', 'Een lichaam voor je AI.'],
  ];

  const tech = (id, tree, [name, icon, desc], cost, unlocks) =>
    ({ id, tree, name, icon, sub: 'Hoofdlijn', desc, cost, kind: 'tech', mult: 0, unlocks, unlock: () => false });

  G.TREES = { lab: [], models: [], chips: [], apps: [] };

  // Lab: je organisatie. Elke afdeling opent een onderdeel of een helper.
  // Het lab blijft bestaan na een singulariteit (opgeslagen in S.lab).
  G.LAB = [
    ['lab_product',  'Productteam',             '📱', 400,  'Ontgrendelt het onderdeel Apps',               'Een team dat van modellen echte producten maakt.'],
    ['lab_hardware', 'Eigen hardware',          '💾', 4000,  'Ontgrendelt het onderdeel Chips',              'Stop met huren: bouw je eigen chips en datacenters.'],
    ['lab_hr',       'HR-afdeling',             '👥', 6e4,  'Ontgrendelt het onderdeel Team en de Stagiair', 'Iemand moet de sollicitaties lezen.'],
    ['lab_safety',   'Veiligheidsteam',         '🦺', 5e5, 'Ontgrendelt de Safety-engineer',               'Slimmere modellen vragen om toezicht.'],
    ['lab_eng',      'Engineeringafdeling',     '🧑‍🔧', 5e6, 'Ontgrendelt de Fab-ingenieur',                'Mensen die de fabriek draaiende houden.'],
    ['lab_design',   'Chipontwerpstudio',       '👩‍🔬', 5e7,  'Ontgrendelt de Chipontwerper',                'Ontwerp je chips zelf, sneller dan de concurrent.'],
    ['lab_mkt',      'Marketingafdeling',       '📣', 5e8,  'Ontgrendelt de Marketeer',                     'Want een goede app verkoopt zichzelf niet.'],
    ['lab_talent',   'Talentprogramma',         '🕵️', 1e10,  'Ontgrendelt de Talentscout',                   'Op zoek naar het volgende genie.'],
    ['lab_finance',  'Financiële afdeling',     '💼', 2e11,  'Ontgrendelt de Financieel directeur',          'Iemand die weet waar al die tokens heen gaan.'],
    ['lab_sing',     'Singulariteitsinstituut', '🌀', 5e12,  'Ontgrendelt de singulariteit',                 'Onderzoek naar wat er na AGI komt.'],
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
  G.canStartRnd = () => canRnd0() && !!G.S.upgrades['tc' + (G.S.chipGen + 1)];

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

  // Ada leert je de boom kennen.
  const qi = G.QUESTS.findIndex(q => q.text === 'Koop een Markov-keten');
  G.QUESTS.splice(qi + 1, 0, { text: 'Onderzoek Statistische taalmodellen', goal: s => [s.upgrades.tm2 ? 1 : 0, 1], reward: 300, tab: 'research', tree: 'models' });
  const labQuest = (before, id, name) => {
    const k = G.QUESTS.findIndex(q => q.text === before);
    G.QUESTS.splice(k, 0, { text: `Onderzoek in je lab: ${name}`, goal: s => [s.lab && s.lab[id] ? 1 : 0, 1], reward: 200, tab: 'research', tree: 'lab' });
  };
  labQuest('Bouw je eerste app: de Praatbot', 'lab_product', 'Productteam');
  labQuest('Bouw een Zandgroeve', 'lab_hardware', 'Eigen hardware');
  labQuest('Neem een Stagiair aan', 'lab_hr', 'HR-afdeling');
  labQuest('Neem een Safety-engineer aan', 'lab_safety', 'Veiligheidsteam');

  G.NEWS.push(
    [3, 'Onderzoekslab publiceert paper met 400 auteurs. Iedereen claimt het idee.'],
    [5, 'Reviewer 2 vindt Attention "weinig vernieuwend".'],
  );
})();

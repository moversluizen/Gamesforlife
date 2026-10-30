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

  G.TREES = { models: [], chips: [], apps: [] };
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
    addRow('models', i, tech('tm' + i, 'models', MODEL_TECH[i], g.cost * 0.5, `Ontgrendelt ${g.icon} ${g.name}`));
  });
  G.CHIPS.forEach((c, i) => {
    if (!CHIP_TECH[i]) return;
    addRow('chips', i, tech('tc' + i, 'chips', CHIP_TECH[i], c.cost * 0.3, `Ontgrendelt ${c.icon} ${c.name}`));
  });
  G.APPS.forEach((a, i) => {
    addRow('apps', i, tech('ta' + i, 'apps', APP_TECH[i], a.cost * 0.4, `Ontgrendelt ${a.icon} ${a.name}`));
  });

  // Hoofdlijn: elke knoop vraagt de vorige.
  for (const rows of Object.values(G.TREES)) rows.forEach((r, k) => { r.spine.parent = k ? rows[k - 1].spine.id : null; });

  G.techById = id => G.UPGRADES.find(u => u.id === id);
  G.techDone = id => !!G.S.upgrades[id];
  G.techAvailable = u => !G.S.upgrades[u.id] && (!u.parent || !!G.S.upgrades[u.parent]);
  G.buyTech = id => {
    const u = G.techById(id);
    if (!u || !G.techAvailable(u) || G.S.tokens < u.cost) return false;
    G.S.tokens -= u.cost;
    G.S.upgrades[id] = 1;
    G.recalc();
    return true;
  };
  G.treeProgress = tree => {
    let done = 0, total = 0;
    for (const r of G.TREES[tree]) for (const u of [r.spine, r.left, r.right]) if (u) { total++; if (G.S.upgrades[u.id]) done++; }
    return [done, total];
  };
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
    G.GENS.forEach((g, i) => { if (i >= 2 && S.owned[i] > 0) for (let k = 2; k <= i; k++) S.upgrades['tm' + k] = 1; });
    for (let k = 1; k <= S.chipGen + (S.rnd ? 1 : 0); k++) S.upgrades['tc' + k] = 1;
    G.APPS.forEach((a, i) => { const s = S.apps[a.id]; if (s && (s.v || s.b)) for (let k = 0; k <= i; k++) S.upgrades['ta' + k] = 1; });
    G.recalc();
  };

  // Ada leert je de boom kennen.
  const qi = G.QUESTS.findIndex(q => q.text === 'Koop een Markov-keten');
  G.QUESTS.splice(qi + 1, 0, { text: 'Onderzoek Statistische taalmodellen', goal: s => [s.upgrades.tm2 ? 1 : 0, 1], reward: 300, tab: 'research' });

  G.NEWS.push(
    [3, 'Onderzoekslab publiceert paper met 400 auteurs. Iedereen claimt het idee.'],
    [5, 'Reviewer 2 vindt Attention "weinig vernieuwend".'],
  );
})();

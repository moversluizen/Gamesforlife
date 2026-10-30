// Veiligheid: een eigen tak naast Team. Safety-engineers, veiligheidsonderzoek en protocollen
// die (net als in de echte geschiedenis) laten zien hoe labs leerden verantwoord te bouwen.
(function () {
  const G = window.G;

  // Protocollen: eenmalig, elk met een echte mijlpaal uit de AI-veiligheid.
  // model = index van het model dat je moet bezitten voordat het protocol beschikbaar is.
  G.PROTOCOLS = [
    { id: 'pr0', icon: '📄', name: 'Concrete problemen',     year: '2016', cost: 5e5,  model: 4,  fx: { rate: 0.75 },  desc: 'Risico stijgt 25% langzamer.',                 story: 'Een beroemd paper zet de veiligheidsproblemen van AI voor het eerst op een rij.' },
    { id: 'pr1', icon: '🚦', name: 'Gefaseerde release',     year: '2019', cost: 2e7,  model: 5,  fx: { users: 0.5 },  desc: 'Bij een backlash verliezen je apps de helft minder gebruikers.', story: 'Een lab brengt een taalmodel stap voor stap uit, uit angst voor misbruik.' },
    { id: 'pr2', icon: '📏', name: 'Verantwoord schalen',    year: '2023', cost: 5e8,  model: 6,  fx: { dur: 0.5 },    desc: 'Een backlash duurt de helft korter.',          story: 'Labs beloven: hoe krachtiger het model, hoe strenger de tests.' },
    { id: 'pr3', icon: '🏛️', name: 'Veiligheidstop',         year: '2023', cost: 2e10, model: 7,  fx: { calm: 2 },     desc: 'Na een backlash twee keer zo lang rust.',       story: 'Regeringen en labs komen voor het eerst samen om over AI-risico\'s te praten.' },
    { id: 'pr4', icon: '⚖️', name: 'AI-wet',                 year: '2024', cost: 5e11, model: 8,  fx: { rate: 0.75 },  desc: 'Risico stijgt nog eens 25% langzamer.',        story: 'De eerste brede AI-wet treedt in werking. Regels voor de riskantste systemen.' },
    { id: 'pr5', icon: '🌐', name: 'Internationaal toezicht', year: 'toekomst', cost: 1e13, model: 10, fx: { pts: 5 }, desc: '+5 veiligheid voor je modellen.',               story: 'Een wereldwijd instituut test elk grensverleggend model voordat het uitkomt.' },
  ];
  G.PROTOCOLS.forEach(p => G.UPGRADES.push({ ...p, sub: 'Protocol', kind: 'protocol', mult: 0, safetyTab: true, lockText: `Komt vrij bij ${G.GENS[p.model].name}`, unlock: s => s.owned[p.model] > 0 }));
  // Veiligheidsonderzoek hoort voortaan in deze tak, niet bij de boosts.
  for (const u of G.UPGRADES) if (u.kind === 'safety') u.safetyTab = true;

  G.protoDone = id => !!G.S.upgrades[id];
  const fx = (k, base, comb) => G.PROTOCOLS.reduce((v, p) => (G.protoDone(p.id) && p.fx[k] != null ? comb(v, p.fx[k]) : v), base);
  G.riskRateMult = () => fx('rate', 1, (a, b) => a * b);
  G.backlashUserLoss = () => 0.3 * fx('users', 1, (a, b) => a * b);
  G.backlashDuration = () => 120 * fx('dur', 1, (a, b) => a * b);
  G.calmDuration = () => 300 * fx('calm', 1, (a, b) => a * b);
  const pts0 = G.safetyPoints;
  G.safetyPoints = () => pts0() + fx('pts', 0, (a, b) => a + b);
  G.safetyDeficit = () => Math.max(0, G.safetyNeed() - G.safetyPoints());

  // Risico loopt alleen op als je een veiligheidsteam kúnt hebben, en rustig:
  // bij 5 tekort duurt het ruim 10 minuten tot een backlash. Daarna volgt een rustperiode.
  G.riskPerSec = () => (G.safetyDeficit() > 0 ? (0.03 + 0.02 * G.safetyDeficit()) * G.riskRateMult() : 0);
  G.calmLeft = () => Math.max(0, ((G.S.calmUntil || 0) - Date.now()) / 1000);
  G.safetyActive = () => G.labDone('lab_safety');

  G.safetyTick = dt => {
    const S = G.S;
    if (!G.safetyActive()) { S.risk = 0; return; }
    const def = G.safetyDeficit();
    if (def > 0 && !G.calmLeft()) {
      const before = S.risk;
      S.risk = Math.min(100, S.risk + G.riskPerSec() * dt);
      for (const w of [50, 80]) if (before < w && S.risk >= w && S.riskWarn < w) { S.riskWarn = w; G.emit('safetyWarn', w); }
      if (S.risk >= 100) {
        const inc = G.INCIDENTS[(Math.random() * G.INCIDENTS.length) | 0];
        S.buffs.push({ type: 'prod', mult: 0.5, until: Date.now() + G.backlashDuration() * 1000, name: 'Backlash' });
        for (const a of G.APPS) { const s = S.apps[a.id]; if (s && s.v) s.u *= 1 - G.backlashUserLoss(); }
        S.risk = 0; S.riskWarn = 0; S.backlashes++;
        S.calmUntil = Date.now() + G.calmDuration() * 1000;
        S.lastIncident = inc[0];
        G.emit('backlash', inc);
      }
    } else if (def === 0) {
      S.risk = Math.max(0, S.risk - dt);
      if (S.risk < 50) S.riskWarn = 0;
    }
  };

  // Team en Veiligheid: de safety-engineer staat voortaan alleen in Veiligheid.
  G.TAB_LAB.safety = 'lab_safety';
  G.TAB_UNLOCK.safety = 0;
})();

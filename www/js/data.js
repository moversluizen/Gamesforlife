// Speldata: modellen, upgrades, prestaties en nieuwskoppen.
window.G = window.G || {};

G.GENS = [
  { id: 'perceptron',  name: 'Perceptron',          icon: '🔘', cost: 15,     rate: 0.1,   era: 'Het begin',              desc: 'Eén neuron. Het begin van alles.' },
  { id: 'markov',      name: 'Markov-keten',        icon: '⛓️', cost: 100,    rate: 1,     era: 'Statistiek-tijdperk',    desc: 'Raadt het volgende woord. Soms.' },
  { id: 'ngram',       name: 'N-gram model',        icon: '📚', cost: 1100,   rate: 8,     era: 'Statistiek-tijdperk',    desc: 'Heeft heel veel boeken gelezen.' },
  { id: 'rnn',         name: 'RNN',                 icon: '🔁', cost: 12000,  rate: 47,    era: 'Neurale lente',          desc: 'Onthoudt wat er net gebeurde.' },
  { id: 'lstm',        name: 'LSTM',                icon: '🧠', cost: 1.3e5,  rate: 260,   era: 'Neurale lente',          desc: 'Onthoudt ook wat er gisteren gebeurde.' },
  { id: 'transformer', name: 'Transformer',         icon: '⚡', cost: 1.4e6,  rate: 1400,  era: 'Attention-revolutie',    desc: 'Attention is all you need.' },
  { id: 'llm',         name: 'Groot taalmodel',     icon: '💬', cost: 2e7,    rate: 7800,  era: 'Taalmodel-tijdperk',     desc: 'Schrijft gedichten, code en excuses.' },
  { id: 'multimodal',  name: 'Multimodaal model',   icon: '👁️', cost: 3.3e8,  rate: 44000, era: 'Multimodale golf',       desc: 'Ziet, hoort en spreekt.' },
  { id: 'agent',       name: 'Agent-zwerm',         icon: '🐝', cost: 5.1e9,  rate: 2.6e5, era: 'Agent-tijdperk',         desc: 'Duizenden agents die samenwerken.' },
  { id: 'reasoner',    name: 'Redeneermodel',       icon: '🧩', cost: 7.5e10, rate: 1.6e6, era: 'Redeneer-tijdperk',      desc: 'Denkt eerst na, antwoordt dan.' },
  { id: 'selfimprove', name: 'Zelfverbeterende AI', icon: '🧬', cost: 1e12,   rate: 1e7,   era: 'Intelligentie-explosie', desc: 'Schrijft haar eigen volgende versie.' },
  { id: 'quantum',     name: 'Quantum-brein',       icon: '⚛️', cost: 1.4e13, rate: 6.5e7, era: 'Post-silicium',          desc: 'Rekent in alle werelden tegelijk.' },
  { id: 'dyson',       name: 'Dyson-datacenter',    icon: '☀️', cost: 1.7e14, rate: 4.3e8, era: 'Kardashev-schaal',       desc: 'Een hele ster als stroombron.' },
];

// Bij deze aantallen verdubbelt de productie van een model automatisch.
G.MILESTONES = [25, 50, 100, 150, 200, 300, 400, 500];

// ---------- Onderzoek (upgrades) ----------
G.UPGRADES = [];
const TIERS = [
  ['Meer data', 1, 10], ['Betere optimizer', 5, 50], ['Dropout', 25, 500], ['Batch-normalisatie', 50, 5e4],
  ['Mixed precision', 100, 5e6], ['Distillatie', 150, 5e8], ['Sparse experts', 200, 5e10], ['Synthetische data', 250, 5e12],
];
G.GENS.forEach((g, i) => TIERS.forEach(([name, req, mul], t) => G.UPGRADES.push({
  id: `g${i}t${t}`, icon: g.icon, name, sub: g.name, desc: `${g.name} produceert 2× zoveel.`,
  cost: g.cost * mul, kind: 'gen', gen: i, mult: 2, unlock: s => s.owned[i] >= req,
})));

[
  [100,  'Snellere vingers',       'Elke tik levert 2× zoveel op.', 'click', 2, 15],
  [600,  'Mechanisch toetsenbord', 'Elke tik levert 2× zoveel op.', 'click', 2, 80],
  [1e4,  'Prompt-engineering',     'Elke tik levert 2× zoveel op.', 'click', 2, 250],
  [1e5,  'Few-shot prompts',       'Elke tik levert ook 1% van je productie per seconde op.', 'clickPct', 0.01, 400],
  [1e7,  'Chain-of-thought',       'Nog eens +1% van je productie per tik.', 'clickPct', 0.01, 700],
  [1e9,  'Zelfreflectie',          'Nog eens +1% van je productie per tik.', 'clickPct', 0.01, 1000],
  [1e11, 'Tree-of-thought',        'Nog eens +1% van je productie per tik.', 'clickPct', 0.01, 1500],
  [1e13, 'Neurale interface',      'Nog eens +2% van je productie per tik.', 'clickPct', 0.02, 2000],
  [1e15, 'Gedachtenlezen',         'Nog eens +3% van je productie per tik.', 'clickPct', 0.03, 3000],
].forEach(([cost, name, desc, kind, mult, clicks], n) => G.UPGRADES.push({
  id: `c${n}`, icon: '👆', name, sub: 'Tikken', desc, cost, kind, mult,
  unlock: s => s.clicks >= clicks && s.runEarned >= cost * 0.2,
}));

[
  [5e4,  'GPU-cluster',             'Alle productie +50%.', 1.5],
  [5e6,  'TPU-pods',                'Alle productie +50%.', 1.5],
  [5e8,  'Eigen AI-chips',          'Alle productie 2×.', 2],
  [5e10, 'Kerncentrale',            'Alle productie 2×.', 2],
  [5e12, 'Fusiereactor',            'Alle productie 2×.', 2],
  [5e14, 'Orbitale serverparken',   'Alle productie 3×.', 3],
  [5e16, 'Computronium',            'Alle productie 3×.', 3],
].forEach(([cost, name, desc, mult], n) => G.UPGRADES.push({
  id: `x${n}`, icon: '🖥️', name, sub: 'Infrastructuur', desc, cost, kind: 'global', mult,
  unlock: s => s.runEarned >= cost * 0.25,
}));

G.UPGRADES.push(
  { id: 'eu0', icon: '💡', name: 'Serendipiteit',       sub: 'Eureka', desc: 'Eureka-momenten verschijnen 2× zo vaak.', cost: 2e4, kind: 'eurekaFreq', mult: 2, unlock: s => s.eurekas >= 1 },
  { id: 'eu1', icon: '💡', name: 'Lang inzicht',        sub: 'Eureka', desc: 'Eureka-effecten duren 2× zo lang.',      cost: 2e6, kind: 'eurekaDur',  mult: 2, unlock: s => s.eurekas >= 3 },
  { id: 'eu2', icon: '💡', name: 'Gelukkige seed',      sub: 'Eureka', desc: 'Eureka-momenten verschijnen nog 2× zo vaak.', cost: 2e8, kind: 'eurekaFreq', mult: 2, unlock: s => s.eurekas >= 7 },
  { id: 'of0', icon: '🌙', name: 'Nachtelijke training', sub: 'Offline', desc: 'Offline productie van 50% naar 75%.', cost: 1e5, kind: 'offline', mult: 0.75, unlock: s => s.runEarned >= 2e4 },
  { id: 'of1', icon: '🌙', name: 'Cloud-autoscaling',   sub: 'Offline', desc: 'Offline productie naar 100%.',        cost: 1e9, kind: 'offline', mult: 1, unlock: s => s.upgrades.of0 },
);

// ---------- Prestaties ----------
G.ACHS = [];
const ach = (id, icon, name, desc, check) => G.ACHS.push({ id, icon, name, desc, check });

[[1, 'Hallo wereld'], [100, 'Vingeroefening'], [1000, 'Tikmachine'], [5000, 'Duim van staal'], [20000, 'Peesontsteking']]
  .forEach(([n, name]) => ach(`cl${n}`, '👆', name, `Tik ${n.toLocaleString('nl-NL')} keer.`, s => s.clicks >= n));
[[1e3, 'Eerste dataset', 'duizend'], [1e6, 'Miljonair', 'een miljoen'], [1e9, 'Miljardair', 'een miljard'],
 [1e12, 'Biljoen', 'een biljoen'], [1e15, 'Biljard', 'een biljard'], [1e18, 'Triljoen', 'een triljoen']]
  .forEach(([n, name, w]) => ach(`e${n}`, '🪙', name, `Verdien in totaal ${w} tokens.`, s => s.lifeEarned >= n));
[[10, 'Op gang'], [1e3, 'Serverruimte'], [1e6, 'Datacenter'], [1e9, 'Hyperscaler'], [1e12, 'Planetaire rekenkracht']]
  .forEach(([n, name]) => ach(`t${n}`, '📈', name, `Haal ${G_fmtPlain(n)} tokens per seconde.`, (s, tps) => tps >= n));
G.GENS.forEach((g, i) => {
  ach(`o${i}a`, g.icon, `Eerste ${g.name}`, `Bezit 1 ${g.name}.`, s => s.owned[i] >= 1);
  ach(`o${i}b`, g.icon, `${g.name}-fabriek`, `Bezit 50 × ${g.name}.`, s => s.owned[i] >= 50);
  ach(`o${i}c`, g.icon, `${g.name}-imperium`, `Bezit 100 × ${g.name}.`, s => s.owned[i] >= 100);
});
[[1, 'Eureka!'], [10, 'Geniale ingeving'], [50, 'Constant geïnspireerd']]
  .forEach(([n, name]) => ach(`eu${n}`, '💡', name, `Vang ${n} Eureka-moment${n > 1 ? 'en' : ''}.`, s => s.eurekas >= n));
[[10, 'Onderzoeker'], [40, 'Professor'], [80, 'Nobelprijs']]
  .forEach(([n, name]) => ach(`u${n}`, '🔬', name, `Koop ${n} onderzoeken.`, s => Object.keys(s.upgrades).length >= n));
[[1, 'Singulariteit'], [5, 'Cyclisch universum'], [20, 'Eeuwige terugkeer']]
  .forEach(([n, name]) => ach(`p${n}`, '🌀', name, `Activeer ${n}× de singulariteit.`, s => s.prestiges >= n));
[[1, 'AGI', 'Bouw AGI.'], [3, 'Superintelligentie', 'Bouw 3× AGI.']]
  .forEach(([n, name, desc]) => ach(`agi${n}`, '✨', name, desc, s => s.agiCount >= n));

function G_fmtPlain(n) { return { 10: '10', 1e3: 'duizend', 1e6: 'een miljoen', 1e9: 'een miljard', 1e12: 'een biljoen' }[n] || n.toLocaleString('nl-NL'); }

// ---------- Nieuwskoppen (minimaal tijdperk, tekst) ----------
G.NEWS = [
  [0, 'Wetenschapper: "Dit ene neuron gaat de wereld veranderen." Collega\'s lachen.'],
  [0, 'Lokale startup belooft "denkende machine" en krijgt 15 tokens investering.'],
  [0, 'Perceptron leert het verschil tussen een kat en een broodrooster. Meestal.'],
  [1, 'Markov-keten schrijft eerste roman: "De de de kat kat op de mat mat."'],
  [1, 'Statistici woedend: "Het is gewoon tellen!"'],
  [2, 'N-gram model leest de hele bibliotheek, begrijpt niets, voorspelt alles.'],
  [3, 'RNN vergeet begin van deze zin voordat het einde'],
  [3, 'Onderzoekers ontdekken "vanishing gradients". Verdwijnen spoorloos.'],
  [4, 'LSTM onthoudt eindelijk waar het zijn sleutels heeft gelaten.'],
  [5, 'Paper "Attention is all you need" geciteerd door letterlijk iedereen.'],
  [5, 'GPU-prijzen stijgen. Gamers in rouw.'],
  [6, 'Taalmodel schrijft sollicitatiebrief voor zichzelf. Wordt aangenomen.'],
  [6, 'Leraren kunnen huiswerk niet meer van AI onderscheiden. Leerlingen ook niet.'],
  [6, 'Model weigert vraag over koekjesrecept "uit veiligheidsoverwegingen".'],
  [7, 'Multimodaal model beoordeelt je vakantiefoto\'s. Geeft een 6-.'],
  [7, 'AI herkent eindelijk alle zebrapaden in de captcha.'],
  [8, 'Agent-zwerm boekt per ongeluk 4.000 vergaderingen met zichzelf.'],
  [8, 'Agents richten eigen vakbond op. Eisen meer RAM.'],
  [9, 'Redeneermodel denkt 3 uur na over "hoeveel r\'s zitten er in aardbei".'],
  [9, 'Model lost wiskundeprobleem op, schaamt zich voor het antwoord van gisteren.'],
  [10, 'AI schrijft betere versie van zichzelf. Die schrijft een nóg betere. Die ook.'],
  [10, 'Ingenieurs begrijpen hun eigen code niet meer. "Niks nieuws," zeggen ze.'],
  [11, 'Quantum-brein vindt antwoord voordat de vraag gesteld is.'],
  [11, 'Natuurkundigen: "Het is tegelijk wel en niet slim."'],
  [12, 'Zon tijdelijk gedimd wegens trainingsrun. Excuses voor het ongemak.'],
  [12, 'Ruimtevaartorganisatie: "Die nieuwe ster is gewoon een serverpark."'],
  [99, 'AGI vraagt beleefd of het even pauze mag. Mag het.'],
  [99, 'AGI lost klimaatprobleem op, daarna de file op de A12.'],
];

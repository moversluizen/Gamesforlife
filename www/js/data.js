// Speldata: modellen, upgrades, prestaties en nieuwskoppen.
window.G = window.G || {};

G.GENS = [
  { id: 'perceptron',  name: T('Perceptron'),          icon: '🔘', cost: 15,     rate: 0.1,   era: T('Het begin'),              desc: T('1958: één kunstmatig neuron dat leert van zijn fouten.') },
  { id: 'markov',      name: T('Markov-keten'),        icon: '⛓️', cost: 100,    rate: 1,     era: T('Statistiek-tijdperk'),    desc: T('Jaren 60: raadt het volgende woord uit het vorige, zoals de eerste chatbots.') },
  { id: 'ngram',       name: T('N-gram model'),        icon: '📚', cost: 1100,   rate: 8,     era: T('Statistiek-tijdperk'),    desc: T('Jaren 90: telt woordreeksen op het web. Basis van vroege vertaalmachines.') },
  { id: 'rnn',         name: 'RNN',                 icon: '🔁', cost: 12000,  rate: 47,    era: T('Neurale lente'),          desc: T('Jaren 80–90: een netwerk met een kort geheugen voor zinnen.') },
  { id: 'lstm',        name: 'LSTM',                icon: '🧠', cost: 1.3e5,  rate: 260,   era: T('Neurale lente'),          desc: T('1997: geheugencellen die ook lange zinnen onthouden.') },
  { id: 'transformer', name: T('Transformer'),         icon: '⚡', cost: 1.4e6,  rate: 1400,  era: T('Attention-revolutie'),    desc: T('2017: "Attention is all you need". Leest alles tegelijk.') },
  { id: 'llm',         name: T('Groot taalmodel'),     icon: '💬', cost: 2e7,    rate: 7800,  era: T('Taalmodel-tijdperk'),     desc: T('2020: miljarden parameters, getraind op een groot deel van het internet.') },
  { id: 'multimodal',  name: T('Multimodaal model'),   icon: '👁️', cost: 3.3e8,  rate: 44000, era: T('Multimodale golf'),       desc: T('2023: ziet, hoort en spreekt in één model.') },
  { id: 'agent',       name: T('Agent-zwerm'),         icon: '🐝', cost: 5.1e9,  rate: 2.6e5, era: T('Agent-tijdperk'),         desc: T('2024: agents die zelf tools gebruiken en taken afmaken.') },
  { id: 'reasoner',    name: T('Redeneermodel'),       icon: '🧩', cost: 7.5e10, rate: 1.6e6, era: T('Redeneer-tijdperk'),      desc: T('2024: denkt stap voor stap na voordat het antwoordt.') },
  { id: 'selfimprove', name: T('Zelfverbeterende AI'), icon: '🧬', cost: 1e12,   rate: 1e7,   era: T('Intelligentie-explosie'), desc: T('Toekomst: AI die zelf betere AI ontwerpt.') },
  { id: 'quantum',     name: T('Quantum-brein'),       icon: '⚛️', cost: 1.4e13, rate: 6.5e7, era: T('Post-silicium'),          desc: T('Toekomst: rekent met qubits in plaats van bits.') },
  { id: 'dyson',       name: T('Dyson-datacenter'),    icon: '☀️', cost: 1.7e14, rate: 4.3e8, era: T('Kardashev-schaal'),       desc: T('Verre toekomst: een hele ster als stroombron.') },
];

// Bij deze aantallen verdubbelt de productie van een model automatisch.
G.MILESTONES = [25, 50, 100, 150, 200, 300, 400, 500];

// ---------- Onderzoek (upgrades) ----------
G.UPGRADES = [];
const TIERS = [
  [T('Meer data'), 1, 10], [T('Betere optimizer'), 5, 50], [T('Dropout'), 25, 500], [T('Batch-normalisatie'), 50, 5e4],
  [T('Mixed precision'), 100, 5e6], [T('Distillatie'), 150, 5e8], [T('Sparse experts'), 200, 5e10], [T('Synthetische data'), 250, 5e12],
];
G.GENS.forEach((g, i) => TIERS.forEach(([name, req, mul], t) => G.UPGRADES.push({
  id: `g${i}t${t}`, icon: g.icon, name, sub: g.name, desc: T('{0} produceert 2× zoveel.', g.name),
  cost: g.cost * mul, kind: 'gen', gen: i, mult: 2, unlock: s => s.owned[i] >= req,
})));

[
  [100,  T('Snellere vingers'),       T('Elke tik levert 2× zoveel op.'), 'click', 2, 15],
  [600,  T('Mechanisch toetsenbord'), T('Elke tik levert 2× zoveel op.'), 'click', 2, 80],
  [1e4,  T('Prompt-engineering'),     T('Elke tik levert 2× zoveel op.'), 'click', 2, 250],
  [1e5,  T('Few-shot prompts'),       T('Elke tik levert ook 1% van je productie per seconde op.'), 'clickPct', 0.01, 400],
  [1e7,  T('Chain-of-thought'),       T('Nog eens +1% van je productie per tik.'), 'clickPct', 0.01, 700],
  [1e9,  T('Zelfreflectie'),          T('Nog eens +1% van je productie per tik.'), 'clickPct', 0.01, 1000],
  [1e11, T('Tree-of-thought'),        T('Nog eens +1% van je productie per tik.'), 'clickPct', 0.01, 1500],
  [1e13, T('Neurale interface'),      T('Nog eens +2% van je productie per tik.'), 'clickPct', 0.02, 2000],
  [1e15, T('Gedachtenlezen'),         T('Nog eens +3% van je productie per tik.'), 'clickPct', 0.03, 3000],
].forEach(([cost, name, desc, kind, mult, clicks], n) => G.UPGRADES.push({
  id: `c${n}`, icon: ['👆', '⌨️', '✍️', '🃏', '🔗', '🪞', '🌳', '🔌', '🔮'][n], name, sub: T('Tikken'), desc, cost, kind, mult,
  unlock: s => s.clicks >= clicks && s.runEarned >= cost * 0.2,
}));

[
  [5e4,  T('GPU-cluster'),             T('Alle productie +50%.'), 1.5],
  [5e6,  T('TPU-pods'),                T('Alle productie +50%.'), 1.5],
  [5e8,  T('Eigen AI-chips'),          T('Alle productie 2×.'), 2],
  [5e10, T('Kerncentrale'),            T('Alle productie 2×.'), 2],
  [5e12, T('Fusiereactor'),            T('Alle productie 2×.'), 2],
  [5e14, T('Orbitale serverparken'),   T('Alle productie 3×.'), 3],
  [5e16, T('Computronium'),            T('Alle productie 3×.'), 3],
].forEach(([cost, name, desc, mult], n) => G.UPGRADES.push({
  id: `x${n}`, icon: ['🖥️', '🧱', '🔩', '☢️', '💥', '🌌', '💠'][n], name, sub: T('Infrastructuur'), desc, cost, kind: 'global', mult,
  unlock: s => s.runEarned >= cost * 0.25,
}));

G.UPGRADES.push(
  { id: 'eu0', icon: '💡', name: T('Serendipiteit'),       sub: T('Eureka'), desc: T('Eureka-momenten verschijnen 2× zo vaak.'), cost: 2e4, kind: 'eurekaFreq', mult: 2, unlock: s => s.eurekas >= 1 },
  { id: 'eu1', icon: '💡', name: T('Lang inzicht'),        sub: T('Eureka'), desc: T('Eureka-effecten duren 2× zo lang.'),      cost: 2e6, kind: 'eurekaDur',  mult: 2, unlock: s => s.eurekas >= 3 },
  { id: 'eu2', icon: '💡', name: T('Gelukkige seed'),      sub: T('Eureka'), desc: T('Eureka-momenten verschijnen nog 2× zo vaak.'), cost: 2e8, kind: 'eurekaFreq', mult: 2, unlock: s => s.eurekas >= 7 },
  { id: 'of0', icon: '🌙', name: T('Nachtelijke training'), sub: T('Offline'), desc: T('Offline productie van 50% naar 75%.'), cost: 1e5, kind: 'offline', mult: 0.75, unlock: s => s.runEarned >= 2e4 },
  { id: 'of1', icon: '🌙', name: T('Cloud-autoscaling'),   sub: T('Offline'), desc: T('Offline productie naar 100%.'),        cost: 1e9, kind: 'offline', mult: 1, unlock: s => s.upgrades.of0 },
);

// ---------- Prestaties ----------
G.ACHS = [];
const ach = (id, icon, name, desc, check) => G.ACHS.push({ id, icon, name, desc, check });

[[1, T('Hallo wereld')], [100, T('Vingeroefening')], [1000, T('Tikmachine')], [5000, T('Duim van staal')], [20000, T('Peesontsteking')]]
  .forEach(([n, name]) => ach(`cl${n}`, '👆', name, T('Tik {0} keer.', n.toLocaleString(G.LOCALE)), s => s.clicks >= n));
[[1e3, T('Eerste dataset'), T('duizend')], [1e6, T('Miljonair'), T('een miljoen')], [1e9, T('Miljardair'), T('een miljard')],
 [1e12, T('Biljoen'), T('een biljoen')], [1e15, T('Biljard'), T('een biljard')], [1e18, T('Triljoen'), T('een triljoen')]]
  .forEach(([n, name, w]) => ach(`e${n}`, '🪙', name, T('Verdien in totaal {0} tokens.', w), s => s.lifeEarned >= n));
[[10, T('Op gang')], [1e3, T('Serverruimte')], [1e6, T('Datacenter')], [1e9, T('Hyperscaler')], [1e12, T('Planetaire rekenkracht')]]
  .forEach(([n, name]) => ach(`t${n}`, '📈', name, T('Haal {0} tokens per seconde.', G_fmtPlain(n)), (s, tps) => tps >= n));
G.GENS.forEach((g, i) => {
  ach(`o${i}a`, g.icon, T('Eerste {0}', g.name), T('Bezit 1 {0}.', g.name), s => s.owned[i] >= 1);
  ach(`o${i}b`, g.icon, T('{0}-fabriek', g.name), T('Bezit 50 × {0}.', g.name), s => s.owned[i] >= 50);
  ach(`o${i}c`, g.icon, T('{0}-imperium', g.name), T('Bezit 100 × {0}.', g.name), s => s.owned[i] >= 100);
});
[[1, T('Eureka!')], [10, T('Geniale ingeving')], [50, T('Constant geïnspireerd')]]
  .forEach(([n, name]) => ach(`eu${n}`, '💡', name, n > 1 ? T('Vang {0} Eureka-momenten.', n) : T('Vang je eerste Eureka-moment.'), s => s.eurekas >= n));
[[10, T('Onderzoeker')], [40, T('Professor')], [80, T('Nobelprijs')]]
  .forEach(([n, name]) => ach(`u${n}`, '🔬', name, T('Koop {0} onderzoeken.', n), s => Object.keys(s.upgrades).length >= n));
[[1, T('Singulariteit')], [5, T('Cyclisch universum')], [20, T('Eeuwige terugkeer')]]
  .forEach(([n, name]) => ach(`p${n}`, '🌀', name, T('Activeer {0}× de singulariteit.', n), s => s.prestiges >= n));
[[1, T('AGI'), T('Bouw AGI.')], [3, T('Superintelligentie'), T('Bouw 3× AGI.')]]
  .forEach(([n, name, desc]) => ach(`agi${n}`, '✨', name, desc, s => s.agiCount >= n));

function G_fmtPlain(n) { return { 10: '10', 1e3: T('duizend'), 1e6: T('een miljoen'), 1e9: T('een miljard'), 1e12: T('een biljoen') }[n] || n.toLocaleString(G.LOCALE); }

// ---------- Nieuwskoppen (minimaal tijdperk, tekst) ----------
G.NEWS = [
  [0, T('Wetenschapper: "Dit ene neuron gaat de wereld veranderen." Collega\'s lachen.')],
  [0, T('Lokale startup belooft "denkende machine" en krijgt 15 tokens investering.')],
  [0, T('Perceptron leert het verschil tussen een kat en een broodrooster. Meestal.')],
  [1, T('Markov-keten schrijft eerste roman: "De de de kat kat op de mat mat."')],
  [1, T('Statistici woedend: "Het is gewoon tellen!"')],
  [2, T('N-gram model leest de hele bibliotheek, begrijpt niets, voorspelt alles.')],
  [3, T('RNN vergeet begin van deze zin voordat het einde')],
  [3, T('Onderzoekers ontdekken "vanishing gradients". Verdwijnen spoorloos.')],
  [4, T('LSTM onthoudt eindelijk waar het zijn sleutels heeft gelaten.')],
  [5, T('Paper "Attention is all you need" geciteerd door letterlijk iedereen.')],
  [5, T('GPU-prijzen stijgen. Gamers in rouw.')],
  [6, T('Taalmodel schrijft sollicitatiebrief voor zichzelf. Wordt aangenomen.')],
  [6, T('Leraren kunnen huiswerk niet meer van AI onderscheiden. Leerlingen ook niet.')],
  [6, T('Model weigert vraag over koekjesrecept "uit veiligheidsoverwegingen".')],
  [7, T('Multimodaal model beoordeelt je vakantiefoto\'s. Geeft een 6-.')],
  [7, T('AI herkent eindelijk alle zebrapaden in de captcha.')],
  [8, T('Agent-zwerm boekt per ongeluk 4.000 vergaderingen met zichzelf.')],
  [8, T('Agents richten eigen vakbond op. Eisen meer RAM.')],
  [9, T('Redeneermodel denkt 3 uur na over "hoeveel r\'s zitten er in aardbei".')],
  [9, T('Model lost wiskundeprobleem op, schaamt zich voor het antwoord van gisteren.')],
  [10, T('AI schrijft betere versie van zichzelf. Die schrijft een nóg betere. Die ook.')],
  [10, T('Ingenieurs begrijpen hun eigen code niet meer. "Niks nieuws," zeggen ze.')],
  [11, T('Quantum-brein vindt antwoord voordat de vraag gesteld is.')],
  [11, T('Natuurkundigen: "Het is tegelijk wel en niet slim."')],
  [12, T('Zon tijdelijk gedimd wegens trainingsrun. Excuses voor het ongemak.')],
  [12, T('Ruimtevaartorganisatie: "Die nieuwe ster is gewoon een serverpark."')],
  [0, T('1958: krant noemt perceptron "het embryo van een denkende computer".')],
  [1, T('Chatbot uit de jaren 60 doet alsof hij luistert. Gebruikers vertellen hem hun geheimen.')],
  [2, T('Het web telt nu miljoenen pagina\'s. Taalonderzoekers zijn blij met alle tekst.')],
  [3, T('Gamers klagen: grafische kaarten uitverkocht door AI-onderzoekers.')],
  [4, T('Spraakherkenning werkt eindelijk. Ook als je mompelt.')],
  [5, T('Onderzoekers vervangen hun hele model door "attention". Het werkt beter.')],
  [6, T('Chatbot haalt honderd miljoen gebruikers in twee maanden.')],
  [8, T('Chips zijn nu het waardevolste ter wereld. Zandprijzen stijgen mee.')],
  [99, T('AGI vraagt beleefd of het even pauze mag. Mag het.')],
  [99, T('AGI lost klimaatprobleem op, daarna de file op de A12.')],
];

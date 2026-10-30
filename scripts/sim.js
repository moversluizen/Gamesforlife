// Balans-simulator: speelt het spel zonder scherm met een "actieve speler" en
// meet wanneer er iets nieuws vrijkomt. Gebruik: node scripts/sim.js [uren] [--log]
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HOURS = parseFloat(process.argv[2] || '6');
const LOG = process.argv.includes('--log');
const STAT_EVERY = process.argv.includes('--fine') ? 300 : process.argv.includes('--minute') ? 60 : 1800;

// ---------- spelcode laden met een nepklok ----------
let T = Date.UTC(2026, 0, 1);
class FakeDate extends Date {
  constructor(...a) { super(...(a.length ? a : [T])); }
  static now() { return T; }
}
const ctx = { console, Math, JSON, Object, Array, Number, String, Promise, setTimeout: () => 0, Date: FakeDate };
ctx.window = ctx;
ctx.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(ctx);
for (const f of ['data.js', 'engine.js', 'industry.js', 'research.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
}
const G = ctx.G;
G.S = G.newState();
G.S.lastTick = T;
G.S.buyMode = 1;
G.recalc();

// ---------- logboek ----------
const events = [];
const t0 = T;
const mins = () => (T - t0) / 60000;
function ev(kind, text, major = true) {
  events.push({ t: mins(), kind, text, major });
  if (LOG) console.log(`${mins().toFixed(1).padStart(6)} min  ${major ? '★' : ' '} ${kind.padEnd(8)} ${text}`);
}
G.on('chipDone', c => ev('chip', c.name));
G.on('appLive', a => ev('app', a.name));
G.on('backlash', () => ev('backlash', 'backlash!'));

// ---------- speler ----------
const income = () => G.tps() + tapsPerSec() * G.clickValue() * 1.5;
const tapsPerSec = () => (mins() < 30 ? 3 : mins() < 120 ? 1.5 : 0.5);
const affordableWithin = (cost, secs) => G.S.tokens >= cost && cost <= Math.max(income() * secs, 50);
let lastHelper = {}, nextEureka = 150;

function genGain(i) {
  const S = G.S, owned = S.owned[i];
  const next = G.nextMilestone(owned);
  let d = G.genUnitRate(i);
  if (next === owned + 1) d += G.genRate(i) + G.genUnitRate(i);
  return d;
}
function upgGain(u) {
  const tps = G.tps(), taps = tapsPerSec() * 1.5;
  if (u.kind === 'gen') return G.genRate(u.gen) * (u.mult - 1);
  if (u.kind === 'global') return tps * (u.mult - 1);
  if (u.kind === 'click') return taps * G.clickValue() * (u.mult - 1);
  if (u.kind === 'clickPct') return taps * tps * u.mult;
  if (u.kind === 'safety') return G.safetyDeficit() > 0 ? 1e99 : 0;
  if (u.kind === 'chain' || u.kind === 'slots' || u.kind === 'app') return tps * 0.15;
  return tps * 0.02;
}

const seen = { gen: new Set(), tech: new Set() };
function act() {
  const S = G.S, inc = income();

  // opdrachten van Ada
  if (G.questNow()) { const q = G.questNow(), r = G.claimQuest(); if (r && LOG) console.log(`${mins().toFixed(1).padStart(6)} min    opdracht  ${q.text} +${G.fmt(r)}`); }

  // lab, hoofdlijnen van de bomen: kopen zodra ze betaalbaar zijn binnen ~2 min inkomen
  for (const [tree, rows] of Object.entries(G.TREES)) {
    for (const r of rows) for (const u of [r.spine, r.left, r.right]) {
      if (!u || !G.techAvailable(u)) continue;
      const limit = u.kind === 'lab' ? 90 : u.kind === 'tech' ? 150 : 240;
      if (affordableWithin(u.cost, limit) && G.buyTech(u.id)) ev(u.kind === 'lab' ? 'lab' : 'onderzoek', u.name, u.kind !== 'upgrade' && !!u.unlocks);
    }
  }

  // veiligheid eerst als je achterloopt
  if (G.safetyDeficit() > 0) {
    const h = G.HELPERS.find(x => x.id === 'safety');
    if (G.helperUnlocked(h) && S.tokens >= G.helperCost(h)) G.hire(h);
    for (const u of G.availableUpgrades()) if (u.kind === 'safety' && S.tokens >= u.cost) G.buyUpgrade(u.id);
  }

  // modellen en losse upgrades: beste terugverdientijd
  const opts = [];
  G.GENS.forEach((g, i) => {
    if (!G.isRevealed(i) || G.genNeedsTech(i)) return;
    const c = G.costOf(i, 1);
    opts.push({ c, gain: genGain(i), buy: () => { if (G.buyGen(i)) { if (!seen.gen.has(i)) { seen.gen.add(i); ev('model', g.name); } } } });
  });
  for (const u of G.availableUpgrades()) opts.push({ c: u.cost, gain: upgGain(u), buy: () => G.buyUpgrade(u.id) });
  for (const o of opts) o.score = o.c / Math.max(o.gain, 1e-9) + o.c / Math.max(inc, 1e-9);
  opts.sort((a, b) => a.score - b.score);
  for (let k = 0; k < 20; k++) {
    const best = opts[0];
    if (!best || S.tokens < best.c) break;
    best.buy();
    break;
  }

  // supply chain
  if (G.tabUnlocked('chips')) {
    for (let i = 0; i < 4; i++) if (!S.chain[i] && affordableWithin(G.chainCost(i), 120)) G.buyChain(i);
    if (!S.chain[4] && affordableWithin(G.chainCost(4), 120)) G.buyChain(4);
    if (S.chain.every(x => x > 0)) {
      const nx = G.nextChip();
      const target = nx && S.chain[2] < nx.litho && G.techDone('tc' + (S.chipGen + 1)) ? 2 : G.chipsFull() ? 4 : G.bottleneck();
      if (affordableWithin(G.chainCost(target), 60)) G.buyChain(target);
    }
    if (G.canStartRnd() && affordableWithin(G.nextChip().cost, 180)) G.startRnd();
    if (S.rnd) G.boostRnd();
  }

  // apps
  if (G.tabUnlocked('apps')) {
    for (const a of G.APPS) {
      const s = G.app(a.id);
      if (G.appUnlocked(a) && !s.v && !s.b && affordableWithin(G.appCost(a), 150)) G.buildApp(a);
      else if (s.v && s.u >= G.appCap(a) * 0.8 && affordableWithin(G.appCost(a), 90)) G.buildApp(a);
      if (s.v) G.campaign(a);
    }
  }

  // helpers
  if (G.tabUnlocked('team')) {
    for (const h of G.HELPERS) {
      if (!G.helperUnlocked(h) || G.hl(h.id) >= h.max) continue;
      if (affordableWithin(G.helperCost(h), h.id === 'intern' ? 60 : 45) && G.hire(h)) {
        if (!lastHelper[h.id]) { lastHelper[h.id] = 1; ev('helper', h.name); }
      }
    }
  }

  // AGI en singulariteit
  if (G.agiUnlocked() && S.tokens >= G.agiCost()) { G.buyAGI(); ev('AGI', `AGI #${S.agiCount}`); }
  const pend = G.pendingInsights();
  if (!process.argv.includes('--no-prestige') && G.labDone('lab_sing') && pend >= Math.max(15, S.insights * 1.5) && mins() > 60) {
    G.prestige(); ev('prestige', `singulariteit, inzichten ${G.S.insights}`);
    G.S.buyMode = 1; seen.gen.clear();
  }
}

// ---------- spelen ----------
const steps = HOURS * 3600;
let tapAcc = 0;
for (let s = 0; s < steps; s++) {
  T += 1000;
  G.tick();
  tapAcc += tapsPerSec();
  while (tapAcc >= 1) { tapAcc--; const v = G.clickValue() * 1.5; G.earn(v); G.S.clicks++; }
  if (s % 2 === 0) act();
  if (process.argv.includes('--stats') && s % STAT_EVERY === 0) {
    const S = G.S, top = G.topModel();
    console.log(`${mins().toFixed(0).padStart(4)}m tps ${G.fmt(G.tps()).padStart(9)} | top ${top} owned ${S.owned.slice(0, top + 1).join('/')} | mijlpaal-top x${2 ** G.milestoneLevel(S.owned[Math.max(0, top)])} | global x${G.fmt(G.mods.global)} | gen-upg x${G.fmt(G.mods.gen[Math.max(0, top)])} | chips x${G.computeBonus().toFixed(1)} data x${G.dataBonus().toFixed(1)} perm x${G.mods.perm.toFixed(2)} | klik ${G.fmt(G.clickValue())}`);
  }
  if (mins() >= nextEureka / 60) { nextEureka += 150 + Math.random() * 60; G.claimEureka(); G.S.eurekas++; }
}

// ---------- rapport ----------
const major = events.filter(e => e.major);
console.log(`\nSimulatie van ${HOURS} uur · ${major.length} nieuwe dingen`);
const bands = [[0, 10], [10, 30], [30, 60], [60, 120], [120, 240], [240, 480]];
for (const [a, b] of bands) {
  if (a >= HOURS * 60) break;
  const n = major.filter(e => e.t >= a && e.t < b);
  const gaps = n.slice(1).map((e, k) => e.t - n[k].t);
  const maxGap = gaps.length ? Math.max(...gaps) : 0;
  const burst = n.length ? Math.max(...n.map(e => n.filter(x => x.t >= e.t && x.t < e.t + 1).length)) : 0;
  console.log(`${String(a).padStart(3)}-${String(b).padEnd(3)} min: ${String(n.length).padStart(3)} nieuw · gem. elke ${(n.length ? (Math.min(b, HOURS * 60) - a) / n.length : 0).toFixed(1)} min · langste pauze ${maxGap.toFixed(1)} min · max ${burst} binnen 1 min`);
}
const firsts = ['model', 'lab', 'chip', 'app', 'helper', 'AGI', 'prestige'];
for (const k of firsts) {
  const list = events.filter(e => e.kind === k).map(e => `${e.text} ${e.t.toFixed(0)}m`);
  if (list.length) console.log(`${k.padEnd(8)}: ${list.join(' · ')}`);
}
console.log(`eind: tokens/s ${G.fmt(G.tps())}, totaal ${G.fmt(G.S.lifeEarned)}, AGI ${G.S.agiCount}, singulariteiten ${G.S.prestiges}`);

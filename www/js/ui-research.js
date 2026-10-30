// Onderzoeksscherm: drie bomen (modellen, chips, apps) en de losse verbeteringen.
(function () {
  const G = window.G;
  const $ = id => document.getElementById(id);
  let seg = 'lab', lastKey = '', flashId = null;

  // Onderzoek in dezelfde opbouw als Chips en Team: overzicht bovenaan, daaronder kaarten.
  // Eén tik op een kaart onderzoekt meteen.
  const nodesOf = tree => G.TREES[tree].flatMap(r => [r.spine, r.left, r.right].filter(Boolean));
  function techCard(u, state) {
    const spine = u.kind === 'tech' || u.kind === 'lab';
    const eff = spine ? u.unlocks : u.desc;
    const par = u.parent ? G.techById(u.parent) : null;
    if (state === 'locked') return `<div class="gen locked-h res-card" data-id="${u.id}">
      <div class="gicon"><span>${u.icon}</span></div>
      <div class="ginfo"><div class="gname">${u.name}</div><div class="grate">${eff}</div>
        <div class="mlabel">Eerst: ${par ? par.name : ''}</div></div><span></span></div>`;
    return `<div class="gen res-card" data-act="tech" data-id="${u.id}">
      <div class="gicon"><span>${u.icon}</span></div>
      <div class="ginfo"><div class="gname">${u.name}</div>
        <div class="grate">${eff}</div></div>
      <button class="gbuy"><span class="q">onderzoeken</span><span class="c">${G.fmt(u.cost)}</span></button></div>`;
  }

  function renderTree() {
    const rows = G.TREES[seg], all = nodesOf(seg);
    const st = u => (G.techDone(u.id) ? 'done' : G.techAvailable(u) ? 'avail' : 'locked');
    const key = seg + '|' + all.map(st).join(',');
    if (key === lastKey) return;
    lastKey = key;
    const avail = all.filter(u => st(u) === 'avail').sort((a, b) => a.cost - b.cost);
    const locked = all.filter(u => st(u) === 'locked').sort((a, b) => a.cost - b.cost).slice(0, 3);
    const done = all.filter(u => st(u) === 'done');
    const next = rows.find(r => !G.techDone(r.spine.id));
    $('treeBody').innerHTML = `
      <div class="ind-card">
        <div class="stats3">
          <div><small>Onderzocht</small><b>${done.length} / ${all.length}</b></div>
          <div><small>Nu mogelijk</small><b>${avail.length}</b></div>
          <div><small>Volgende stap</small><b class="ellip">${next ? next.spine.name : 'Alles klaar'}</b></div>
        </div>
        <div class="bar"><i style="width:${done.length / all.length * 100}%"></i></div>
        ${next ? '' : '<p class="muted">Deze boom is helemaal onderzocht.</p>'}
      </div>
      ${avail.length ? `<div class="subhead">Nu te onderzoeken</div>${avail.map(u => techCard(u, 'avail')).join('')}` : ''}
      ${locked.length ? `<div class="subhead">Daarna</div>${locked.map(u => techCard(u, 'locked')).join('')}` : ''}
      ${done.length ? `<div class="subhead">Onderzocht</div><p class="done-list">${done.map(u => u.name).join(' · ')}</p>` : ''}`;
  }

  // Stipjes alleen voor iets nieuws: een afdeling of hoofdlijn die je nu kunt onderzoeken (geen boosts).
  const spineReady = tree => G.TREES[tree].some(r => G.techAvailable(r.spine) && G.S.tokens >= r.spine.cost);
  function dots() {
    $('dotResearch').classList.toggle('show', ['lab', 'models', 'chips', 'apps'].some(spineReady));
    for (const b of document.querySelectorAll('#resSeg button')) b.classList.toggle('dot-on', b.dataset.r !== 'upg' && spineReady(b.dataset.r));
  }

  function update() {
    const list = seg === 'upg';
    $('treeBody').classList.toggle('hidden', list);
    $('upgList').classList.toggle('hidden', !list);
    let done, total;
    if (list) {
      const own = G.UPGRADES.filter(u => !u.tree);
      done = own.filter(u => G.S.upgrades[u.id]).length; total = own.length;
    } else {
      renderTree();
      for (const b of $('treeBody').querySelectorAll('[data-act="tech"]')) b.classList.toggle('can', G.S.tokens >= G.techById(b.dataset.id).cost);
      [done, total] = G.treeProgress(seg);
    }
    $('upgSum').classList.toggle('hidden', !list);
    $('researchCount').textContent = `${done} / ${total}`;
    if (list) {
      const rows = [...$('upgList').querySelectorAll('.upg')].map(r => G.techById(r.dataset.id));
      $('upgAvail').textContent = rows.length;
      $('upgNext').textContent = rows.length ? G.fmt(Math.min(...rows.map(u => u.cost))) : '–';
    }
    $('researchBar').style.width = (done / total * 100) + '%';
    if (flashId) {
      const el = $('treeBody').querySelector(`[data-id="${flashId}"]`);
      flashId = null;
      if (el) {
        el.scrollIntoView({ block: 'center' });
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 1800);
      }
    }
  }

  function setSeg(s) {
    seg = s;
    lastKey = '';
    document.querySelectorAll('#resSeg button').forEach(b => b.classList.toggle('on', b.dataset.r === s));
  }
  document.querySelectorAll('#resSeg button').forEach(b => b.addEventListener('click', () => { G.haptic(); setSeg(b.dataset.r); update(); }));

  function buy(u) {
    if (G.buyTech(u.id)) {
      G.sfx.upgrade(); G.haptic('MEDIUM'); G.fx.wave();
      G.ui.toast('🔬', `${u.name} onderzocht`, u.kind === 'tech' ? u.unlocks : u.desc);
    } else {
      G.sfx.error();
      G.ui.toast('🪙', 'Te weinig tokens', `Nodig: ${G.fmt(u.cost)}`);
    }
    G.uiRefresh(true);
  }

  $('treeBody').addEventListener('click', e => {
    const card = e.target.closest('[data-act="tech"]');
    if (card) { buy(G.techById(card.dataset.id)); return; }
  });

  G.uiRes = {
    update, dots,
    // Spring naar een knoop in een boom, bijvoorbeeld vanaf een model dat op onderzoek wacht.
    open(tree, id) {
      setSeg(tree);
      flashId = id || null;
      G.ui.switchTab('research');
    },
  };
})();

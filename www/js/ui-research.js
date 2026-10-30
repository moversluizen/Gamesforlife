// Onderzoeksscherm: drie bomen (modellen, chips, apps) en de losse verbeteringen.
(function () {
  const G = window.G;
  const $ = id => document.getElementById(id);
  const NAMES = { lab: 'Je lab: elke afdeling opent iets nieuws', models: 'Onderzoeksboom modellen', chips: 'Onderzoeksboom chips', apps: 'Onderzoeksboom apps', upg: 'Losse verbeteringen' };
  let seg = 'lab', lastKey = '', flashId = null;

  function nodeHtml(u, side) {
    if (!u) return `<div class="tcell ${side}"></div>`;
    const st = G.techDone(u.id) ? 'done' : G.techAvailable(u) ? 'avail' : 'locked';
    return `<div class="tcell ${side}"><button class="tnode ${st}${u.kind === 'tech' ? ' spine' : ''}" data-id="${u.id}">
      <span class="ti">${u.icon}</span><span class="tn">${u.name}</span>
      <span class="tc">${st === 'done' ? '✓ onderzocht' : st === 'avail' ? G.fmt(u.cost) : '🔒'}</span></button></div>`;
  }

  function renderTree() {
    const rows = G.TREES[seg];
    const state = u => (u ? (G.techDone(u.id) ? 2 : G.techAvailable(u) ? 1 : 0) : '-');
    const key = seg + '|' + rows.map(r => '' + state(r.left) + state(r.spine) + state(r.right)).join(',');
    if (key === lastKey) return;
    lastKey = key;
    $('treeBody').innerHTML = `<div class="tree tree-${seg}">${rows.map(r => {
      const linked = !r.spine.parent || G.techDone(r.spine.parent);
      return `<div class="trow${linked ? ' linked' : ''}${G.techDone(r.spine.id) ? ' done' : ''}${r.left ? ' has-l' : ''}${r.right ? ' has-r' : ''}">
        ${nodeHtml(r.left, 'l')}${nodeHtml(r.spine, 'c')}${nodeHtml(r.right, 'r')}
        <span class="tunlock">${r.spine.unlocks}</span></div>`;
    }).join('')}</div>`;
  }

  function dots() {
    const any = !!G.resListAffordable || ['lab', 'models', 'chips', 'apps'].some(G.treeHasAffordable);
    $('dotResearch').classList.toggle('show', any);
    for (const b of document.querySelectorAll('#resSeg button')) {
      const r = b.dataset.r;
      b.classList.toggle('dot-on', r === 'upg' ? !!G.resListAffordable : G.treeHasAffordable(r));
    }
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
      for (const b of $('treeBody').querySelectorAll('.tnode.avail')) b.classList.toggle('can', G.S.tokens >= G.techById(b.dataset.id).cost);
      [done, total] = G.treeProgress(seg);
    }
    $('resTitle').textContent = NAMES[seg];
    $('researchCount').textContent = `${done} / ${total}`;
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
    const b = e.target.closest('.tnode');
    if (!b) return;
    const u = G.techById(b.dataset.id), done = G.techDone(u.id), avail = G.techAvailable(u);
    const par = u.parent ? G.techById(u.parent) : null;
    let body = u.kind === 'tech' ? `${u.desc}<br><br><b>${u.unlocks}</b>` : `<b>${u.desc}</b>`;
    if (!done && !avail && par) body += `<br><br>🔒 Eerst onderzoeken: ${par.icon} ${par.name}`;
    const buttons = [{ label: done || !avail ? 'Sluiten' : 'Annuleren' }];
    if (!done && avail) buttons.push({ label: `Onderzoek · ${G.fmt(u.cost)}`, cls: 'primary', onClick: () => buy(u) });
    G.ui.modal(u.icon, u.name + (done ? ' ✓' : ''), body, buttons);
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

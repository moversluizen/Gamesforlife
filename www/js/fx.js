// Visuele effecten (neuraal netwerk op de achtergrond, deeltjes), geluid en trillen.
(function () {
  const G = window.G;

  // ---------- canvas ----------
  let cv, ctx, W = 0, H = 0, dpr = 1;
  const nodes = [], pulses = [], parts = [];
  let hue = 200, activity = 0.1, targetNodes = 26;

  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addNode() {
    nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, r: 1.2 + Math.random() * 1.8, p: Math.random() * 6.28 });
  }

  G.fx = {
    init(canvas) {
      cv = canvas; ctx = cv.getContext('2d');
      resize();
      if (window.ResizeObserver) new ResizeObserver(resize).observe(cv); else window.addEventListener('resize', resize);
      for (let i = 0; i < targetNodes; i++) addNode();
    },
    setHue(h) { hue = h; },
    // 0..1, hoe druk het netwerk is
    setActivity(a, nodeCount) { activity = a; targetNodes = nodeCount; },
    burst(x, y, n = 10, h = hue) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 260;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6 + Math.random() * 0.4, max: 1, h: h + (Math.random() - 0.5) * 40, s: 1.5 + Math.random() * 2 });
      }
      if (parts.length > 400) parts.splice(0, parts.length - 400);
    },
    // Laat een golf van signalen door het netwerk lopen
    wave() { for (let i = 0; i < 6; i++) spawnPulse(); },
    frame(dt, t) {
      if (!ctx || !W) return;
      while (nodes.length < targetNodes) addNode();
      if (nodes.length > targetNodes + 5) nodes.length = targetNodes;

      ctx.clearRect(0, 0, W, H);
      const D = Math.min(140, Math.max(90, Math.sqrt(W * H / nodes.length) * 1.4));
      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < D * D) {
            ctx.strokeStyle = `hsla(${hue}, 90%, 65%, ${0.18 * (1 - Math.sqrt(d2) / D)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `hsla(${hue}, 100%, 75%, ${0.35 + 0.35 * Math.sin(t / 700 + n.p)})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill();
      }

      if (Math.random() < activity * 0.6) spawnPulse(D);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += dt * p.sp;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, `hsla(${hue + 30}, 100%, 85%, .95)`); g.addColorStop(1, `hsla(${hue + 30}, 100%, 60%, 0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.283); ctx.fill();
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy = p.vy * 0.94 + 30 * dt;
        ctx.fillStyle = `hsla(${p.h}, 100%, 70%, ${Math.min(1, p.life * 1.6)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };

  function spawnPulse(D = 120) {
    if (nodes.length < 2 || pulses.length > 60) return;
    const a = nodes[(Math.random() * nodes.length) | 0];
    let best = null, bd = Infinity;
    for (const b of nodes) {
      if (b === a) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < D && d < bd && Math.random() < 0.7) { best = b; bd = d; }
    }
    if (best) pulses.push({ a, b: best, t: 0, sp: 1.2 + Math.random() * 1.5 });
  }

  // ---------- geluid (gesynthetiseerd, geen bestanden nodig) ----------
  let ac = null;
  function tone(freq, dur, type = 'sine', vol = 0.08, slide = 0) {
    if (!G.S.settings.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  G.sfx = {
    // de toon stijgt mee met je flow
    tap(flow = 0) { tone(420 + flow * 520 + Math.random() * 90, 0.07, 'triangle', 0.05, 1.6); },
    buy() { tone(520, 0.08, 'sine', 0.07); setTimeout(() => tone(780, 0.12, 'sine', 0.06), 60); },
    milestone() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.07), i * 70)); },
    upgrade() { tone(660, 0.1, 'square', 0.03); setTimeout(() => tone(990, 0.16, 'square', 0.03), 80); },
    eureka() { [880, 1175, 1568, 2093].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sine', 0.06), i * 60)); },
    achievement() { [784, 988, 1175].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.06), i * 90)); },
    error() { tone(180, 0.12, 'sawtooth', 0.03, 0.8); },
    big() { [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.5, 'triangle', 0.06), i * 110)); },
  };

  // ---------- achtergrondmuziek: gegenereerd met WebAudio, geen bestanden nodig ----------
  // Rustige sci-fi-ambient: zwevende akkoorden, een zachte baslijn, een arpeggio met echo
  // en af en toe een "data-bel". Hoe verder in het verhaal, hoe helderder en drukker.
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const PROG = [
    { bass: 45, pad: [57, 60, 64, 67, 71] }, // Am9
    { bass: 41, pad: [53, 57, 60, 64, 67] }, // Fmaj9
    { bass: 48, pad: [52, 55, 59, 62, 67] }, // Cmaj7/E
    { bass: 43, pad: [55, 59, 62, 64, 69] }, // G6/9
  ];
  const PROG_AGI = [
    { bass: 48, pad: [60, 64, 67, 71, 74] }, // Cmaj9
    { bass: 45, pad: [57, 60, 64, 67, 71] }, // Am9
    { bass: 41, pad: [57, 60, 64, 65, 69] }, // Fmaj7
    { bass: 43, pad: [59, 62, 67, 69, 74] }, // G6/9
  ];
  const ARP = [0, 2, 1, 3, 2, 4, 3, 1];

  // Maakt de muziek voor een (live of offline) AudioContext; schedule(t) plant noten tot tijd t.
  G.createMusic = (ctx, dest) => {
    const out = ctx.createGain();
    out.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    out.connect(comp).connect(dest);
    // galm uit gegenereerde ruis
    const len = Math.floor(ctx.sampleRate * 3.2), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const rev = ctx.createConvolver(); rev.buffer = ir;
    const revOut = ctx.createGain(); revOut.gain.value = 0.55; rev.connect(revOut).connect(out);
    const dry = ctx.createGain(); dry.gain.value = 0.6; dry.connect(out); dry.connect(rev);
    // echo voor het arpeggio
    const beat = 60 / 78, eighth = beat / 2;
    const delay = ctx.createDelay(2); delay.delayTime.value = eighth * 3;
    const fb = ctx.createGain(); fb.gain.value = 0.38;
    const dTone = ctx.createBiquadFilter(); dTone.type = 'lowpass'; dTone.frequency.value = 2400;
    delay.connect(dTone).connect(fb).connect(delay); dTone.connect(rev); dTone.connect(out);
    // akkoorden door een langzaam ademend filter
    const padF = ctx.createBiquadFilter(); padF.type = 'lowpass'; padF.Q.value = 0.8; padF.frequency.value = 800; padF.connect(dry);
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
    lfo.frequency.value = 0.06; lfoG.gain.value = 350; lfo.connect(lfoG).connect(padF.frequency); lfo.start();

    const voice = (freq, t, dur, type, vol, to, attack = 0.01, release = 0.3, detune = 0) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq; o.detune.value = detune;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.setTargetAtTime(0.0001, t + dur, release);
      o.connect(g).connect(to);
      o.start(t); o.stop(t + dur + release * 6);
    };

    let step = 0, next = ctx.currentTime + 0.1, level = 0, agi = false;
    const m = {
      out,
      setLevel(chapter, isAgi) {
        level = chapter; agi = isAgi;
        padF.frequency.setTargetAtTime(650 + chapter * 140 + (isAgi ? 600 : 0), ctx.currentTime, 2);
      },
      schedule(until) {
        while (next < until) {
          const t = next, prog = agi ? PROG_AGI : PROG, chord = prog[Math.floor(step / 16) % prog.length];
          if (step % 16 === 0) {
            for (const n of chord.pad) {
              voice(mtof(n), t, eighth * 15, 'sawtooth', 0.011, padF, 1.8, 1.6, -7);
              voice(mtof(n), t, eighth * 15, 'sawtooth', 0.011, padF, 1.8, 1.6, 7);
            }
            voice(mtof(chord.pad[0] - 12), t, eighth * 15, 'sine', 0.03, dry, 2, 2);
          }
          if (step % 4 === 0) voice(mtof(chord.bass), t, beat * 1.2, 'sine', 0.07, dry, 0.02, 0.25);
          if (step % 4 === 2 && level >= 2) voice(mtof(chord.bass + 12), t, beat * 0.4, 'triangle', 0.025, dry, 0.01, 0.12);
          // arpeggio: drukker naarmate je verder komt
          if (Math.random() < 0.35 + Math.min(level, 8) * 0.07) {
            const n = chord.pad[ARP[step % 8]] + 12;
            voice(mtof(n), t, eighth * 0.6, 'triangle', 0.032, dry, 0.005, 0.18);
            voice(mtof(n), t, eighth * 0.6, 'sine', 0.02, delay, 0.005, 0.18);
          }
          // data-bel
          if (Math.random() < 0.03 + (agi ? 0.05 : 0)) voice(mtof(chord.pad[(Math.random() * 5) | 0] + 24), t, 0.05, 'sine', 0.035, rev, 0.003, 0.9);
          step++; next += eighth;
        }
      },
    };
    return m;
  };

  // Live muziek in het spel.
  let live = null, liveTimer = null, liveLevel = [0, false];
  const MUSIC_VOL = 1;
  G.music = {
    start() {
      if (!G.S.settings.music || liveTimer) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === 'suspended') ac.resume();
        if (!live) { live = G.createMusic(ac, ac.destination); live.setLevel(...liveLevel); }
        live.out.gain.cancelScheduledValues(ac.currentTime);
        live.out.gain.setTargetAtTime(MUSIC_VOL, ac.currentTime, 1.5);
        liveTimer = setInterval(() => live.schedule(ac.currentTime + 0.6), 150);
      } catch (e) {}
    },
    stop() {
      if (!live || !liveTimer) return;
      clearInterval(liveTimer); liveTimer = null;
      try { live.out.gain.setTargetAtTime(0, ac.currentTime, 0.4); } catch (e) {}
    },
    setLevel(chapter, isAgi) { liveLevel = [chapter, isAgi]; if (live) live.setLevel(chapter, isAgi); },
  };

  // ---------- trillen (Capacitor Haptics op iOS) ----------
  G.haptic = (style = 'LIGHT') => {
    if (!G.S.settings.haptics) return;
    try {
      const H = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
      if (H) { H.impact({ style }); return; }
      if (navigator.vibrate) navigator.vibrate(style === 'HEAVY' ? 30 : style === 'MEDIUM' ? 18 : 8);
    } catch (e) {}
  };
})();

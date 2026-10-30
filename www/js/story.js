// Verhaallijn: negen hoofdstukken, gekoppeld aan je slimste model.
(function () {
  const G = window.G;

  G.CHAPTERS = [
    { from: 0, title: 'De garage', icon: '🔧',
      text: 'Je begint in een garage met één perceptron en een oude laptop. Op het scherm verschijnt Ada, een assistent die je ooit schreef en weer vergat. "Zullen we iets slims bouwen?"',
      goal: 'Tik op de kern en koop je eerste modellen.' },
    { from: 2, title: 'Statistiek en stof', icon: '📊',
      text: 'Je N-gram model voorspelt woorden beter dan je buurman. Investeerders bellen. Ada stelt voor om er een echt lab van te maken, met afdelingen, apps en eigen hardware.',
      goal: 'Bouw je lab uit via Onderzoek.' },
    { from: 3, title: 'De neurale lente', icon: '🌱',
      text: 'Neurale netwerken zijn terug. Je team groeit en de chips worden heet. Ada waarschuwt: "Hoe slimmer de modellen, hoe beter we moeten nadenken over veiligheid."',
      goal: 'Neem een team aan en houd je veiligheid op orde.' },
    { from: 5, title: 'Attention', icon: '🎯',
      text: 'Eén paper verandert alles: attention is all you need. Je Transformer leest hele boeken in één keer. De concurrentie wordt nerveus.',
      goal: 'Schaal op met betere chips en apps.' },
    { from: 6, title: 'Het taalmodel-tijdperk', icon: '💬',
      text: 'Miljoenen mensen praten elke dag met je modellen. Leraren klagen, programmeurs juichen en toezichthouders kijken mee.',
      goal: 'Laat je apps groeien en blijf veilig.' },
    { from: 8, title: 'Agents en redeneren', icon: '🧩',
      text: 'Je modellen voeren zelf taken uit en denken na voordat ze antwoorden. Ada is even stil als ze de resultaten ziet. "Dit gaat sneller dan gepland."',
      goal: 'Investeer in veiligheid voordat je verder gaat.' },
    { from: 10, title: 'De intelligentie-explosie', icon: '🧬',
      text: 'Je AI schrijft betere versies van zichzelf. Elke nacht wordt het model slimmer, en de hele wereld kijkt mee.',
      goal: 'Bouw het Dyson-datacenter.' },
    { from: 12, title: 'Kardashev', icon: '☀️',
      text: 'Een hele ster als stroombron. Alles wat je hebt gebouwd komt samen. Er is nog één project over.',
      goal: 'Bouw Project AGI.' },
    { agi: true, title: 'AGI', icon: '✨',
      text: 'Het is gelukt. Ada kijkt naar het scherm en zegt zacht: "En nu?" De singulariteit wacht, en daarachter een nieuw begin met alles wat je hebt geleerd.',
      goal: 'Activeer de singulariteit en bouw het opnieuw, nog beter.' },
  ];

  G.chapterIndex = () => {
    if (G.S.agi) return G.CHAPTERS.length - 1;
    const top = G.topModel();
    let c = 0;
    G.CHAPTERS.forEach((ch, k) => { if (!ch.agi && top >= ch.from) c = k; });
    return c;
  };
  G.chapter = () => G.CHAPTERS[G.chapterIndex()];
  // Een hoofdstuk dat je nog niet hebt gezien, of -1. Gelezen hoofdstukken blijven bewaard na een singulariteit.
  G.unseenChapter = () => { const k = G.chapterIndex(); return G.S.story[k] ? -1 : k; };
  G.markChapter = k => { G.S.story[k] = 1; };

  // Oudere saves: eerdere hoofdstukken tellen als gelezen, het huidige krijg je nog te zien.
  const migrate0 = G.migrateTree;
  G.migrateTree = () => {
    migrate0();
    G.S.story = G.S.story || {};
    const k = G.chapterIndex();
    if (G.S.lifeEarned > 0) for (let i = 0; i < k; i++) G.S.story[i] = 1;
  };
})();

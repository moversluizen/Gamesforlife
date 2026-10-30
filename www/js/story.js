// Verhaallijn: negen hoofdstukken, gekoppeld aan je slimste model.
(function () {
  const G = window.G;

  // Elk hoofdstuk volgt een stuk echte AI-geschiedenis.
  G.CHAPTERS = [
    { from: 0, title: T('De garage'), icon: '🔧', year: '1958',
      text: T('Het is 1958. In een garage bouw je een perceptron: één kunstmatig neuron dat leert van zijn fouten. Ada, je assistent, draait op een computer zo groot als een kast. "Zullen we iets slims bouwen?"'),
      goal: T('Tik op de kern en koop je eerste modellen.') },
    { from: 2, title: T('Statistiek en stof'), icon: '📊', year: T('jaren 90'),
      text: T('Het web groeit, en daarmee de berg tekst. Door woordreeksen te tellen maak je de eerste vertaal- en chatprogramma\'s. Tijd om er echte producten van te maken.'),
      goal: T('Open je productteam en lanceer je eerste app.') },
    { from: 3, title: T('De neurale lente'), icon: '🎮', year: '2012',
      text: T('Gamers kochten jarenlang grafische kaarten. Nu blijken die GPU\'s perfect voor neurale netwerken: in 2012 wint een netwerk op twee gaming-GPU\'s een grote beeldherkenningswedstrijd. Jij bouwt je eigen keten: van zand tot chip, en een datacenter om ze in te draaien.'),
      goal: T('Open Chips: bouw je chipketen en een datacenter.') },
    { from: 5, title: T('Attention'), icon: '🎯', year: '2017',
      text: T('Een paper met de titel "Attention is all you need" verandert alles: één model leest een hele tekst tegelijk. Grote labs laten hun eigen chips ontwerpen. Ada begint vaker over veiligheid.'),
      goal: T('Ontwerp je eigen chips en houd je veiligheid op orde.') },
    { from: 6, title: T('Het taalmodel-tijdperk'), icon: '💬', year: '2020–2023',
      text: T('Je taalmodel schrijft gedichten, code en essays. In 2022 gaat een chatbot viraal: honderd miljoen gebruikers in twee maanden. Leraren klagen, programmeurs juichen, toezichthouders kijken mee.'),
      goal: T('Laat je apps groeien met marketing.') },
    { from: 8, title: T('Agents en redeneren'), icon: '🧩', year: '2024–2026',
      text: T('Modellen denken eerst na en gebruiken zelf tools. Chips worden de bottleneck van de hele wereld. Ada: "Gelukkig maken wij ze zelf."'),
      goal: T('Laat je chipketen groeien tot 20 EUV-machines.') },
    { from: 10, title: T('De intelligentie-explosie'), icon: '🧬', year: T('toekomst'),
      text: T('Je AI ontwerpt betere versies van zichzelf. Elke nacht wordt het model slimmer, en de wereld kijkt mee. Hier begint het deel dat nog niemand heeft meegemaakt.'),
      goal: T('Bouw het Dyson-datacenter.') },
    { from: 12, title: T('Kardashev'), icon: '☀️', year: T('verre toekomst'),
      text: T('Een hele ster als stroombron. Alles wat je hebt gebouwd komt samen. Er is nog één project over.'),
      goal: T('Bouw Project AGI.') },
    { agi: true, title: T('AGI'), icon: '✨', year: '?',
      text: T('Het is gelukt. Ada kijkt naar het scherm en zegt zacht: "En nu?" De singulariteit wacht, en daarachter een nieuw begin met alles wat je hebt geleerd.'),
      goal: T('Activeer de singulariteit en bouw het opnieuw, nog beter.') },
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

# Balansplan Road to AGI

Doel: elke paar minuten een stapje verder, af en toe een grote sprong, en nooit een lawine van nieuwe dingen tegelijk.
De simulator (`node scripts/sim.js [uren] [--no-prestige] [--stats] [--log]`) speelt het spel als een actieve speler en meet dit.

## Tempo (gewichten)

| Fase | Tijd | Iets nieuws elke … | Grote sprongen |
| --- | --- | --- | --- |
| Kennismaken | 0–10 min | ±1 min | Eerste app, Chips |
| Opbouwen | 10–30 min | ±2 min | Team, eerste chip (GPU) |
| Groeien | 30–60 min | ±2–3 min | Transformer, AI-versneller |
| Uitbouwen | 1–2 uur | ±5 min | Taalmodel, Multimodaal, Wafer-scale |
| Lange adem | 2–4 uur | ±8–10 min | Eerste singulariteit (±×2,4) |
| Eindspel | 4–7 uur | via singulariteiten | Eerste AGI (±6,5 uur) |

Grote sprongen komen uit: mijlpalen (×2), een nieuwe chipgeneratie, Eureka (Datastorm ×7), trending apps, promoties, AGI (×2 permanent) en de singulariteit.

## Kostenregels

| Onderdeel | Regel | Waarom |
| --- | --- | --- |
| Modellen | basisprijs × 1,15 per exemplaar | klassieke idle-curve |
| Onderzoek naar een nieuw model | 1,5 × modelprijs × 1,5^(stap − 2) | vroege modellen snel, latere vragen geduld |
| Onderzoek naar een nieuwe chip | 0,5 × chipprijs × 1,4^(stap − 1) | idem |
| Onderzoek naar een nieuwe app | 0,6 × appprijs × 1,4^stap | idem |
| Lab-afdelingen | vaste tijdlijn, ±10× per afdeling (400 → 5 T) | één nieuw onderdeel per ±5–30 min |
| Mijlpalen modellen | ×2 bij 25, 50, 100, 150, 200, 300, 400, 500 | regelmatige kleine sprong |
| Rekenkracht-bonus | 1 + 0,25 × log10(rekenkracht) (±×4 max) | voelbaar, maar geen zichzelf versterkende lus |
| Data-bonus | 1 + 0,2 × log10(data) (±×3,5 max) | idem |
| Opdrachtbeloning | max(vast bedrag, 60 s gewoon inkomen) | geen lawine tijdens bonussen |
| Klikstorm | ×77 voor 10 s | jackpot zonder het begin plat te slaan |
| Inzichten | 1,5 × ∛(totaal verdiend / 1 B) | eerste singulariteit voelt groot, daarna steeds meer nodig |

## Lab-tijdlijn (eerste keer spelen)

De volgorde volgt de geschiedenis: eerst producten, dan GPU's in een datacenter (2012) en eigen chipontwerp (2016). Je maakt al je chips zelf.

| Afdeling | Opent | Kosten | Simulatie |
| --- | --- | --- | --- |
| Productteam | Apps | 2 K | 3 min |
| Chipfabriek | Chips (eigen keten + datacenter) | 40 K | 9–12 min |
| HR-afdeling | Team, Stagiair | 250 K | 13 min |
| Veiligheidsteam | Safety-engineer | 1 M | 19 min |
| Chipontwerpstudio | Tensor-chip en verder, Chipontwerper | 20 M | 30 min |
| Marketingafdeling | Marketeer | 300 M | 40 min |
| Fab-ingenieurs | Fab-ingenieur | 40 B | ±70–90 min |
| Talentprogramma | Talentscout | 300 B | ±115 min |
| Financiële afdeling | Financieel directeur | 2 T | ±145 min |
| Singulariteitsinstituut | Singulariteit | 5 T | ±160 min |

## Veiligheid

- Eigen tab, open met het Veiligheidsteam (±20 min). Daarvoor loopt er geen risico op.
- Risico stijgt met (0,03 + 0,02 × tekort)% per seconde: bij 5 tekort ±13 min tot een backlash.
- Na een backlash: risico terug naar 0 en 5 minuten rust. Wie veiligheid helemaal negeert, krijgt hoogstens elke ±10 minuten een backlash; alleen de eerste keer verschijnt een groot venster.
- Protocollen (eenmalig, gekoppeld aan echte mijlpalen): risico langzamer, minder gebruikersverlies, kortere backlash, langere rust, extra veiligheid.

## Chips: geleidelijk profijt

- Alleen **eigen chips**: zandgroeve → waferfabriek → EUV → chipfabriek. Pas als alle vier schakels draaien komen er chips uit, en de traagste schakel bepaalt de output.
- Een **datacenter** geeft ruimte; zonder ruimte geen extra rekenkracht.
- Een nieuwe chipgeneratie **vervangt je oude chips geleidelijk**, op het tempo van je productie. Je rekenkracht stijgt dus niet meteen.
- Vanaf de AI-versneller vraagt elke generatie meer EUV-machines (3, 8, 20, 45, 75, 110).

## Verhaallijn

Negen hoofdstukken, gekoppeld aan je slimste model. Elk hoofdstuk opent met een kort verhaalmoment van Ada.

| Hoofdstuk | Echte geschiedenis | Wat er opengaat |
| --- | --- | --- |
| 1. De garage | 1958, de perceptron | Modellen, onderzoek |
| 2. Statistiek en stof | jaren 90, het web en woordtellingen | Apps (Praatbot, Vertaal-app) |
| 3. De neurale lente | 2012, deep learning op gaming-GPU's | Chips (eigen keten, datacenter), Team |
| 4. Attention | 2017, de Transformer | Eigen chipontwerp, veiligheid |
| 5. Het taalmodel-tijdperk | 2020–2023, de chatbot-boom | Marketing |
| 6. Agents en redeneren | 2024–2026, agents en chips als bottleneck | Fab-ingenieurs, 20 EUV-machines |
| 7. De intelligentie-explosie | toekomst | Zelfverbeterende AI, quantum |
| 8. Kardashev | verre toekomst | Dyson-datacenter, Project AGI |
| 9. AGI | ? | Singulariteit en opnieuw beginnen |

De kern groeit mee: één neuron, staafdiagram, lagen, attention, dicht netwerk, agents, recursieve vormen, een ster, en een gouden AGI-ster.

## Ontwerpregels (maatstaf: Modellen en Chips)

1. Elk scherm: kop, één overzichtskaart (3 cijfers, 1 balk, 1 statusregel), daarna kaarten.
2. Elke kaart: icoon, naam, één effectregel, optioneel balk + label, één knop (werkwoord + prijs).
3. Elk icoon één keer per scherm; geen emoji in lopende tekst.
4. Kleur alleen voor wat je nu kunt doen (knop) of wat misgaat (rood getal); geen gekleurde randen of labels.
5. Hoogstens drie regels tekst per kaart.
6. Minstens drie kaarten tegelijk in beeld (op een klein scherm minstens 2,5): compact speelveld bovenin, lijst eronder.
7. Elke knop minstens 40 px hoog, alle tekst minstens 11 px. Wat niet leesbaar past, verdwijnt.
8. Menubalk: rode stip alleen bij iets nieuws (afdeling, hoofdlijn, nieuwe app of helper), niet bij elke betaalbare boost.

## Schrijfwijze

| Wat | Zo |
| --- | --- |
| Snelheid | `+4,5 K/s` |
| Vermenigvuldiger | `×2,70` (onder 10 twee decimalen), daarboven `×45` of `×1,2 K` |
| Percentage | `+25%` |
| Tijd | `45 s`, `3 min 20 s`, `1 u 5 min` |
| Knoppen (kleine regel) | werkwoord, kleine letter: kopen, bouwen, uitbreiden, aannemen, promoveren, onderzoeken |
| Kopjes | alleen eerste woord met hoofdletter |
| Begrippen | tokens, rekenkracht, data, veiligheid, inzichten, helpers, onderzoek, afdeling |

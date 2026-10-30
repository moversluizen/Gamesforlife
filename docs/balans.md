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

| Afdeling | Opent | Kosten | Simulatie |
| --- | --- | --- | --- |
| Productteam | Apps | 400 | 1 min |
| Eigen hardware | Chips | 4 K | 6 min |
| HR-afdeling | Team, Stagiair | 60 K | 12–15 min |
| Veiligheidsteam | Safety-engineer | 500 K | 18–31 min |
| Engineeringafdeling | Fab-ingenieur | 5 M | 22–33 min |
| Chipontwerpstudio | Chipontwerper | 50 M | 33–49 min |
| Marketingafdeling | Marketeer | 500 M | 45–58 min |
| Talentprogramma | Talentscout | 10 B | 64–83 min |
| Financiële afdeling | Financieel directeur | 200 B | 103–106 min |
| Singulariteitsinstituut | Singulariteit | 5 T | ±145 min |

## Verhaallijn

Negen hoofdstukken, gekoppeld aan je slimste model. Elk hoofdstuk opent met een kort verhaalmoment van Ada.

1. De garage · Perceptron, Markov-keten
2. Statistiek en stof · N-gram model
3. De neurale lente · RNN, LSTM
4. Attention · Transformer
5. Het taalmodel-tijdperk · Groot taalmodel, Multimodaal model
6. Agents en redeneren · Agent-zwerm, Redeneermodel
7. De intelligentie-explosie · Zelfverbeterende AI, Quantum-brein
8. Kardashev · Dyson-datacenter
9. AGI · na het bouwen van Project AGI

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

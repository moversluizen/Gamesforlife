# Road to AGI

Een idle clicker waarin je begint met één perceptron en via Markov-ketens, transformers, taalmodellen en agent-zwermen uiteindelijk **AGI** bouwt.

## Spelmechanismen

De mechanismen komen uit de populairste idle games (Cookie Clicker, AdVenture Capitalist, Egg Inc.):

| Mechanisme | In het spel |
| --- | --- |
| Tikken | Tik op de kern voor tokens |
| Generatoren met exponentiële kosten (×1,15) | 13 AI-modellen, van Perceptron tot Dyson-datacenter |
| Mijlpalen | Bij 10, 25, 50, 100 … stuks verdubbelt de productie van een model |
| Kooptoggle | ×1 / ×10 / ×100 / Max |
| Upgrades | 120+ onderzoeken (per model, voor tikken, infrastructuur, Eureka, offline) |
| Gouden bonus | 💡 Eureka-momenten: Doorbraak, Datastorm (×7) of Klikstorm (×777) |
| Offline-opbrengst | Tot 8 uur, 50% → 100% met upgrades |
| Prestige | Singulariteit: reset voor Inzichten (+2% productie per stuk) |
| Eindbaas | Project AGI: permanent ×2, daarna elke keer 10× groter |
| Prestaties | 70+ prestaties, elk +1% productie |
| Sfeer | Nieuwsticker, kleuren per tijdperk, geanimeerd neuraal netwerk, geluid en trillen |

## Lokaal spelen

Open `www/index.html` in een browser, of draai `npm run serve`.

## Projectstructuur

```
www/                 het spel (HTML/CSS/JS, geen build nodig)
  js/data.js         modellen, upgrades, prestaties, nieuws
  js/engine.js       spelregels, opslaan, offline, prestige
  js/fx.js           achtergrond-animatie, deeltjes, geluid, trillen
  js/ui.js           interface en spellus
resources/           bron voor app-icoon en splash (1024px / 2732px)
ios/                 Xcode-project (Capacitor, Swift Package Manager)
capacitor.config.json
```

## Naar de App Store

Benodigd: een Mac met Xcode 16+, Node.js 20+ en een Apple Developer-account (€99 per jaar).

1. `git clone` deze repo op je Mac en draai `npm install`.
2. `npm run ios`: dit synchroniseert `www/` naar het iOS-project en opent Xcode.
3. In Xcode: kies bij *Signing & Capabilities* je Team. Pas zo nodig de Bundle Identifier aan (`com.gamesforlife.roadtoagi`).
4. Test op een simulator of je eigen iPhone (▶).
5. Maak de app aan in [App Store Connect](https://appstoreconnect.apple.com) met dezelfde Bundle Identifier.
6. In Xcode: *Product → Archive → Distribute App → App Store Connect*.
7. Vul in App Store Connect de beschrijving, screenshots (6,9" en 6,5" iPhone), leeftijdsclassificatie (4+) en privacy in. Bij privacy kies je "Data Not Collected": het spel slaat alleen lokaal op.
8. Dien de app in ter review.

Na wijzigingen in `www/` draai je steeds `npx cap sync ios`.
Wil je een nieuw icoon? Vervang `resources/icon.png` en draai `npm run assets`.

Android werkt op dezelfde manier: `npx cap add android` en daarna `npm run android`.

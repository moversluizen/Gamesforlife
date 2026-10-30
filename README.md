# Road to AGI

Een idle clicker waarin je begint met één perceptron en via Markov-ketens, transformers, taalmodellen en agent-zwermen uiteindelijk **AGI** bouwt.

## Spelmechanismen

De mechanismen komen uit de populairste idle games (Cookie Clicker, AdVenture Capitalist, Egg Inc.):

| Mechanisme | In het spel |
| --- | --- |
| Tikken | Tik op de kern voor tokens; snel tikken bouwt Flow op (tot ×3) en soms valt een kritieke tik (×8) |
| Generatoren met exponentiële kosten (×1,15) | 13 AI-modellen, van Perceptron tot Dyson-datacenter |
| Mijlpalen | Bij 10, 25, 50, 100 … stuks verdubbelt de productie van een model |
| Kooptoggle | ×1 / ×10 / ×100 / Max |
| Lab | Je organisatie: elke afdeling (Productteam, Eigen hardware, HR, Veiligheid, …) ontgrendelt een onderdeel of helper; blijft na een singulariteit |
| Onderzoeksbomen | Drie bomen (modellen, chips, apps): de hoofdlijn ontgrendelt elk volgend model, elke chipgeneratie en elke app; zijtakken geven boosts |
| Upgrades | 120+ losse verbeteringen (per model, voor tikken, Eureka, offline, veiligheid) |
| Gouden bonus | 💡 Eureka-momenten: Doorbraak, Datastorm (×7) of Klikstorm (×77) |
| Offline-opbrengst | Tot 8 uur, 50% → 100% met upgrades |
| Prestige | Singulariteit: reset voor Inzichten (+2% productie per stuk) |
| Eindbaas | Project AGI: permanent ×2, daarna elke keer 10× groter |
| Prestaties | 80+ prestaties, elk +1% productie |
| Sfeer | Nieuwsticker, kleuren per tijdperk, geanimeerd neuraal netwerk, gegenereerde ambient-muziek die meegroeit met het verhaal, geluid en trillen |
| Chips | Eerst inkopen en een datacenter, later eigen chipontwerp en pas laat een eigen fabriek (zandgroeve → wafer → EUV → chipfabriek). Nieuwe chips vervangen oude geleidelijk |
| Technologieboom | 8 chipgeneraties (CPU → GPU → … → Quantumchip) met ontwikkeltijd; tikken versnelt het onderzoek |
| Versterkers | Modellen zijn de basis; chips (rekenkracht), apps (gebruikersdata), onderzoek en prestige vermenigvuldigen hun productie |
| Apps | 10 apps (Praatbot → Code-copiloot → Robot-butler) met groeiende gebruikers, campagnes en versies |
| Drie speelvelden | Modellen (kern), Chips (supply chain en chip) en Apps (telefoon met je apps) hebben elk een eigen tikscherm; Onderzoek, Team en Meer zijn volledige schermen |
| Apps | Trending-momenten (🔥 5× groei), een functie per versie, sterren en gebruikersreviews |
| Navigatie | Vijf vaste onderdelen in de menubalk, een kop met uitleg per scherm, Meer rechtsboven; veeg tussen de onderdelen |
| Managers | 7 helpers met rangen (Junior → Legende); de stagiair groeit door tot AI-collega en tikt per rang 2× zo sterk |
| Veiligheid | Slimmere modellen vragen veiligheid (safety-engineers, 8 veiligheidsonderzoeken). Loop je achter, dan stijgt het risico tot een backlash: productie −50% en gebruikers haken af |
| Mijlpalen in de keten | Elke ketenschakel verdubbelt bij 10, 25, 50, 100 … niveaus |
| Opdrachten | Ada, je AI-assistent, geeft 22 opdrachten met beloningen die je door het hele spel leiden |
| Verhaallijn | Negen hoofdstukken die de echte AI-geschiedenis volgen (perceptron 1958 → gaming-GPU's 2012 → Transformer 2017 → chatbots → agents → AGI); de kern groeit visueel mee |
| Organogram | Team toont je organisatie, die meegroeit met elke Lab-afdeling |
| Balans | Getest met `scripts/sim.js`; tempo en kostenregels staan in `docs/balans.md` |

## Lokaal spelen

Open `www/index.html` in een browser, of draai `npm run serve`.

## Projectstructuur

```
www/                 het spel (HTML/CSS/JS, geen build nodig)
  js/data.js         modellen, upgrades, prestaties, nieuws
  js/engine.js       spelregels, opslaan, offline, prestige
  js/fx.js           achtergrond-animatie, deeltjes, geluid, trillen
  js/industry.js     supply chain, chips, apps, helpers, opdrachten
  js/research.js     onderzoeksbomen en de koppeling met modellen, chips en apps
  js/story.js        hoofdstukken van de verhaallijn
  js/core-art.js     tekeningen in de kern per hoofdstuk
  js/ui-industry.js  interface voor chips, apps, team en opdrachten
  js/ui-research.js  interface voor de onderzoeksbomen
  js/ui.js           interface en spellus
resources/           bron voor app-icoon en splash (1024px / 2732px)
scripts/sim.js       balans-simulator (speelt het spel zonder scherm)
docs/balans.md       balansplan: tempo, kostenregels, Lab-tijdlijn, schrijfwijze
ios/                 Xcode-project (Capacitor, Swift Package Manager)
android/             Android Studio-project (Capacitor)
.github/workflows/   automatische Android-build (APK + AAB)
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

## Android

### APK downloaden en installeren (testen)

Bij elke push bouwt GitHub automatisch de app (workflow *Android build*).

1. Ga op GitHub naar **Actions → Android build** en open de laatste groene run.
2. Download onder *Artifacts* **road-to-agi-apk** en pak de zip uit.
3. Zet `app-debug.apk` op je Android-telefoon en open het bestand. Sta "installeren uit onbekende bronnen" toe als je telefoon daarom vraagt.

### Naar Google Play

Benodigd: een Google Play Console-account (eenmalig $25).

1. Maak één keer een upload-sleutel aan (op je eigen computer, met Java):
   ```
   keytool -genkeypair -v -keystore road-to-agi.keystore -alias roadtoagi -keyalg RSA -keysize 2048 -validity 10000
   ```
   Bewaar dit bestand en de wachtwoorden goed: zonder deze sleutel kun je geen updates meer uitbrengen.
2. Zet de sleutel als base64 om: `base64 -w0 road-to-agi.keystore` (macOS: `base64 -i road-to-agi.keystore`).
3. Voeg op GitHub onder **Settings → Secrets and variables → Actions** vier secrets toe:
   `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`roadtoagi`) en `ANDROID_KEY_PASSWORD`.
4. Start de workflow opnieuw (*Actions → Android build → Run workflow*). Je krijgt nu ook het artifact **road-to-agi-play-store-aab**.
5. Maak in de Play Console een app aan, upload `app-release.aab` (eerst bij *Interne test*), en vul de winkelvermelding, contentclassificatie en het formulier voor gegevensbeveiliging in ("geen gegevens verzameld").

Het versienummer (`versionCode`) loopt automatisch op met elke build, dus elke nieuwe AAB kan direct als update geüpload worden.

Lokaal bouwen kan ook met Android Studio: `npm run android`.

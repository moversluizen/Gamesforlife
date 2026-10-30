// Bundelt www/ tot één zelfstandig HTML-bestand (dist/road-to-agi.html),
// bijvoorbeeld om het spel als Claude-artifact of los webbestand te delen.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');

const body = html.match(/<body>([\s\S]*)<\/body>/)[1]
  .replace(/<script src="([^"]+)"><\/script>/g, (_, src) =>
    `<script>\n${fs.readFileSync(path.join(www, src), 'utf8')}\n</script>`);

const css = fs.readFileSync(path.join(www, 'css/style.css'), 'utf8');

// De artifact-viewer vult zelf de veilige zones van de telefoon op en
// heeft een vaste hoogte; daarom hier geen eigen insets en 100% hoogte.
const overrides = `
:root { color-scheme: dark; --st: 0px; --sb: 0px; }
#app { height: 100%; }
@media (prefers-reduced-motion: reduce) {
  #core .ring, #core .orb, #core .net circle, .buff, .eureka { animation: none !important; }
}`;

const out = `<title>Road to AGI</title>
<style>
${css}
${overrides}
</style>
${body.trim()}
`;

const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'road-to-agi.html'), out);
console.log(`dist/road-to-agi.html (${Math.round(out.length / 1024)} KB)`);

// Embebe Hanken Grotesk Bold (OFL) como base64 para la marca de agua.
// Así la fuente viaja dentro del bundle del servidor: las funciones de
// Netlify/Vercel no tienen fuentes instaladas y sharp dibujaría "□□□".
//   node scripts/embed-font.mjs
import { readFileSync, writeFileSync } from "node:fs";
const dir = "node_modules/@fontsource/hanken-grotesk/files/";
const b64 = (f) => readFileSync(dir + f).toString("base64");
const out = `// Generado por scripts/embed-font.mjs — no editar a mano.
// Hanken Grotesk Bold · SIL Open Font License 1.1 · https://github.com/marcologous/hanken-grotesk
export const HANKEN_BOLD_LATIN = "${b64("hanken-grotesk-latin-700-normal.woff")}";
export const HANKEN_BOLD_LATIN_EXT = "${b64("hanken-grotesk-latin-ext-700-normal.woff")}";
`;
writeFileSync("src/lib/images/watermark-font.ts", out);
console.log("ok", Math.round(out.length / 1024), "KB");

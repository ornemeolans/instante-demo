// Prueba local de la marca de agua sin Firebase:
//   npm run test:watermark -- ruta/a/foto.jpg "Nombre del fotógrafo"
// Sin argumentos, genera una imagen sintética de 4000x3000.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { buildPreviews } from "../src/lib/images/watermark.ts";

const [input, name = "Nombre Fotógrafo"] = process.argv.slice(2);

const original = input
  ? readFileSync(input)
  : await sharp({
      create: { width: 4000, height: 3000, channels: 3, background: { r: 90, g: 120, b: 150 } },
    })
      .jpeg()
      .toBuffer();

const { preview, thumb } = await buildPreviews(original, name);
mkdirSync("scripts/out", { recursive: true });
writeFileSync("scripts/out/preview.jpg", preview.buffer);
writeFileSync("scripts/out/thumb.jpg", thumb.buffer);
console.log(
  `preview ${preview.width}x${preview.height} ${(preview.buffer.length / 1024).toFixed(0)} KB | ` +
    `thumb ${thumb.width}x${thumb.height} ${(thumb.buffer.length / 1024).toFixed(0)} KB -> scripts/out/`,
);

import sharp from "sharp";
import * as opentypeNs from "opentype.js";
import type { Font } from "opentype.js";

// opentype.js 2 se expone como CommonJS: según quién lo cargue (Next o Node
// directo), `parse` llega como export con nombre o dentro de `default`.
const parse: typeof opentypeNs.parse =
  (opentypeNs as { parse?: typeof opentypeNs.parse }).parse ??
  (opentypeNs as unknown as { default: typeof opentypeNs }).default.parse;
import { HANKEN_BOLD_LATIN, HANKEN_BOLD_LATIN_EXT } from "./watermark-font.ts";

// Sin "server-only" a propósito: este módulo también lo usa el script de
// prueba `npm run test:watermark`, que corre fuera de Next.

export interface RenderedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

/*
 * El texto de la marca se dibuja como TRAZOS (paths SVG) con una fuente
 * embebida, no con <text>: los servidores sin fuentes instaladas (Netlify,
 * Vercel, Lambda) mostrarían "□□□" en lugar del nombre.
 */
let fonts: Font[] | null = null;
function loadFonts(): Font[] {
  if (!fonts) {
    const toArrayBuffer = (b64: string) => {
      const buf = Buffer.from(b64, "base64");
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    };
    fonts = [parse(toArrayBuffer(HANKEN_BOLD_LATIN)), parse(toArrayBuffer(HANKEN_BOLD_LATIN_EXT))];
  }
  return fonts;
}

/** Convierte un texto en datos de path SVG. Devuelve el path y su ancho real. */
function textToPath(text: string, fontSize: number, x0: number, baseline: number, letterSpacing = 0) {
  const [latin, ext] = loadFonts();
  let x = x0;
  let d = "";
  for (const ch of text) {
    const font = latin.charToGlyphIndex(ch) > 0 || ext.charToGlyphIndex(ch) === 0 ? latin : ext;
    const glyph = font.charToGlyph(ch);
    d += glyph.getPath(x, baseline, fontSize).toPathData(1);
    x += ((glyph.advanceWidth ?? font.unitsPerEm * 0.5) / font.unitsPerEm) * fontSize + letterSpacing;
  }
  return { d, width: x - x0 - letterSpacing };
}

/** Una capa de texto repetido en mosaico, con filas alternas desplazadas media baldosa. */
function textLayer(opts: {
  id: string;
  raw: string;
  fontSize: number;
  angle: number;
  gapX: number;
  rowH: number;
  offsetX: number;
  offsetY: number;
  style: string;
}): { def: string; rect: string } {
  const { id, raw, fontSize, angle, gapX, rowH, offsetX, offsetY, style } = opts;
  const probe = textToPath(raw, fontSize, 0, 0);
  const tileW = Math.ceil(probe.width + gapX);
  const tileH = rowH * 2;
  const y1 = Math.round(rowH * 0.5 + fontSize * 0.35);
  const y2 = y1 + rowH;
  const p = (x: number, y: number) => `<path d="${textToPath(raw, fontSize, x, y).d}" ${style}/>`;
  const def = `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${tileW}" height="${tileH}"
      patternTransform="translate(${offsetX} ${offsetY}) rotate(${angle})">
      ${p(gapX / 2, y1)}${p(gapX / 2 + tileW / 2, y2)}${p(gapX / 2 - tileW / 2, y2)}
    </pattern>`;
  return { def, rect: `<rect width="100%" height="100%" fill="url(#${id})"/>` };
}

/**
 * Marca de agua en varias capas, pensada para que sea difícil de borrar con
 * herramientas de IA (inpainting): cuanto menos "zona limpia" queda alrededor
 * de cada trazo, menos contexto tiene el modelo para reconstruir la foto.
 *
 *  1. Nombre grande en diagonal (-30°), denso, blanco con borde oscuro.
 *  2. Nombre chico en la diagonal opuesta (+28°), oscuro, que rellena los huecos.
 *  3. Tramado fino de líneas cruzadas sobre toda la imagen.
 *  4. Sello central grande con "VISTA PREVIA".
 *
 * Ángulos y desplazamientos llevan una variación aleatoria por imagen, así
 * cada foto tiene un patrón distinto y no se puede "aprender" una plantilla
 * fija para restarla.
 */
export function tiledWatermarkSvg(width: number, height: number, watermark: string): Buffer {
  const raw = watermark.trim() || "©";
  const base = Math.min(width, height);
  const jitter = (n: number) => (Math.random() * 2 - 1) * n;

  const bigFs = Math.max(14, Math.round(base / 15));
  const big = textLayer({
    id: "big",
    raw,
    fontSize: bigFs,
    angle: -30 + jitter(3),
    gapX: Math.round(bigFs * 0.9),
    rowH: Math.round(bigFs * 1.9),
    offsetX: Math.round(jitter(bigFs * 3)),
    offsetY: Math.round(jitter(bigFs * 3)),
    style: `fill="#ffffff" fill-opacity="0.42" stroke="#000000" stroke-opacity="0.28" stroke-width="${Math.max(1, Math.round(bigFs / 22))}"`,
  });

  const smallFs = Math.max(8, Math.round(base / 42));
  const small = textLayer({
    id: "small",
    raw: `© ${raw}`,
    fontSize: smallFs,
    angle: 28 + jitter(4),
    gapX: Math.round(smallFs * 1.2),
    rowH: Math.round(smallFs * 2.2),
    offsetX: Math.round(jitter(smallFs * 5)),
    offsetY: Math.round(jitter(smallFs * 5)),
    style: `fill="#000000" fill-opacity="0.2"`,
  });

  // Tramado: líneas finas en dos direcciones, alternando claro y oscuro.
  const step = Math.max(6, Math.round(base / 70));
  const lw = Math.max(0.6, base / 1400);
  const hatch = `<pattern id="hatch" patternUnits="userSpaceOnUse" width="${step}" height="${step}" patternTransform="rotate(${45 + jitter(5)})">
      <line x1="0" y1="0" x2="0" y2="${step}" stroke="#ffffff" stroke-opacity="0.13" stroke-width="${lw}"/>
      <line x1="0" y1="${step / 2}" x2="${step}" y2="${step / 2}" stroke="#000000" stroke-opacity="0.09" stroke-width="${lw}"/>
    </pattern>`;

  const stampFs = Math.round(Math.min(width / 7.5, height / 4));
  const stampSpacing = Math.round(stampFs * 0.05);
  const stampW = textToPath("VISTA PREVIA", stampFs, 0, 0, stampSpacing).width;
  const stampPath = textToPath("VISTA PREVIA", stampFs, (width - stampW) / 2, height / 2 + stampFs * 0.36, stampSpacing).d;
  const stamp = `<path d="${stampPath}" transform="rotate(${-30 + jitter(2)} ${width / 2} ${height / 2})"
      fill="#ffffff" fill-opacity="0.22" stroke="#000000" stroke-opacity="0.22" stroke-width="${Math.max(1, Math.round(stampFs / 40))}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>${hatch}${small.def}${big.def}</defs>
  <rect width="100%" height="100%" fill="url(#hatch)"/>
  ${small.rect}
  ${big.rect}
  ${stamp}
</svg>`;
  return Buffer.from(svg);
}

/**
 * Redimensiona (lado mayor = maxSize, nunca agranda), aplica la marca de agua
 * en mosaico y comprime en JPEG. sharp descarta los metadatos EXIF/GPS por defecto.
 */
export async function renderWatermarked(
  original: Buffer,
  watermarkText: string,
  maxSize: number,
  quality: number,
): Promise<RenderedImage> {
  const resized = await sharp(original, { failOn: "error" })
    .rotate() // respeta la orientación EXIF antes de descartarla
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });

  const { width, height } = resized.info;
  const buffer = await sharp(resized.data)
    .composite([{ input: tiledWatermarkSvg(width, height, watermarkText), top: 0, left: 0 }])
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toBuffer();

  return { buffer, width, height };
}

/** Vista previa (1000 px) y miniatura (480 px), ambas con marca de agua. */
export async function buildPreviews(original: Buffer, watermarkText: string) {
  const preview = await renderWatermarked(original, watermarkText, 1000, 68);
  const thumb = await renderWatermarked(original, watermarkText, 480, 62);
  return { preview, thumb };
}

/**
 * Material de la cianotipia, dibujado en código (sin imágenes):
 *  - <CyanotypeDefs/>: el helecho (fractal de Barnsley, silueta botánica real
 *    y determinística) y los filtros SVG de la emulsión.
 *  - <Plate/>: la lámina. El azul no es un relleno plano: un filtro le da
 *    densidad irregular de emulsión y un borde que se deshilacha en vetas de
 *    pincel; los helechos son fotogramas blancos sólidos con halo de exposición.
 * Todo se renderiza en el servidor: no agrega JavaScript al navegador.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Puntos del helecho de Barnsley como un único path (los puntos se funden en silueta con el filtro). */
function barnsleyPath(points = 5200, seed = 1843): string {
  const rand = mulberry32(seed);
  let x = 0;
  let y = 0;
  const parts: string[] = [];
  for (let i = 0; i < points + 20; i++) {
    const r = rand();
    let nx: number;
    let ny: number;
    if (r < 0.01) {
      nx = 0;
      ny = 0.16 * y;
    } else if (r < 0.86) {
      nx = 0.85 * x + 0.04 * y;
      ny = -0.04 * x + 0.85 * y + 1.6;
    } else if (r < 0.93) {
      nx = 0.2 * x - 0.26 * y;
      ny = 0.23 * x + 0.22 * y + 1.6;
    } else {
      nx = -0.15 * x + 0.28 * y;
      ny = 0.26 * x + 0.24 * y + 0.44;
    }
    x = nx;
    y = ny;
    if (i < 20) continue; // descarta el transitorio inicial
    // x ∈ [-2.2, 2.7], y ∈ [0, 10] → viewBox 0..100 x 0..200
    const px = ((x + 2.2) / 4.9) * 100;
    const py = 200 - (y / 10) * 200;
    parts.push(`M${px.toFixed(1)} ${py.toFixed(1)}h0`);
  }
  return parts.join("");
}

const FERN_PATH = barnsleyPath();

export function CyanotypeDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <symbol id="fern" viewBox="0 0 100 200">
          <path d={FERN_PATH} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </symbol>

        {/* Fotograma: funde los puntos en una silueta sólida (desenfoque + umbral). */}
        <filter id="photogram" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="b" />
          <feComponentTransfer in="b" result="solid">
            <feFuncA type="table" tableValues="0 0 0.6 1 1 1" />
          </feComponentTransfer>
          <feFlood floodColor="#ffffff" result="white" />
          <feComposite in="white" in2="solid" operator="in" />
        </filter>

        {/* Emulsión: densidad irregular del azul + borde deshilachado en vetas de pincel. */}
        <filter id="emulsion" x="-4%" y="-8%" width="108%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.05" numOctaves="3" seed="3" result="streak" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="soft" />
          <feComposite in="soft" in2="streak" operator="arithmetic" k1="0" k2="1.7" k3="1" k4="-1.05" result="edge" />
          <feComponentTransfer in="edge" result="mask">
            <feFuncA type="table" tableValues="0 0.05 0.45 0.85 1 1" />
          </feComponentTransfer>
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.018" numOctaves="2" seed="11" result="density" />
          {/* Mapea el ruido a un azul entre #1a3866 y #27497f */}
          <feColorMatrix
            in="density"
            type="matrix"
            values="0.1275 0 0 0 0.064  0.165 0 0 0 0.1705  0.245 0 0 0 0.3265  0 0 0 0 1"
            result="field"
          />
          <feComposite in="field" in2="mask" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

export function Fern({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <span className={`fern ${flip ? "fern-flip" : ""} ${className}`} aria-hidden>
      {/* Halo de exposición parcial detrás del fotograma */}
      <svg className="fern-halo" viewBox="0 0 100 200" focusable="false">
        <use href="#fern" />
      </svg>
      <svg className="fern-core" viewBox="0 0 100 200" focusable="false">
        <use href="#fern" />
      </svg>
    </span>
  );
}

export function Plate({ children, className = "", ferns = true }: { children: React.ReactNode; className?: string; ferns?: boolean }) {
  return (
    <div className={`plate ${className}`}>
      <svg className="plate-wash" aria-hidden focusable="false">
        <rect x="2.5%" y="5%" width="95%" height="90%" fill="#1f3f73" filter="url(#emulsion)" />
      </svg>
      {ferns && (
        <>
          <Fern className="plate-fern plate-fern-l" />
          <Fern className="plate-fern plate-fern-r" flip />
        </>
      )}
      <div className="plate-content">{children}</div>
    </div>
  );
}

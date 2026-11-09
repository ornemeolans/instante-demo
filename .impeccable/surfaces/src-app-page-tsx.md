---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/e/[slug]/page.tsx"]
---

## Scope

Mundo visual de toda la app Instante (reemplaza a "Foto Express", que la usuaria descartó por "parece una página de repuestos de autos"; pidió algo "más estético y delicado"). Primera superficie: landing (Persuade) + galería pública (Experience). El panel del fotógrafo (Operate) hereda el mundo en registro sobrio.

## Direction contract

THESIS: Cada foto se revela como una copia al sol: Instante es una lámina de cianotipia sobre papel de algodón, donde la luz dibuja en blanco sobre azul de Prusia y el resto es papel claro, aire y líneas finas como hilo. Rechaza la tienda comercial estridente y la galería blanca genérica.

OWN-WORLD: Fondo de papel de algodón blanco frío (#f5f7fa) en todo; lavados de cianotipia (#e3eaf3, #c3d2e6) para zonas suaves; azul de Prusia (#1f3f73) saturado reservado a la acción; tinta azul noche (#14243f) para el texto. Títulos en Bodoni Moda itálica de trazo finísimo (eje óptico alto); interfaz en Hanken Grotesk; anotaciones de catálogo en versalitas espaciadas. Una lámina azul con borde irregular de pincel y siluetas de helecho generadas (fractal de Barnsley) en blanco. Divisiones de un pelo; nada de cajas ni sombras duras.

STORY: La visitante entiende que acá encuentra y compra sus fotos de un evento, siente que se cuida la imagen (lámina, papel, aire), elige sus copias y paga con Mercado Pago. El fotógrafo ve su trabajo tratado con delicadeza y protegido.

FIRST VIEWPORT: Landing en eje central: arriba un nav mínimo (marca a la izquierda, "Soy fotógrafo" a la derecha); al centro la lámina de cianotipia ancha con helechos espejados a ambos lados y "Instante" en Bodoni itálica blanca, más la promesa "Tus fotos del evento, reveladas para vos"; inmediatamente debajo, centrado sobre el papel, el campo "Pegá el enlace o código de tu evento" con el botón azul de Prusia "Buscar mis fotos" (acción primaria visible). Galería: lámina angosta con el nombre del evento, grilla de fotos sobre papel con anotación de catálogo y precio en cifras tabulares, y la barra "Tus copias" fija abajo.

FORM: "Cianotipia" (posición 4 de la lista propia), seed seed:f78c7f900a4fa4d1. Raises: composición en eje simétrico (Versalles); divisiones de hilo (ciudad dormida); azul saturado sólo para la acción (libro futurista); cifras tabulares con rigor (campo de datos); el estado cambia en el lugar (siete segmentos). Signature interaction: al elegir una foto, su anotación se "expone": un lavado azul de Prusia la barre de izquierda a derecha (clip-path) y la etiqueta pasa a "elegida", mientras la barra "Tus copias" suma una.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Sin fotos de muestra reales en producción: la vidriera de la landing muestra las de los eventos publicados o queda en estado vacío.

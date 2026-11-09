---
name: Instante
description: Cada foto se revela como una copia al sol, una lámina de cianotipia sobre papel de algodón.
colors:
  prussian: "#1f3f73"
  prussian-deep: "#162f58"
  cyan-mid: "#5d7fae"
  paper: "#f5f7fa"
  paper-white: "#ffffff"
  wash-1: "#e8eef6"
  wash-2: "#cfdbea"
  thread: "#c9d4e3"
  ink: "#14243f"
  ink-soft: "#4d5e7b"
  ink-faint: "#6a7a95"
  ok: "#24704a"
  pending: "#8a5a00"
  danger: "#a3262c"
  paper-veil: "rgb(245 247 250 / 0.97)"
  ink-scrim: "rgb(20 36 63 / 0.32)"
  white-veil: "rgb(255 255 255 / 0.92)"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(3.6rem, 11vw, 8.5rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "\"opsz\" 96"
  display-event:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(2.4rem, 6.5vw, 5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 96"
  headline:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(2.2rem, 4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 24"
  headline-sheet:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(2rem, 5vw, 2.6rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 24"
  headline-section:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 24"
  figure:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(1.8rem, 3vw, 2.4rem)"
    fontWeight: 400
    lineHeight: 1.1
    fontFeature: "\"tnum\""
    fontVariation: "\"opsz\" 24"
  count:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "1.8rem"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "\"tnum\""
    fontVariation: "\"opsz\" 24"
  wordmark-plate:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1
    fontVariation: "\"opsz\" 24"
  wordmark:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "1.6rem"
    fontWeight: 500
    lineHeight: 1
    fontVariation: "\"opsz\" 24"
  promise:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)"
    fontWeight: 400
    lineHeight: 1.1
    fontVariation: "\"opsz\" 24"
  title:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.1
    fontVariation: "\"opsz\" 24"
  title-sm:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "1.35rem"
    fontWeight: 500
    lineHeight: 1.1
    fontVariation: "\"opsz\" 24"
  price:
    fontFamily: "Bodoni Moda, Didot, serif"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "\"tnum\""
    fontVariation: "\"opsz\" 24"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  ui:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.02em"
  small:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.14em"
    fontFeature: "\"tnum\""
rounded:
  hair: "2px"
  soft: "6px"
  pill: "999px"
  round: "50%"
spacing:
  2xs: "4px"
  xs: "6px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  2xl: "44px"
  gutter: "clamp(16px, 4vw, 48px)"
components:
  button-primary:
    backgroundColor: "{colors.prussian}"
    textColor: "{colors.paper-white}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.prussian-deep}"
    textColor: "{colors.paper-white}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.wash-1}"
    textColor: "{colors.ink}"
  button-small:
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
    height: "36px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "44px"
  input:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.soft}"
    padding: "10px 14px"
    height: "46px"
  input-search:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "46px"
  pick-chip:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 12px 4px 10px"
    height: "36px"
  pick-chip-pressed:
    backgroundColor: "{colors.wash-1}"
    textColor: "{colors.prussian}"
  take-label:
    textColor: "{colors.ink-faint}"
    typography: "{typography.label}"
    rounded: "{rounded.hair}"
    padding: "3px 8px"
  take-label-picked:
    backgroundColor: "{colors.prussian}"
    textColor: "{colors.paper-white}"
  badge:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  badge-on:
    backgroundColor: "{colors.wash-1}"
    textColor: "{colors.prussian}"
  nav-link:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  nav-link-active:
    backgroundColor: "{colors.wash-1}"
    textColor: "{colors.prussian}"
  copies-bar:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 10px 10px 20px"
    width: "min(600px, calc(100% - 24px))"
  checkout-sheet:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.soft}"
    width: "min(520px, 100%)"
  dropzone:
    backgroundColor: "{colors.wash-1}"
    textColor: "{colors.ink}"
    rounded: "{rounded.soft}"
    padding: "32px 18px"
---

# Design System: Instante

## Overview

**Creative North Star: "La copia al sol"**

Instante es una lámina de cianotipia apoyada sobre papel de algodón frío. La luz dibuja en blanco sobre azul de Prusia; todo lo demás es papel claro, aire y líneas finas como un hilo. La lámina (un campo azul con densidad irregular de emulsión y borde deshilachado en vetas de pincel) es la única superficie de color grande del sistema, y adentro de ella viven los helechos: fotogramas blancos generados en código con el fractal de Barnsley, sin una sola imagen.

La composición es simétrica y centrada en las superficies que persuaden y muestran (landing, galería, hojas de login/pago/descarga), y se ordena en columnas y libros contables en el panel del fotógrafo, que hereda el mismo papel, la misma tinta y los mismos hilos en un registro sobrio. La densidad es baja: mucho aire entre bloques, divisiones de un pelo en lugar de cajas, cifras tabulares con rigor de catálogo. El estado cambia en el lugar, sin saltos de pantalla.

El mundo reemplaza por completo a "Foto Express" (cartel rojo, stickers ámbar, fondo azul noche), descartado por la usuaria por estridente. Lo que rechaza: la tienda comercial que grita y la galería blanca genérica sin material.

**Key Characteristics:**
- Papel de algodón frío en todo; ninguna superficie oscura de fondo.
- Una sola lámina azul de Prusia por pantalla, con emulsión irregular y helechos blancos adentro.
- Azul de Prusia sólido sólo para la acción y el estado elegido.
- Títulos en Bodoni Moda itálica; interfaz en Hanken Grotesk; anotaciones de catálogo en versalitas espaciadas.
- Divisiones de 1px color hilo; sin cajas, sin sombras duras.
- Vocabulario de laboratorio fotográfico: "Tus copias", "Elegida", "Recién reveladas", "Toma 001".

## Colors

Una paleta fría y monocroma de cianotipia: papel casi blanco, lavados celestes, tinta azul noche y un único azul saturado que trabaja.

### Primary
- **Azul de Prusia** (prussian): el color de la acción. Fondo de los botones primarios ("Buscar mis fotos", "Pagar con Mercado Pago", "Empezar a vender"), lavado de la etiqueta elegida, barra de progreso, anillo de foco y texto de los estados activos (pestaña actual, insignia "Publicada", chip "Elegida"). Con blanco encima da 10:1. También es el color de base que el filtro de emulsión convierte en la lámina.
- **Prusia profundo** (prussian-deep): hover del botón primario. Nada más.

### Secondary
- **Cian de trazo** (cyan-mid): trazos y estados suaves. Subrayado de los links, borde en hover de botones y chips, borde punteado de la zona de carga, numerales romanos de los pasos.

### Neutral
- **Papel de algodón** (paper): fondo de todas las páginas, del panel y de las celdas de la caja. También es el `theme-color`.
- **Blanco de copia** (paper-white): campos, chips, la barra "Tus copias", la hoja de checkout y el cabezal del panel. Es además el blanco de los helechos y del texto sobre la lámina.
- **Lavado claro** (wash-1): fondo de hover, chip presionado, pestaña activa, aviso de demo, ayuda de pago, fondo de foto mientras carga, zona de carga.
- **Lavado medio** (wash-2): halo de foco de los campos, selección de texto, zona de carga con archivo encima, scrollbar.
- **Hilo** (thread): todas las divisiones de 1px y los bordes de controles en reposo.
- **Tinta** (ink): texto principal (14:1 sobre papel). También la línea superior de 1px que abre un bloque del panel o un libro contable.
- **Tinta suave** (ink-soft): texto secundario y rótulos de campo (6.3:1).
- **Tinta tenue** (ink-faint): anotaciones de catálogo, placeholders, pie de página (4.6:1). No bajar de este tono para texto.
- **Velo de papel** (paper-veil): fondo del visor a pantalla completa.
- **Velo de tinta** (ink-scrim): fondo detrás de la hoja de checkout.
- **Velo blanco** (white-veil): botón de borrar sobre una foto del panel.

### Semantic
- **Listo** (ok), **Pendiente** (pending), **Error** (danger): sólo en sellos de estado, mensajes de formulario y la barra de carga terminada o fallida. Siempre como texto o borde, nunca como relleno.

### Named Rules
**La Regla del Azul que Trabaja.** El azul de Prusia sólido aparece sólo donde se puede actuar o donde algo quedó elegido: botón primario, lavado de "Elegida", foco, progreso, estado activo, link. Las únicas excepciones toleradas son el punto del wordmark y la cifra del total a pagar, que acompaña al botón de pago. Si un azul de Prusia no se puede tocar ni marca una elección, sobra.

**La Regla de la Lámina Única.** El azul en superficie grande existe sólo como lámina de emulsión (filtro `#emulsion`), nunca como relleno plano de un bloque, y hay una sola por pantalla.

## Typography

**Display Font:** Bodoni Moda itálica, con eje óptico `opsz` (respaldo: Didot, serif)
**Body Font:** Hanken Grotesk (respaldo: system-ui, sans-serif)

**Character:** Una didona de la época de las láminas de cianotipia, siempre en itálica, contra una grotesca clara y discreta. La Bodoni pone la voz; la Hanken no compite.

### Hierarchy
- **Display** (400, opsz 96): "Instante" sobre la lámina de la landing. Trazo fino llevado a hilo.
- **Display de evento** (400, opsz 96): nombre del evento sobre la lámina de galería y de descarga.
- **Headline** (500, opsz 24): títulos de página del panel ("Mis eventos", "Ventas", "Perfil").
- **Headline de hoja** (500, opsz 24): título de login, pago y 404 debajo de la lámina chica.
- **Headline de sección** (500, opsz 24): "Recién reveladas", "¿Sos fotógrafo?".
- **Cifra** (400, opsz 24, tabular): montos grandes de la caja del panel.
- **Conteo** (400, opsz 24, tabular): número de copias en la barra y total a pagar en la hoja.
- **Wordmark** (500, opsz 24): "Instante." en la barra superior; en su tamaño de lámina dentro de las hojas.
- **Promesa** (400, opsz 24): la línea bajo el título de la landing.
- **Title / Title chico** (500, opsz 24): subtítulos del panel; pasos de la landing, nombre del evento en el libro contable, "Tus copias" en la hoja.
- **Precio** (400, opsz 24, tabular): "$ 5.000" junto a cada toma.
- **Body** (400, 1.6): texto corrido de la interfaz, 58 a 70ch como máximo.
- **Body chico, UI, small, caption** (Hanken): texto secundario, botones (600, 0.02em), metadatos y ayudas.
- **Label** (600, versalitas 0.14em, tabular): rótulos de campo, anotaciones de catálogo ("TOMA 001 · PRUEBA"), encabezados de tabla, insignias y sellos.

### Named Rules
**La Regla del Eje Óptico.** `opsz 96` con peso 400 sólo en los h1 que van sobre una lámina (landing, galería, descarga). Todo otro uso de la Bodoni es `opsz 24`, para que los trazos finos se sostengan en tamaños medianos: títulos, subtítulos y wordmark en 500; cifras (precio, conteo, caja, numerales de los pasos) y la promesa de la landing en 400.

**La Regla de la Itálica.** La Bodoni nunca va en redonda ni en versalitas; las versalitas son de la Hanken.

**La Regla de la Cifra Tabular.** Precios, conteos, totales, códigos y tablas usan cifras tabulares.

## Layout

Eje central y simétrico en landing, galería y hojas: lámina centrada (hasta 1180px en la landing, a margen de página en la galería), búsqueda de hasta 640px, hojas de 440px. El margen lateral es un único `gutter` fluido. La vidriera de la landing y la grilla de tomas son grillas automáticas de columnas mínimas de 200 a 260px (dos columnas en el celular), con más aire vertical que horizontal. Los pasos son tres columnas entre dos hilos y se apilan por debajo de 700px.

El panel trabaja a 1240px de ancho máximo, con una grilla de contenido más una columna lateral de 380px que se apila por debajo de 900px. El cabezal pasa a dos filas en el celular, con las pestañas desplazables.

En el celular (hasta 640px) los helechos bajan a las esquinas inferiores de la lámina y la lámina suma 132px de aire abajo para que el texto quede libre arriba. La barra "Tus copias" flota centrada abajo, a 14px del borde (o el área segura).

## Elevation & Depth

El sistema es plano: la profundidad la dan el papel, los lavados y los hilos. Hay sombras sólo en lo que flota sobre la página, y siempre son ambientales, largas y muy difusas, teñidas de tinta, nunca duras ni desplazadas.

### Shadow Vocabulary
- **Barra flotante** (`0 20px 44px -24px` tinta al 45%): la barra "Tus copias".
- **Hoja** (`0 18px 40px -28px` tinta al 35%): la hoja de checkout.
- **Copia en el visor** (`0 30px 60px -40px` tinta al 60%): la foto ampliada.
- **Halo de foco** (`0 0 0 3px` lavado medio): campos con foco.

### Named Rules
**La Regla del Hilo.** Lo que separa es una línea de 1px color hilo; lo que abre un bloque del panel o un libro contable es una línea de 1px de tinta. No hay cajas con borde ni tarjetas. Las excepciones son exactamente dos contenedores: la zona de carga (borde punteado cian) y la hoja modal de checkout (con su ayuda de pago adentro). Los controles (campos, botones, chips, la barra flotante) no cuentan como cajas.

**La Regla de la Sombra Blanda.** Nada lleva sombra dura ni desplazada. Sólo flotan la barra, la hoja y la copia del visor.

## Shapes

Formas de papel: casi rectas en lo que es imagen o papel, completamente redondas en lo que se toca. Las fotos y miniaturas llevan un canto apenas suavizado (hair); campos, hoja y zona de carga llevan un redondeo blando (soft); botones, chips, insignias, sellos, pestañas, búsqueda y barra flotante son píldoras; los botones de ícono son círculos. El único borde orgánico es el de la lámina: no es un radio sino el deshilachado de pincel que genera el filtro de emulsión.

## Components

### Buttons
Píldoras serenas, peso 600, nunca en mayúsculas.
- **Shape:** píldora, 44px de alto (36px en la variante chica).
- **Primary:** azul de Prusia con texto blanco; es la acción de la pantalla.
- **Outline:** transparente con borde hilo y texto tinta ("Soy fotógrafo", "Seguir eligiendo").
- **Ghost:** como el outline, sin borde.
- **Hover / Focus / Active:** el outline toma borde cian y fondo lavado claro; el primario baja a Prusia profundo; al apretar escala a 0.98. Foco: contorno de 2px azul de Prusia a 3px de distancia.
- **Icon button:** círculo de 44px con borde hilo.
- **Link button:** texto azul de Prusia subrayado en cian.

### Chips (selección de toma)
- **Style:** píldora blanca con borde hilo, "+ $ 5.000" con cifra tabular.
- **State:** presionada pasa a lavado claro, borde y texto azul de Prusia, y dice "Elegida" con tilde.

### Badges y sellos
- **Insignia:** píldora con borde hilo en versalitas; encendida ("Publicada") toma lavado claro y azul de Prusia.
- **Sello de estado:** píldora con borde del color semántico (listo, pendiente, error) en versalitas, sobre las hojas de pago y descarga.

### Cards / Containers
No hay tarjetas. La información se apoya en el papel y se separa con hilos.
- **Ficha (sobre):** filas de rótulo en versalitas y valor alineado a la derecha, separadas por hilos.
- **Libro contable:** filas con miniatura de 76px, nombre en Bodoni y estado; hover en lavado claro.
- **Caja del panel:** celdas de papel separadas por un hueco de 1px color hilo, con la cifra grande en Bodoni.

### Inputs / Fields
- **Style:** blanco de copia, borde hilo de 1px, redondeo blando, 46px de alto; rótulo encima en versalitas tinta suave.
- **Focus:** borde azul de Prusia más halo de 3px en lavado medio.
- **Error:** mensaje debajo en color error.
- **Búsqueda de la landing:** el mismo campo en píldora, junto al botón primario.

### Navigation
- **Barra superior:** wordmark "Instante." a la izquierda (el punto en azul de Prusia) y un botón outline chico a la derecha.
- **Panel:** cabezal blanco con hilo inferior; pestañas en píldora, tinta suave; hover lavado claro; la actual en lavado claro con texto azul de Prusia en 600. En el celular las pestañas pasan a una fila propia desplazable.

### La lámina (signature)
Rectángulo azul de Prusia que el filtro `#emulsion` convierte en un campo de densidad irregular con borde de pincel, ocupando del 2.5% al 97.5% de ancho y del 5% al 95% de alto. Lleva dos helechos espejados (fotograma sólido más halo de exposición difuso), inclinados 6°, siempre adentro de la emulsión; en el celular bajan a las esquinas inferiores a 104px de alto (64px en la lámina chica de las hojas) e inclinados 14°. Texto blanco encima. Tres tamaños: lámina de landing, lámina de evento y lámina chica de hoja con el wordmark.

### Toma que se expone (interacción signature)
Al elegir una foto, la anotación "TOMA 001" se expone: un lavado azul de Prusia la barre de izquierda a derecha con `clip-path` en 520ms, el texto pasa a blanco, el chip dice "Elegida" y el número de la barra "Tus copias" sube con un pequeño salto.

### Barra "Tus copias"
Píldora blanca flotante con borde hilo y sombra de barra flotante: conteo en Bodoni, total y "N copias elegidas", vaciar y "Ver mis copias" en primario. Entra subiendo 24px.

### Hoja de checkout
Hoja modal sobre velo de tinta, abajo en el celular y centrada desde 720px. Cabezal "Tus copias" en Bodoni con cierre circular, fichas de evento y copias, miniaturas cuadradas con quitar, total en Bodoni azul de Prusia entre hilos, campos y acciones fijas abajo sobre un hilo.

## Do's and Don'ts

### Do:
- **Do** apoyar todo sobre papel de algodón y separar con hilos de 1px.
- **Do** reservar el azul de Prusia sólido para la acción y el estado elegido.
- **Do** usar la lámina de emulsión como única superficie azul grande, con los helechos siempre adentro; en el celular, helechos abajo en las esquinas y aire abajo en la lámina.
- **Do** escribir los títulos en Bodoni Moda itálica: `opsz 96` y 400 sólo en los h1 sobre lámina, `opsz 24` en todo lo demás (500 en títulos, 400 en cifras).
- **Do** anotar las fotos como un catálogo: versalitas espaciadas y cifras tabulares ("TOMA 001 · PRUEBA", "$ 5.000").
- **Do** hablar en voseo con vocabulario de laboratorio: "Tus copias", "Elegida", "Recién reveladas".
- **Do** animar con la curva de salida suave (`cubic-bezier(0.16, 1, 0.3, 1)`) y apagar todo con `prefers-reduced-motion`.

### Don't:
- **Don't** encerrar contenido en tarjetas con borde ni sombras duras o desplazadas; las únicas cajas son la zona de carga y la hoja de checkout.
- **Don't** pintar bloques planos de azul de Prusia ni usarlo como decoración.
- **Don't** sacar un helecho fuera de la emulsión ni ponerlo sobre el papel.
- **Don't** usar la Bodoni en redonda ni la Hanken para títulos.
- **Don't** volver al mundo "Foto Express": nada de rojo cartel, stickers ámbar, fondo azul noche, Archivo ni Permanent Marker.
- **Don't** poner texto en tonos más claros que la tinta tenue.

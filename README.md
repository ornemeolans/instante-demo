# Instante · venta de fotos de eventos

Plataforma para que fotógrafos de eventos vendan sus fotos online: el fotógrafo sube las fotos,
la plataforma publica una galería con **vistas previas protegidas con marca de agua**, el cliente
elige y paga con **Mercado Pago**, y recibe por correo un **enlace de descarga que vence** con los
originales en alta resolución.

**Demo en vivo:** https://instante-photografy.netlify.app
*(demo de portfolio: los pagos son de prueba y no hay cobros reales)*

## Probala en 2 minutos

**Como fotógrafo (sin registrarte)**
1. Entrá a la demo → **Soy fotógrafo** → **Entrar con la cuenta demo**.
2. Creá un evento, subí fotos y tocá **Publicar galería**.

**Como cliente**
1. Abrí una galería publicada (desde "Recién reveladas" en la portada).
2. Elegí fotos → **Ver mis copias** → **Pagar con Mercado Pago**.
3. En el checkout de la demo están el usuario comprador de prueba, la tarjeta de prueba
   (titular `APRO`) y el código de verificación.
4. Al terminar llega el correo con el enlace de descarga, y la venta aparece en el panel.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript · SSR para galerías, componentes cliente para selección y carrito |
| Auth y datos | Firebase Authentication + Firestore (acceso solo desde el servidor con el Admin SDK) |
| Archivos | Supabase Storage (demo) o Firebase Storage, con la misma interfaz (`src/lib/storage.ts`) |
| Imágenes | `sharp` en el servidor: vistas previas de 1000 px con marca de agua en capas |
| Pagos | Mercado Pago Checkout Pro + webhook con firma verificada |
| Entrega | URLs firmadas con vencimiento + correo (Nodemailer / SMTP) |
| Deploy | Netlify (funciones serverless) |

## Arquitectura

```
Fotógrafo                      Servidor (Next.js)                    Servicios
─────────                      ──────────────────                    ─────────
login ── idToken ───────────▶  /api/auth/session → cookie httpOnly
pide URL de subida ─────────▶  /api/events/:id/photos/upload-url ──▶ URL firmada (bucket privado)
sube el ORIGINAL directo ───────────────────────────────────────────▶ originals/… (privado)
avisa ──────────────────────▶  /api/events/:id/photos
                               descarga el original → sharp → marca
                               de agua → previews/ y thumbs/ ───────▶ bucket público

Cliente
───────
/e/:slug (SSR) → elige fotos (carrito en localStorage)
Pagar ──────────────────────▶  /api/checkout: precio calculado en el
                               servidor, pedido "pending" ──────────▶ preferencia de Mercado Pago
Checkout Pro ◀── init_point
                               /api/webhooks/mercadopago ◀─────────── MP avisa (firma x-signature)
                               consulta el pago a la API de MP, valida
                               el monto, marca "paid", genera token ──▶ correo con enlace
Correo → /descarga/:token ──▶  URLs firmadas que vencen en 48 h
```

## Decisiones de seguridad

- **El original nunca llega al navegador.** Las galerías solo muestran vistas previas de 1000 px con
  marca de agua. Los originales están en un bucket privado y solo se entregan con URLs firmadas
  que vencen, después de un pago aprobado.
- **Marca de agua difícil de borrar con IA:** cuatro capas (nombre en dos diagonales, tramado fino y
  sello central), con ángulos y posiciones que cambian en cada foto. El texto se dibuja como trazos
  vectoriales con una fuente embebida, para que se vea igual en cualquier servidor.
- **El precio lo calcula el servidor.** El navegador solo envía qué fotos quiere.
- **El webhook no se confía en sí mismo:** verifica la firma `x-signature` (HMAC) y además vuelve a
  consultar el pago a la API de Mercado Pago antes de entregar.
- **Entrega idempotente:** webhook, página de retorno y conciliación usan la misma función; una
  reserva atómica en Firestore evita correos duplicados.
- **Token de descarga** de 256 bits aleatorios; en la base se guarda solo su hash SHA-256.
- **Firestore cerrado** para el navegador (`allow read, write: if false`); todo pasa por el servidor.
- **Sesión con cookie httpOnly** (session cookie de Firebase), no tokens en `localStorage`.

## Cómo se hizo

Definí los requisitos y la arquitectura: el stack, qué se renderiza en el servidor y qué en el
cliente, la protección de los originales con marca de agua y la entrega con enlaces que vencen.
El código lo desarrollé con **[Claude Code](https://claude.com/claude-code) como asistente**. Revisé
y probé cada parte, la desplegué y resolví los problemas de producción (compatibilidad de módulos en
las funciones de Netlify, fuentes ausentes en el servidor para la marca de agua).

## Correr en local

Usa los **emuladores de Firebase** (gratis, sin cuenta): necesitás Node 20+ y Java 21.

```bash
npm install
cp .env.emulators.example .env.local
npm run emulators     # en una terminal
npm run dev           # en otra
```

Para publicarla: [DEPLOY-NETLIFY.md](DEPLOY-NETLIFY.md). El sistema visual está en [DESIGN.md](DESIGN.md).

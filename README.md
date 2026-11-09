# Fotoventa — venta de fotos de eventos

Next.js 16 (App Router, TypeScript) + Firebase (Auth, Firestore, Storage) + sharp + Mercado Pago Checkout Pro.

## Flujo completo

```
Fotógrafo                      Servidor Next.js                     Firebase / MP
─────────                      ────────────────                     ─────────────
/login ── idToken ──────────▶  /api/auth/session ── cookie httpOnly
/dashboard: crea evento ─────▶ server action createEvent ─────────▶ Firestore events/
Sube original ──────────────────────────────────────────────────▶  Storage originals/{uid}/… (privado)
avisa ──────────────────────▶  /api/events/:id/photos
                               descarga original → sharp 1000px +
                               marca en mosaico → previews/ thumbs/ ▶ Storage (URL con token)

Cliente
───────
/e/:slug (SSR) → elige fotos (carrito en localStorage)
"Pagar" ────────────────────▶  /api/checkout: precio calculado en
                               servidor, pedido "pending" ─────────▶ preferencia MP
Checkout Pro ◀── init_point
                               /api/webhooks/mercadopago ◀────────── MP notifica (firma x-signature)
                               fulfillPayment(): consulta el pago a
                               la API, valida monto, marca "paid",
                               token (solo hash en DB) → correo
/pago/resultado ────────────▶  misma fulfillPayment() (idempotente)
Correo → /descarga/:token ──▶  URLs firmadas V4 (vencen en 24–48 h)
```

## Decisiones de seguridad

- **Los originales nunca llegan al navegador**: `storage.rules` solo permite al dueño *crear* en `originals/{uid}/…`; nadie puede leer. La entrega usa URLs firmadas que genera el servidor.
- **Firestore cerrado** (`allow read, write: if false`): todo pasa por el Admin SDK en el servidor.
- **El precio lo calcula el servidor**; el navegador solo manda IDs de fotos.
- **Webhook verificado** con `WebhookSignatureValidator` del SDK y, además, el pago se vuelve a consultar a la API de MP (nunca se confía en el body).
- **Entrega idempotente**: webhook y página de retorno llaman a la misma función; una reserva atómica (`emailClaimedAt`) evita correos duplicados.
- **Token de descarga**: 256 bits aleatorios; en Firestore se guarda solo su SHA-256.
- Las vistas previas pierden EXIF/GPS (sharp no copia metadatos).

## Puesta en marcha

### 1. Proyecto de Firebase

En la [consola de Firebase](https://console.firebase.google.com): crear proyecto → activar **Authentication** (Correo/contraseña y Google), **Firestore** y **Storage**. Registrar una app web (para las variables `NEXT_PUBLIC_*`) y generar una clave privada en *Cuentas de servicio* (para las de Admin).


### 2. Variables de entorno

```bash
copy .env.example .env.local
```

Completá `.env.local` con tus valores.

### 3. Reglas e índices

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

```bash
firebase use --add
```

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 4. Desarrollo

```bash
npm install
```

```bash
npm run dev
```

Probar la marca de agua sin Firebase (deja el resultado en `scripts/out/`):

```bash
npm run test:watermark -- C:\ruta\a\foto.jpg "Tu Nombre"
```

### 5. Mercado Pago en local

Mercado Pago solo notifica a URLs **https públicas**. En local, exponé el puerto 3000 con un túnel y usá esa URL como `APP_URL`:

```bash
npx cloudflared tunnel --url http://localhost:3000
```

Luego, en *Tus integraciones → Webhooks*: URL `https://<tu-túnel>/api/webhooks/mercadopago`, evento **Pagos**, y copiá la clave secreta a `MP_WEBHOOK_SECRET`. Usá credenciales y **usuarios de prueba** (comprador y vendedor) para pagar.

### 6. Producción (Vercel)

Cargá las mismas variables en el proyecto de Vercel con `APP_URL=https://tu-dominio`. La subida de originales va directo a Storage, así que no la afecta el límite de 4,5 MB del body de las funciones.

## Estructura

```
src/
  app/
    page.tsx                      landing estática
    login/                        login/registro (cliente)
    dashboard/                    panel (requiere sesión)
      actions.ts                  server actions: eventos, fotos, perfil, reenvío
      eventos/[eventId]/          detalle + Uploader + ventas del evento
      ventas/                     resumen de ventas por evento
      perfil/                     nombre y texto de marca de agua
    e/[slug]/                     galería pública SSR + carrito (cliente)
    pago/resultado/               back_url de Checkout Pro
    descarga/[token]/             descarga segura
    api/
      auth/session                cookie de sesión
      events/[eventId]/photos     procesado con sharp
      checkout                    crea pedido + preferencia
      webhooks/mercadopago        webhook firmado
  lib/
    images/watermark.ts           sharp + SVG en mosaico
    fulfillment.ts                confirmación de pago y entrega
    firebase/ storage.ts email.ts mercadopago.ts events.ts sales.ts
```

## Pendientes sugeridos

- Descarga de todas las fotos en un `.zip`.
- Búsqueda por número de dorsal / reconocimiento facial en eventos grandes.
- Precios por paquete (p. ej. 5 fotos con descuento).
- Comisión de la plataforma con Mercado Pago Marketplace (split de pagos por fotógrafo).

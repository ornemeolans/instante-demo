# Publicar la demo de portfolio (gratis, sin tarjeta)

| Pieza | Servicio | Plan |
|---|---|---|
| Web (Next.js) | Vercel | Hobby (gratis) |
| Login y datos | Firebase Auth + Firestore | Spark (gratis) |
| Fotos | Supabase Storage | Free (1 GB) |
| Pagos | Mercado Pago | Credenciales de prueba |
| Correo | Gmail (contraseña de aplicación) | Gratis |

Con `NEXT_PUBLIC_DEMO_MODE=true` el sitio muestra una franja de "Demo de portfolio" y limita
cada cuenta a **3 eventos**, **20 fotos por evento** y **15 MB por foto**.

---

## 1. Firebase (plan Spark)

1. https://console.firebase.google.com → **Crear proyecto** (sin Analytics). Queda en plan Spark: no pide tarjeta.
2. **Authentication** → Comenzar → activar **Correo/contraseña** y **Google**.
3. **Firestore Database** → Crear → `southamerica-east1` → modo **producción**.
4. **No** actives Storage (las fotos van a Supabase).
5. ⚙️ Configuración → **Tus apps** → `</>` → registrar app web → copiar los valores `NEXT_PUBLIC_FIREBASE_*`.
6. ⚙️ Configuración → **Cuentas de servicio** → **Generar nueva clave privada** → de ese JSON salen
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`. Guardalo fuera del proyecto.
7. Publicar reglas e índices de Firestore (desde la carpeta del proyecto):

```bash
npx firebase login
```

```bash
npx firebase use --add
```

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

## 2. Supabase (fotos)

1. https://supabase.com → **New project** (región São Paulo). No pide tarjeta.
2. **Project Settings → API**: copiar **Project URL** (`SUPABASE_URL`) y la clave **service_role**
   (`SUPABASE_SERVICE_ROLE_KEY`). La service_role es secreta: solo va en el servidor, nunca en `NEXT_PUBLIC_*`.
3. Crear `.env.demo` a partir de `.env.demo.example`, completar al menos esas dos y crear los buckets:

```bash
copy .env.demo.example .env.demo
```

```bash
npm run setup:supabase
```

Crea `originals` (privado) y `media` (público, solo vistas previas con marca de agua).

## 3. Vercel

1. Subí el proyecto a un repositorio de GitHub (puede ser privado).
2. https://vercel.com → **Add New → Project** → importar el repositorio. Framework: Next.js (se detecta solo).
3. En **Environment Variables** cargá todas las de `.env.demo.example` con tus valores.
   - `FIREBASE_PRIVATE_KEY`: pegala tal cual viene en el JSON (con los `\n`).
   - `APP_URL`: la URL que te asigne Vercel (p. ej. `https://fotoventa-demo.vercel.app`). Si todavía no
     la sabés, deployá una vez, copiala, actualizá la variable y volvé a deployar.
4. **Deploy**.
5. En Firebase → Authentication → Configuración → **Dominios autorizados** → agregar el dominio de Vercel
   (sin esto, el login con Google falla).

## 4. Mercado Pago (prueba)

1. En tu aplicación de Mercado Pago → **Webhooks** → URL `https://TU-APP.vercel.app/api/webhooks/mercadopago`,
   evento **Pagos**, modo **prueba**. Copiá la clave secreta a `MP_WEBHOOK_SECRET` en Vercel y redeployá.
2. **Cuentas de prueba** → creá un **comprador** y cargá su usuario y contraseña en
   `NEXT_PUBLIC_DEMO_MP_BUYER_USER` / `NEXT_PUBLIC_DEMO_MP_BUYER_PASS`: se muestran en el checkout para que
   los visitantes puedan pagar. Es una cuenta ficticia, pero **no reutilices esa contraseña en ningún otro lado**.

En producción (https) Mercado Pago sí avisa por webhook y redirige solo al terminar el pago.

## 5. Probar

1. Abrí la URL de Vercel → **Soy fotógrafo** → creá una cuenta → creá un evento → subí fotos → publicá.
2. En incógnito, entrá a la galería, comprá con la cuenta compradora de prueba y la tarjeta `APRO`.
3. Te llega el correo con el enlace de descarga.

## Mantenimiento

- **Límites gratuitos**: Supabase 1 GB de archivos; Firestore 50 000 lecturas/día; Vercel Hobby es solo para
  uso no comercial (ideal para portfolio).
- **Limpiar la demo**: borrá carpetas viejas en Supabase → Storage y documentos en Firestore desde sus consolas.
- **Gmail** limita a ~500 correos por día; para un uso real conviene Resend o Brevo con dominio propio.

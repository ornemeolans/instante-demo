# Publicar la demo de Instante en Netlify (gratis, sin tarjeta)

Lo que ves en `localhost` usa los **emuladores** de Firebase, que existen solo en tu PC. Para que
otras personas lo prueben desde internet, la demo usa servicios reales en sus planes gratuitos:

| Pieza | Servicio | Plan |
|---|---|---|
| Web (Next.js) | **Netlify** | Starter (gratis) |
| Login y datos | **Firebase** Authentication + Firestore | Spark (gratis, sin tarjeta) |
| Fotos | **Supabase** Storage | Free (1 GB) |
| Pagos | **Mercado Pago** | Credenciales de prueba |
| Correo | **Gmail** con contraseña de aplicación | Gratis |

Con `NEXT_PUBLIC_DEMO_MODE=true` se ve el aviso "Demo de portfolio" en todas las páginas y cada
cuenta queda limitada a 3 eventos, 20 fotos por evento y 15 MB por foto.

Hacé los pasos en orden. Todos los comandos van en una terminal abierta en la carpeta del proyecto
(`C:\Users\ornel\Documents\fotoventa`).

---

## Paso 1 · Firebase (login y datos)

1. Entrá a https://console.firebase.google.com → **Crear un proyecto** → nombre `instante-demo` →
   sin Google Analytics. Queda en plan **Spark**: no pide tarjeta.
2. **Compilación → Authentication → Comenzar** → activá **Correo electrónico/contraseña** y **Google**.
3. **Compilación → Firestore Database → Crear base de datos** → ubicación `southamerica-east1`
   → **modo producción**.
4. **No actives Storage**: las fotos van a Supabase.
5. ⚙️ **Configuración del proyecto → General → Tus apps → `</>`** → registrá la app web (sin Hosting).
   Copiá los valores de `firebaseConfig`: van a las variables `NEXT_PUBLIC_FIREBASE_*`.
6. ⚙️ **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**. Se descarga
   un JSON: de ahí salen `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`.
   Guardalo **fuera** de la carpeta del proyecto y no lo compartas.

Publicá las reglas de seguridad y los índices. Iniciá sesión (se abre el navegador):

```bash
npx firebase login
```

Elegí el proyecto `instante-demo` y poné `default` como alias:

```bash
npx firebase use --add
```

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

## Paso 2 · Supabase (fotos)

1. Entrá a https://supabase.com → **New project** → nombre `instante-demo`, región **South America
   (São Paulo)**, inventá una contraseña de base de datos (no la vas a usar). No pide tarjeta.
2. **Project Settings → API**: copiá la **Project URL** (`SUPABASE_URL`) y la clave **service_role**
   (`SUPABASE_SERVICE_ROLE_KEY`). La service_role es **secreta**: nunca va en una variable `NEXT_PUBLIC_*`.
3. Creá tu archivo de variables de la demo a partir de la plantilla:

```bash
copy .env.demo.example .env.demo
```

4. Abrí `.env.demo` y completá **todo** con los valores de los pasos 1 y 2 y los de Mercado Pago y
   Gmail que ya tenés en `.env.local`. Dejá `APP_URL` como está por ahora.
5. Creá las carpetas de fotos en Supabase (`originals` privada y `media` pública):

```bash
npm run setup:supabase
```

Tiene que decir `✔ bucket "originals" creado` y `✔ bucket "media" creado`.

## Paso 3 · Subir el código a GitHub

Netlify publica desde un repositorio. Puede ser **privado**. Los archivos `.env*` con tus claves
no se suben (están en `.gitignore`). Si querés, este paso lo hago yo; si no:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Instante: demo de portfolio"
```

```bash
gh repo create instante-demo --private --source . --push
```

## Paso 4 · Netlify

1. Entrá a https://app.netlify.com → registrate con **GitHub**.
2. **Add new project → Import an existing project → GitHub** → autorizá y elegí `instante-demo`.
3. En la configuración del build dejá lo que detecta solo (lo fija `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Antes de publicar, tocá **Add environment variables → Import from a .env file** y pegá **todo
   el contenido de tu `.env.demo`**. Revisá que `FIREBASE_PRIVATE_KEY` quedó entre comillas y con
   los `\n` tal cual.
5. **Deploy**. El primer build tarda unos minutos. Al terminar te da una dirección del tipo
   `https://instante-demo.netlify.app` (podés cambiar el nombre en **Project configuration →
   Change project name**).
6. Volvé a **Project configuration → Environment variables**, cambiá `APP_URL` por esa dirección
   (sin barra al final) y hacé **Deploys → Trigger deploy → Deploy site**.

> Si el build falla con un error de **tamaño de variables de entorno** (las funciones tienen un
> límite de 4 KB en total), editá cada variable `NEXT_PUBLIC_*` y cambiá su **Scope** a solo
> **Builds**: el navegador las recibe igual, porque se incrustan al compilar.

## Paso 5 · Conectar las piezas

1. **Firebase → Authentication → Configuración → Dominios autorizados → Agregar dominio** →
   `instante-demo.netlify.app`. Sin esto, el login con Google no funciona.
2. **Mercado Pago → Tus integraciones → tu aplicación → Webhooks → Configurar notificaciones**:
   - URL de **modo prueba**: `https://instante-demo.netlify.app/api/webhooks/mercadopago`
   - Evento: **Pagos**
   - Guardá y copiá la **clave secreta** a la variable `MP_WEBHOOK_SECRET` en Netlify.
3. **Mercado Pago → Cuentas de prueba**: copiá el usuario y la contraseña de tu **comprador de
   prueba** en `NEXT_PUBLIC_DEMO_MP_BUYER_USER` y `NEXT_PUBLIC_DEMO_MP_BUYER_PASS` (se muestran en el
   checkout para que los visitantes puedan pagar), y en `NEXT_PUBLIC_DEMO_MP_BUYER_CODE` los últimos 6
   dígitos de su **ID de usuario** (el código de verificación que pide al iniciar sesión). Es una cuenta ficticia: no reutilices esa
   contraseña en ningún otro lado.
4. **Trigger deploy** otra vez para que tome las variables nuevas.

En internet (https) Mercado Pago sí avisa por webhook y vuelve solo al sitio al terminar el pago.

## Paso 6 · Probar la demo publicada

1. Abrí tu dirección de Netlify → **Soy fotógrafo** → creá una cuenta.
2. Creá un evento, subí 5–10 fotos lindas y **publicá la galería**: la landing las muestra en
   "Recién reveladas".
3. En una ventana de incógnito, abrí la galería, elegí fotos → **Ver mis copias** → pagá con la
   cuenta compradora de prueba y una tarjeta de prueba con titular **APRO**.
4. Te llega el correo con el enlace de descarga, y la venta aparece en **Ventas**.

## Si algo falla

- **Netlify → Logs → Functions** muestra los errores del servidor (login, subida, pago).
- **"Falta la variable de entorno …"**: falta cargarla en Netlify o tiene un error de tipeo.
- **El login con Google no abre**: falta el dominio autorizado en Firebase (paso 5.1).
- **Una foto queda en "procesando" y da error**: probá con un JPG más liviano; las funciones del
  plan gratuito tienen un tiempo máximo por pedido.

## Límites del plan gratuito

Supabase: 1 GB de fotos · Firestore: 50 000 lecturas/día · Netlify: 300 minutos de build y 100 GB
de transferencia por mes · Gmail: unos 500 correos por día. Para una demo de portfolio sobra.
Para limpiarla: borrá carpetas en **Supabase → Storage** y documentos en **Firestore**.

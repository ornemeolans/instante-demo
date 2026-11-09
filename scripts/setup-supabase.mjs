// Crea (o actualiza) los buckets de Supabase Storage que usa la demo.
//   node --env-file=.env.demo scripts/setup-supabase.mjs
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.demo");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const buckets = [
  {
    id: "originals",
    // Privado: solo se accede con URLs firmadas que genera el servidor.
    options: {
      public: false,
      fileSizeLimit: "15MB",
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/tiff"],
    },
  },
  {
    id: "media",
    // Público: solo vistas previas y miniaturas CON marca de agua.
    options: { public: true, fileSizeLimit: "5MB", allowedMimeTypes: ["image/jpeg"] },
  },
];

const { data: existing, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("✘ No se pudo conectar:", listError.message);
  process.exit(1);
}

for (const { id, options } of buckets) {
  const found = existing.some((b) => b.id === id);
  const { error } = found
    ? await supabase.storage.updateBucket(id, options)
    : await supabase.storage.createBucket(id, options);
  if (error) {
    console.error(`✘ ${id}:`, error.message);
    process.exit(1);
  }
  console.log(`✔ bucket "${id}" ${found ? "actualizado" : "creado"} (${options.public ? "público" : "privado"})`);
}

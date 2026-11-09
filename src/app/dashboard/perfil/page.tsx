import { requirePhotographer } from "@/lib/auth/session";
import { ProfileForm } from "../forms";

export const metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const { photographer } = await requirePhotographer();
  return (
    <div className="stack" style={{ maxWidth: 520 }}>
      <h1 className="display-type">Perfil</h1>
      <p className="muted">
        El texto de la marca de agua se repite en capas sobre todas tus vistas previas. Si lo cambiás,
        usá “Regenerar vistas previas” en cada evento para aplicarlo a las fotos que ya subiste.
      </p>
      <ProfileForm displayName={photographer.displayName} watermarkText={photographer.watermarkText} />
    </div>
  );
}

import { requirePhotographer } from "@/lib/auth/session";
import { Wordmark } from "@/components/Wordmark";
import { DashNav } from "./DashNav";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePhotographer();
  return (
    <div className="dash">
      <header className="dash-header">
        <Wordmark href="/dashboard" />
        <DashNav />
        <div className="dash-user">
          <span>{user.photographer.displayName}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="dash-main">{children}</main>
    </div>
  );
}

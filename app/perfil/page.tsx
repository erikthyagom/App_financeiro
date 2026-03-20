import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "../actions/auth";
import { User as UserIcon, Tag } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Perfil | Organizze",
};

export default async function PerfilPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="card" style={{ width: "100%", maxWidth: "800px", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* User Info Header */}
        <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", color: "#94a3b8", overflow: "hidden" }}>
          <UserIcon size={64} strokeWidth={1.5} style={{ marginTop: "1.5rem" }} />
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>
          {user.name}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "1rem" }}>
          {user.email}
        </p>

        <Link href="#" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Atualizar perfil
        </Link>

        <p style={{ fontSize: "0.875rem", color: "var(--foreground)", fontWeight: 500, marginBottom: "3rem" }}>
          Você está no <span style={{ color: "var(--primary)", borderBottom: "1px dashed var(--primary)", paddingBottom: "2px" }}>Plano Manual</span>
        </p>

        <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border)", marginBottom: "3rem" }}></div>

        {/* Workspaces / Spaces Section */}
        <div style={{ width: "100%", textAlign: "left" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 0" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></div>
            <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "1rem" }}>{user.name}</span>
            <Tag size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          </div>
        </div>

      </div>
    </div>
  );
}

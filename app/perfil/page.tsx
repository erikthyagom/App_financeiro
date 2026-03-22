import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "../actions/auth";
import { User as UserIcon, Tag } from "lucide-react";
import Link from "next/link";

import PerfilClient from "./PerfilClient";

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
      <PerfilClient user={user as any} />
    </div>
  );
}

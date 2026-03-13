"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className={isAuthPage ? "" : "layout-container"}>
      {!isAuthPage && <Sidebar />}
      <main className={isAuthPage ? "" : "main-content main-content-shifted"}>
        {children}
      </main>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className={isAuthPage ? "" : "layout-container"}>
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "" : "main-content"}>
        {children}
      </main>
    </div>
  );
}

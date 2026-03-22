"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { DialogProvider } from "@/components/DialogProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/reset-password";

  return (
    <DialogProvider>
      <div className={isAuthPage ? "" : "layout-container"}>
        {!isAuthPage && <Navbar />}
        <main className={isAuthPage ? "" : "main-content"}>
          {children}
        </main>
      </div>
    </DialogProvider>
  );
}

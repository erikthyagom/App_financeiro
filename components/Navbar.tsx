"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell, User, LayoutDashboard, Wallet, CreditCard, PieChart, Layers } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "visão geral", href: "/" },
    { name: "lançamentos", href: "/receitas" }, // Map to incomes/expenses for now
    { name: "relatórios", href: "/relatorios" },
    { name: "contas", href: "/contas" },
    { name: "cartões", href: "/cartoes" },
    { name: "categorias", href: "/categorias" },
  ];

  return (
    <header style={{ 
      backgroundColor: "var(--primary)", 
      color: "white", 
      height: "var(--navbar-height)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 50
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.25rem" }}>
        <div style={{ width: "24px", height: "24px", backgroundColor: "white", borderRadius: "50%", opacity: 0.8 }}></div>
        <span>organizze</span>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: "flex", height: "100%" }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 1rem",
                color: "white",
                textDecoration: "none",
                fontSize: "0.875rem",
                position: "relative",
                opacity: isActive ? 1 : 0.8,
                fontWeight: isActive ? 600 : 400
              }}
            >
              {link.name}
              {isActive && (
                <div style={{ 
                  position: "absolute", 
                  bottom: "0", 
                  left: "10%", 
                  right: "10%", 
                  height: "3px", 
                  backgroundColor: "white", 
                  borderTopLeftRadius: "3px", 
                  borderTopRightRadius: "3px" 
                }}></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <button style={{ background: "none", border: "none", color: "white", cursor: "pointer", opacity: 0.9 }}>
          <Settings size={20} />
        </button>
        <button style={{ background: "none", border: "none", color: "white", cursor: "pointer", position: "relative", opacity: 0.9 }}>
          <Bell size={20} />
          <span style={{ 
            position: "absolute", 
            top: "-5px", 
            right: "-5px", 
            backgroundColor: "white", 
            color: "var(--primary)", 
            fontSize: "0.6rem", 
            fontWeight: 700, 
            width: "14px", 
            height: "14px", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>2</span>
        </button>
        <button style={{ background: "none", border: "none", color: "white", cursor: "pointer", opacity: 0.9 }}>
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

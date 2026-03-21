"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell, User, LayoutDashboard, Wallet, CreditCard, PieChart, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getCurrentUser, logout } from "@/app/actions/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser().then(res => {
      // In case the response is null it will just set null.
      if (res) setUser({ name: res.name, email: res.email });
    });
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setIsSettingsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "visão geral", href: "/" },
    { name: "lançamentos", href: "/lancamentos" },
    { name: "relatórios", href: "/relatorios" },
    { name: "contas", href: "/contas" },
    { name: "cartões", href: "/cartoes" },
    { name: "categorias", href: "/categorias" },
  ];

  return (
    <>
      <style>{`
      .nav-scroll::-webkit-scrollbar { display: none; }
      .nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      .nav-items { justify-content: center; }
      @media (max-width: 768px) {
        .mobile-header { padding: 0 1rem !important; }
        .brand-text { display: none !important; }
        .nav-items { margin: 0 0.5rem !important; justify-content: flex-start; }
      }
    `}</style>
      <header className="mobile-header" style={{
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.25rem", flexShrink: 0 }}>
          <div style={{ width: "24px", height: "24px", backgroundColor: "white", borderRadius: "50%", opacity: 0.8 }}></div>
          <span className="brand-text">FinApp</span>
        </div>

        {/* Navigation Links */}
        <nav className="nav-scroll nav-items" style={{
          display: "flex",
          height: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          margin: "0 2rem",
          flex: 1
        }}>
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
                  whiteSpace: "nowrap",
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

          {/* Settings / Dropdown */}
          <div
            style={{ position: "relative" }}
            ref={settingsDropdownRef}
            onMouseEnter={() => setIsSettingsDropdownOpen(true)}
            onMouseLeave={() => setIsSettingsDropdownOpen(false)}
          >
            <button
              onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
              style={{
                background: "none", border: "none", color: "white", cursor: "pointer",
                opacity: isSettingsDropdownOpen ? 1 : 0.9,
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "50%",
                backgroundColor: isSettingsDropdownOpen ? "rgba(255,255,255,0.2)" : "transparent",
                transition: "background-color 0.2s"
              }}
            >
              <Settings size={22} />
            </button>

            {isSettingsDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                paddingTop: "12px",
                right: "-10px",
                width: "220px",
                zIndex: 100
              }}>
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  color: "var(--foreground)",
                  position: "relative",
                  padding: "0.5rem 0"
                }}>
                  {/* Arrow / Triângulo */}
                  <div style={{
                    position: "absolute",
                    top: "-6px",
                    right: "22px",
                    width: "12px",
                    height: "12px",
                    backgroundColor: "white",
                    transform: "rotate(45deg)",
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    borderLeft: "1px solid rgba(0,0,0,0.05)",
                  }}></div>

                  {/* Group 1 */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Link href="/categorias" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--foreground)", textDecoration: "none", fontWeight: 500 }}>
                      Categorias
                    </Link>
                    <Link href="/contas" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--foreground)", textDecoration: "none", fontWeight: 500 }}>
                      Contas
                    </Link>
                    <Link href="/cartoes" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--foreground)", textDecoration: "none", fontWeight: 500 }}>
                      Cartões de crédito
                    </Link>
                  </div>

                  <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border)", margin: "0.5rem 0" }}></div>

                  {/* Group 2 */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Link href="#" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
                      Preferências
                    </Link>
                    <Link href="#" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
                      Meu Plano
                    </Link>
                    <Link href="#" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
                      Tags
                    </Link>
                    <Link href="#" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
                      Alertas
                    </Link>
                    <Link href="#" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
                      Atividades
                    </Link>
                  </div>

                  <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border)", margin: "0.5rem 0" }}></div>

                  {/* Group 3 */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Link href="#" onClick={() => setIsSettingsDropdownOpen(false)} style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
                      mais opções
                    </Link>
                  </div>

                </div>
              </div>
            )}
          </div>

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
          {/* User Profile / Dropdown */}
          <div
            style={{ position: "relative" }}
            ref={dropdownRef}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <Link
              href="/perfil"
              onClick={() => setIsDropdownOpen(false)}
              style={{
                background: "none", border: "none", color: "white", cursor: "pointer",
                opacity: isDropdownOpen ? 1 : 0.9,
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "50%",
                backgroundColor: isDropdownOpen ? "rgba(255,255,255,0.2)" : "transparent",
                transition: "background-color 0.2s",
                textDecoration: "none"
              }}
            >
              <User size={22} />
            </Link>

            {isDropdownOpen && user && (
              <div style={{
                position: "absolute",
                top: "100%", // Start immediately below the button 
                paddingTop: "12px", // Invisible bridge to prevent pointer leaving gap
                right: "-10px",
                width: "220px",
                zIndex: 100
              }}>
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  color: "var(--foreground)",
                  position: "relative"
                }}>
                  {/* Arrow / Triângulo */}
                  <div style={{
                    position: "absolute",
                    top: "-6px",
                    right: "22px",
                    width: "12px",
                    height: "12px",
                    backgroundColor: "white",
                    transform: "rotate(45deg)",
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    borderLeft: "1px solid rgba(0,0,0,0.05)",
                  }}></div>

                  {/* Header do Perfil */}
                  <div style={{ padding: "1.5rem 1rem 1rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: "#94a3b8", overflow: "hidden" }}>
                      <User size={48} strokeWidth={1.5} style={{ marginTop: "1rem" }} />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--foreground)", marginBottom: "0.25rem", textAlign: "center" }}>{user.name}</p>
                  </div>

                  {/* Links de Ação */}
                  <div style={{ padding: "0.5rem 0", display: "flex", flexDirection: "column" }}>
                    <Link href="#" onClick={() => setIsDropdownOpen(false)} style={{ padding: "0.75rem 0", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
                      Minha conta
                    </Link>
                    <form action={logout} style={{ width: "100%", display: "flex" }}>
                      <button
                        type="submit"
                        style={{ flex: 1, padding: "0.75rem 0", fontSize: "0.875rem", color: "var(--text-muted)", background: "none", border: "none", textAlign: "center", cursor: "pointer", fontWeight: 600 }}
                      >
                        Sair
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

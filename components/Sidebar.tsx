"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  WalletCards, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  LayoutDashboard,
  Tags,
  Menu,
  X,
  Wallet,
  LogOut
} from "lucide-react";
import { useState } from "react";
import styles from "./Sidebar.module.css";
import { logout } from "../app/actions/auth";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receitas", label: "Receitas", icon: ArrowUpCircle },
  { href: "/despesas", label: "Despesas", icon: ArrowDownCircle },
  { href: "/contas", label: "Contas", icon: Wallet },
  { href: "/cartoes", label: "Cartões", icon: WalletCards },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Esconder a sidebar se estiver na pagina de login ou registro
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <>
      <button 
        className={styles.mobileMenuButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className={styles.iconWrapper}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>$</span>
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>Finanças</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} className={styles.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
           <form action={logout}>
            <button 
              type="submit" 
              className={styles.navItem} 
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <LogOut size={20} className={styles.icon} />
              <span>Sair</span>
            </button>
           </form>
        </div>
      </div>
    </>
  );
}

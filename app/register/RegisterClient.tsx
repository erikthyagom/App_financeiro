"use client";

import { useState } from "react";
import { register } from "../actions/auth";
import { Wallet, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterClient() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await register(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="card glass" style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem" }}>
        
        <div style={{ padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "16px", color: "var(--success)", marginBottom: "1.5rem" }}>
          <Wallet size={36} />
        </div>
        
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Criar nova conta</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", textAlign: "center", fontSize: "0.875rem" }}>Organize suas finanças criando uma conta grátis.</p>

        {error && (
          <div style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Nome completo</label>
            <input 
              type="text" 
              name="name"
              className="input" 
              placeholder="Zeca Pagodinho"
              required
              style={{ padding: "0.875rem" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
            <input 
              type="email" 
              name="email"
              className="input" 
              placeholder="seu@email.com"
              required
              style={{ padding: "0.875rem" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Senha</label>
            <input 
              type="password" 
              name="password"
              className="input" 
              placeholder="Crie uma senha forte"
              required
              minLength={6}
              style={{ padding: "0.875rem" }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Cadastrar <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Já tem uma conta? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Entrar</Link>
        </p>

      </div>
    </div>
  );
}

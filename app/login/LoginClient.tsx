"use client";

import { useState } from "react";
import { login } from "../actions/auth";
import { Wallet, ArrowRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginClient() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const router = useRouter();

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoveryLoading(true);
    // Simula uma chamada de API para recuperação de senha
    setTimeout(() => {
      setRecoveryLoading(false);
      setRecoverySent(true);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // If successful, the action will redirect
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="card glass" style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem" }}>
        
        <div style={{ padding: "1rem", backgroundColor: "rgba(79, 70, 229, 0.1)", borderRadius: "16px", color: "var(--primary)", marginBottom: "1.5rem" }}>
          <Wallet size={36} />
        </div>
        
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Bem-vindo de volta</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", textAlign: "center", fontSize: "0.875rem" }}>Entre com sua conta para acessar seu controle financeiro.</p>

        {error && (
          <div style={{ width: "100%", padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ display: "block", marginBottom: 0 }}>Senha</label>
              <button 
                type="button" 
                onClick={() => setIsRecoveryOpen(true)}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", padding: 0 }}
              >
                Esqueceu a senha?
              </button>
            </div>
            <input 
              type="password" 
              name="password"
              className="input" 
              placeholder="••••••••"
              required
              style={{ padding: "0.875rem" }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Entrar <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Não possui uma conta? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Cadastre-se</Link>
        </p>
      </div>

      {/* Password Recovery Modal */}
      {isRecoveryOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div className="card glass" style={{ width: "100%", maxWidth: "400px", position: "relative", padding: "2.5rem 2rem" }}>
            <button 
              onClick={() => { setIsRecoveryOpen(false); setRecoverySent(false); setRecoveryEmail(""); }}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Recuperar Senha</h2>
            
            {recoverySent ? (
               <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <div style={{ color: "var(--success)", marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <p style={{ color: "var(--foreground)", marginBottom: "1.5rem" }}>Instruções de recuperação foram enviadas para <strong>{recoveryEmail}</strong>.</p>
                  <button type="button" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem" }} onClick={() => setIsRecoveryOpen(false)}>
                    Voltar para o Login
                  </button>
               </div>
            ) : (
              <>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>Digite seu email e enviaremos um link para resetar sua senha.</p>
                <form onSubmit={handleRecoverySubmit}>
                  <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="input" 
                      placeholder="seu@email.com"
                      value={recoveryEmail} 
                      onChange={(e) => setRecoveryEmail(e.target.value)} 
                      autoFocus
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={recoveryLoading} style={{ width: "100%", padding: "0.75rem", display: "flex", justifyContent: "center" }}>
                    {recoveryLoading ? <Loader2 size={18} className="animate-spin" /> : "Enviar link de recuperação"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { resetPassword } from "../actions/auth";
import { Loader2, ArrowRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--destructive)", marginBottom: "1rem", fontWeight: 500 }}>
          Token de recuperação ausente ou inválido.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ display: "inline-flex", padding: "0.75rem 1.5rem" }}>
          Voltar para o Login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "var(--success)", display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Senha redefinida!</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Sua senha foi alterada com sucesso. Você já pode fazer login.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ display: "inline-flex", width: "100%", justifyContent: "center", padding: "0.75rem" }}>
          Fazer Login <ArrowRight size={18} style={{ marginLeft: "0.5rem" }} />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("token", token);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Ocorreu um erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--foreground)" }}>
        Nova Senha
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Digite sua nova senha abaixo.
      </p>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.875rem", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Nova Senha</label>
          <input 
            type="password" 
            name="password"
            className="input" 
            placeholder="Digite sua nova senha"
            required
            autoFocus
          />
        </div>

        <div className="form-group" style={{ marginBottom: "2rem" }}>
          <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Confirmar Senha</label>
          <input 
            type="password" 
            name="confirmPassword"
            className="input" 
            placeholder="Confirme a nova senha"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "0.875rem", fontSize: "1rem", fontWeight: 600 }}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Salvar nova senha"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "var(--background)",
      padding: "1rem",
      backgroundImage: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent 40%)"
    }}>
      <div className="card glass" style={{ 
        width: "100%", 
        maxWidth: "400px", 
        padding: "3rem 2rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem" }}>
           <div style={{ width: "32px", height: "32px", backgroundColor: "var(--primary)", borderRadius: "50%" }}></div>
           <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.5px" }}>FinApp</span>
        </div>

        <Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><Loader2 className="animate-spin text-primary" size={24} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

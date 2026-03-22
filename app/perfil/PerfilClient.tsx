"use client";

import { useState } from "react";
import { User as UserIcon, LogOut, Edit2, AlertTriangle, X } from "lucide-react";
import { logout } from "../actions/auth";
import { updateUserName, resetTransactions } from "../actions/profile";
import { useDialog } from "@/components/DialogProvider";

export default function PerfilClient({ user }: { user: { name: string, email: string } }) {
  const { alert } = useDialog();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit Name Handler
  const handleEditName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    const res = await updateUserName(newName);
    if (!res.success) {
      await alert(res.error || "Erro", { type: "error" });
    } else {
      setIsEditModalOpen(false);
    }
    setLoading(false);
  };

  // Reset Data Handler
  const handleResetData = async () => {
    setLoading(true);
    const res = await resetTransactions();
    if (!res.success) {
      await alert(res.error || "Erro", { type: "error" });
    } else {
      setIsResetModalOpen(false);
      await alert("Movimentações zeradas com sucesso!", { type: "success" });
    }
    setLoading(false);
  };

  return (
    <>
      <div className="card" style={{ width: "100%", maxWidth: "800px", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* User Info Header */}
        <div style={{ position: "relative" }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", color: "#94a3b8", overflow: "hidden" }}>
            <UserIcon size={64} strokeWidth={1.5} style={{ marginTop: "1.5rem" }} />
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            style={{ position: "absolute", bottom: "1.5rem", right: 0, backgroundColor: "var(--primary)", border: "none", color: "white", borderRadius: "50%", padding: "0.4rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Editar nome"
          >
            <Edit2 size={14} />
          </button>
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>
          {user.name}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "1rem" }}>
          {user.email}
        </p>

        <p style={{ fontSize: "0.875rem", color: "var(--foreground)", fontWeight: 500, marginBottom: "3rem", marginTop: "1rem" }}>
          Você está no <span style={{ color: "var(--primary)", borderBottom: "1px dashed var(--primary)", paddingBottom: "2px" }}>Plano Manual</span>
        </p>

        <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border)", marginBottom: "2rem" }}></div>

        {/* Action Buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--foreground)", fontWeight: 500, transition: "background-color 0.2s", textAlign: "left" }}
            className="hover-bg-gray"
          >
            <Edit2 size={18} color="var(--primary)" />
            Editar meu nome
          </button>

          <button 
            onClick={() => setIsResetModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", backgroundColor: "rgba(245, 158, 11, 0.05)", border: "1px solid #fcd34d", borderRadius: "8px", cursor: "pointer", color: "#d97706", fontWeight: 500, transition: "background-color 0.2s", textAlign: "left" }}
            className="hover-bg-warning"
          >
            <AlertTriangle size={18} />
            Zerar movimentações (Apagar tudo)
          </button>

          <button 
            onClick={() => logout()}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.05)", border: "1px solid #fca5a5", borderRadius: "8px", cursor: "pointer", color: "var(--danger)", fontWeight: 500, transition: "background-color 0.2s", textAlign: "left" }}
            className="hover-bg-danger"
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        </div>

      </div>

      {/* Edit Name Modal */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
            <button onClick={() => setIsEditModalOpen(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1.5rem" }}>Editar Nome</h2>
            <form onSubmit={handleEditName}>
              <div className="form-group">
                <label className="form-label">Seu Nome</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" className="btn" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Data Modal */}
      {isResetModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px", position: "relative", borderTop: "4px solid var(--danger)" }}>
            <button onClick={() => setIsResetModalOpen(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={24} /> Atenção
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Você está prestes a <strong>Zerar todas as movimentações</strong>. Isso irá excluir definitivamente:
              <br /><br />
              • Todas as Receitas<br />
              • Todas as Despesas<br />
              • O progresso atual de suas Metas Financeiras<br />
              • O saldo atual de todas as suas Contas (voltará para R$ 0,00)<br />
              <br />
              Isso <strong>não exclui</strong> suas configurações de Contas, Cartões, Categorias ou Histórico de Metas cadastradas. Deseja prosseguir?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button type="button" className="btn" onClick={() => setIsResetModalOpen(false)}>Cancelar</button>
              <button onClick={handleResetData} className="btn btn-danger" disabled={loading}>
                {loading ? "Zerando..." : "Sim, Quero Zerar Tudo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

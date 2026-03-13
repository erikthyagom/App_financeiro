"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Wallet } from "lucide-react";
import { createAccount, updateAccount, deleteAccount } from "../actions/account";

type Account = {
  id: string;
  name: string;
  balance: number;
};

export default function AccountClient({ initialAccounts }: { initialAccounts: Account[] }) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
  });
  
  const [loading, setLoading] = useState(false);

  // Deriving total balance across all accounts
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const openModal = (account?: Account) => {
    if (account) {
      setEditingId(account.id);
      setFormData({
        name: account.name,
        balance: account.balance.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", balance: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", balance: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.balance) return;

    setLoading(true);
    const payload = {
      name: formData.name,
      balance: parseFloat(formData.balance),
    };

    if (editingId) {
      const res = await updateAccount(editingId, payload);
      if (res.success) {
        setAccounts(accounts.map(a => a.id === editingId ? { ...a, ...payload } : a));
        closeModal();
      } else {
        alert(res.error);
      }
    } else {
      const res = await createAccount(payload);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      const res = await deleteAccount(id);
      if (res.success) {
        setAccounts(accounts.filter(a => a.id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Contas</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Adicionar Conta
        </button>
      </div>

      <div className="card" style={{ marginBottom: "2rem", display: "inline-block", padding: "1rem 2rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase" }}>Saldo Total Operacional</p>
        <p style={{ fontSize: "2rem", fontWeight: 700, color: totalBalance >= 0 ? "var(--success)" : "var(--danger)" }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {accounts.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)" }}>Nenhuma conta cadastrada.</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.05 }}>
                <Wallet size={120} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{account.name}</h3>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button className="btn" style={{ padding: "0.3rem", backgroundColor: "transparent", color: "var(--text-muted)" }} onClick={() => openModal(account)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: "0.3rem" }} onClick={() => handleDelete(account.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Saldo Atual</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: account.balance >= 0 ? "var(--success)" : "var(--danger)" }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px", position: "relative" }}>
            <button 
              onClick={closeModal}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar Conta" : "Nova Conta"}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome da Conta (ex: Nubank, Carteira)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.name} 
                  autoFocus
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Saldo Inicial (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input" 
                  value={formData.balance} 
                  onChange={(e) => setFormData({...formData, balance: e.target.value})} 
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" className="btn" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

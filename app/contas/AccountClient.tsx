"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Wallet, ArrowRightLeft } from "lucide-react";
import { createAccount, updateAccount, deleteAccount, transferBalance } from "../actions/account";
import { useDialog } from "@/components/DialogProvider";

type Account = {
  id: string;
  name: string;
  balance: number;
};

export default function AccountClient({ initialAccounts }: { initialAccounts: Account[] }) {
  const { alert, confirm } = useDialog();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({ sourceId: "", destId: "", amount: "" });

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
        await alert(res.error || "Erro", { type: "error" });
      }
    } else {
      const res = await createAccount(payload);
      if (res.success) {
        window.location.reload();
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    }
    setLoading(false);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.sourceId || !transferData.destId || !transferData.amount) return;
    if (transferData.sourceId === transferData.destId) {
      await alert("As contas de origem e destino devem ser diferentes.", { type: "warning" });
      return;
    }

    setLoading(true);
    const res = await transferBalance(transferData.sourceId, transferData.destId, parseFloat(transferData.amount));
    if (res.success) {
      window.location.reload();
    } else {
      await alert(res.error || "Erro", { type: "error" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Tem certeza que deseja excluir esta conta?", { type: "error" })) {
      const res = await deleteAccount(id);
      if (res.success) {
        setAccounts(accounts.filter(a => a.id !== id));
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Contas</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn" style={{ backgroundColor: "#f1f5f9", color: "var(--foreground)" }} onClick={() => setIsTransferModalOpen(true)}>
            <ArrowRightLeft size={18} /> Transferir
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> Adicionar Conta
          </button>
        </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", position: "relative", zIndex: 10 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{account.name}</h3>
                <div style={{ display: "flex", gap: "0.25rem", background: "var(--background)", padding: "0.25rem", borderRadius: "8px" }}>
                  <button className="btn" style={{ padding: "0.3rem", backgroundColor: "transparent", color: "var(--text-muted)", border: "none" }} onClick={() => openModal(account)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: "0.3rem", backgroundColor: "transparent", border: "none", color: "var(--danger)" }} onClick={() => handleDelete(account.id)}>
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

      {isTransferModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px", position: "relative" }}>
            <button 
              onClick={() => setIsTransferModalOpen(false)}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1.5rem" }}>Transferência entre Contas</h2>
            
            <form onSubmit={handleTransferSubmit}>
              <div className="form-group">
                <label className="form-label">De qual conta vai sair?</label>
                <select className="input" value={transferData.sourceId} onChange={e => setTransferData({...transferData, sourceId: e.target.value})} required>
                  <option value="" disabled>Selecione a origem</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (R$ {acc.balance.toFixed(2)})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Para qual conta vai entrar?</label>
                <select className="input" value={transferData.destId} onChange={e => setTransferData({...transferData, destId: e.target.value})} required>
                  <option value="" disabled>Selecione o destino</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (R$ {acc.balance.toFixed(2)})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input type="number" step="0.01" className="input" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} required />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" className="btn" onClick={() => setIsTransferModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: "var(--primary)" }} disabled={loading}>
                  {loading ? "Transferindo..." : "Confirmar Transferência"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

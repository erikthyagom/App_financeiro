"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createIncome, updateIncome, deleteIncome } from "../actions/income";
import { useDialog } from "@/components/DialogProvider";

type Category = { id: string; name: string };
type Account = { id: string; name: string };
type Income = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  note: string | null;
  categoryId: string;
  category?: Category;
  accountId?: string | null;
};

export default function IncomeClient({ initialIncomes, categories, accounts }: { initialIncomes: Income[], categories: Category[], accounts: Account[] }) {
  const { alert, confirm } = useDialog();
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    accountId: "",
    note: "",
  });
  
  const [loading, setLoading] = useState(false);
  
  const [repeatMode, setRepeatMode] = useState<"fixed" | "installments" | "">("");
  const [fixedFrequency, setFixedFrequency] = useState("Mensal");
  const [installmentsCount, setInstallmentsCount] = useState("2");
  const [installmentsPeriod, setInstallmentsPeriod] = useState("Meses");

  // Derivando totais do mês seria interessante, mas vamos focar no CRUD primeiro
  const total = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  const openModal = (income?: Income) => {
    if (income) {
      setEditingId(income.id);
      setFormData({
        description: income.description,
        amount: income.amount.toString(),
        date: new Date(income.date).toISOString().split("T")[0],
        categoryId: income.categoryId,
        accountId: income.accountId || (accounts.length > 0 ? accounts[0].id : ""),
        note: income.note || "",
      });
    } else {
      setEditingId(null);
      setFormData({ 
        description: "", 
        amount: "", 
        date: new Date().toISOString().split("T")[0], 
        categoryId: categories.length > 0 ? categories[0].id : "", 
        accountId: accounts.length > 0 ? accounts[0].id : "",
        note: "" 
      });
      setRepeatMode("");
      setFixedFrequency("Mensal");
      setInstallmentsCount("2");
      setInstallmentsPeriod("Meses");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.categoryId) return;

    setLoading(true);
    const payload = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date + "T12:00:00"), // Evitar problemas de timezone
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      note: formData.note || undefined,
      repeatMode: !editingId ? repeatMode : undefined,
      fixedFrequency: (!editingId && repeatMode === "fixed") ? fixedFrequency : undefined,
      installmentsCount: (!editingId && repeatMode === "installments") ? parseInt(installmentsCount) : undefined,
      installmentsPeriod: (!editingId && repeatMode === "installments") ? installmentsPeriod : undefined
    };

    if (editingId) {
      const res = await updateIncome(editingId, payload);
      if (res.success) {
        window.location.reload();
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    } else {
      const res = await createIncome(payload);
      if (res.success) {
        window.location.reload();
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, description: string) => {
    if (await confirm(`Tem certeza que deseja excluir a receita "${description}"?`, { type: "error" })) {
      const res = await deleteIncome(id);
      if (res.success) {
        setIncomes(incomes.filter(i => i.id !== id));
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Receitas</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Adicionar Receita
        </button>
      </div>

      <div className="card" style={{ marginBottom: "2rem", display: "inline-block", padding: "1rem 2rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase" }}>Total de Receitas</p>
        <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>Data</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>Descrição</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>Categoria</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)", textAlign: "right" }}>Valor</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Nenhuma receita encontrada.
                  </td>
                </tr>
              ) : (
                incomes.map((income) => (
                  <tr key={income.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "1rem" }}>{format(new Date(income.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 500 }}>{income.description}</div>
                      {income.note && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{income.note}</div>}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ backgroundColor: "var(--background)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.875rem" }}>
                        {income.category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--success)" }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income.amount)}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button className="btn" style={{ padding: "0.4rem", backgroundColor: "transparent", color: "var(--text-muted)" }} onClick={() => openModal(income)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "0.4rem" }} onClick={() => handleDelete(income.id, income.description)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", position: "relative" }}>
            <button 
              onClick={closeModal}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar Receita" : "Nova Receita"}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="input" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Data</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Categoria</label>
                  <select 
                    className="select" 
                    value={formData.categoryId} 
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    required
                  >
                    <option value="" disabled>Selecione uma categoria</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Conta de Destino</label>
                  <select 
                    className="select" 
                    value={formData.accountId} 
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    required
                  >
                    <option value="" disabled>Selecione uma conta</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Observação (Opcional)</label>
                <textarea 
                  className="input" 
                  style={{ minHeight: "80px", resize: "vertical" }}
                  value={formData.note} 
                  onChange={(e) => setFormData({...formData, note: e.target.value})} 
                />
              </div>

              {!editingId && (
                <>
                  <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.03)", marginBottom: "1.5rem" }}></div>
                  
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 500 }}>Repetir Lançamento?</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      
                      {/* Fixed */}
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.9rem", cursor: "pointer" }}>
                        <input 
                          type="radio" 
                          name="repeatIncome" 
                          checked={repeatMode === "fixed"}
                          onChange={() => setRepeatMode("fixed")}
                          style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} 
                        />
                        é uma receita fixa (Assinatura/Salário)
                      </label>
                      
                      {repeatMode === "fixed" && (
                        <div style={{ paddingLeft: "1.75rem", marginBottom: "0.5rem", marginTop: "0.25rem" }}>
                          <select 
                            style={{ 
                              width: "100%", padding: "0.6rem 0.75rem", 
                              border: "1px solid var(--primary)", borderRadius: "4px", 
                              outline: "none", fontSize: "0.95rem", 
                              backgroundColor: "white", color: "var(--foreground)", fontWeight: 500
                            }}
                            value={fixedFrequency}
                            onChange={(e) => setFixedFrequency(e.target.value)}
                          >
                            <option value="Anual">Anual</option>
                            <option value="Semestral">Semestral</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Quinzenal">Quinzenal</option>
                            <option value="Semanal">Semanal</option>
                          </select>
                        </div>
                      )}

                      {/* Installments */}
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.9rem", cursor: "pointer" }}>
                        <input 
                          type="radio" 
                          name="repeatIncome" 
                          checked={repeatMode === "installments"}
                          onChange={() => setRepeatMode("installments")}
                          style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} 
                        />
                        é uma receita parcelada em
                      </label>

                      {repeatMode === "installments" && (
                        <div style={{ paddingLeft: "1.75rem", marginBottom: "0.5rem", marginTop: "0.25rem" }}>
                          <div style={{ display: "flex", gap: "1rem" }}>
                            <select 
                              style={{ flex: 1, padding: "0.6rem 0.75rem", border: "1px solid var(--border)", borderRadius: "4px", backgroundColor: "white", color: "var(--foreground)", fontWeight: 500 }}
                              value={installmentsCount}
                              onChange={(e) => setInstallmentsCount(e.target.value)}
                            >
                              {Array.from({ length: 120 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            
                            <select 
                              style={{ flex: 1, padding: "0.6rem 0.75rem", border: "1px solid var(--border)", borderRadius: "4px", backgroundColor: "white", color: "var(--foreground)", fontWeight: 500 }}
                              value={installmentsPeriod}
                              onChange={(e) => setInstallmentsPeriod(e.target.value)}
                            >
                              <option value="Meses">Meses</option>
                              <option value="Semanas">Semanas</option>
                              <option value="Dias">Dias</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* No Repeat */}
                      {repeatMode !== "" && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <button type="button" onClick={() => setRepeatMode("")} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
                            Cancelar repetição
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

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

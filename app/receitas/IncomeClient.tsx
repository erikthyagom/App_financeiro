"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createIncome, updateIncome, deleteIncome } from "../actions/income";

type Category = { id: string; name: string };
type Income = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  note: string | null;
  categoryId: string;
  category?: Category;
};

export default function IncomeClient({ initialIncomes, categories }: { initialIncomes: any[], categories: Category[] }) {
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    note: "",
  });
  
  const [loading, setLoading] = useState(false);

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
        note: income.note || "",
      });
    } else {
      setEditingId(null);
      setFormData({ 
        description: "", 
        amount: "", 
        date: new Date().toISOString().split("T")[0], 
        categoryId: categories.length > 0 ? categories[0].id : "", 
        note: "" 
      });
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
      note: formData.note || undefined,
    };

    if (editingId) {
      const res = await updateIncome(editingId, payload);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error);
      }
    } else {
      const res = await createIncome(payload);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, description: string) => {
    if (confirm(`Tem certeza que deseja excluir a receita "${description}"?`)) {
      const res = await deleteIncome(id);
      if (res.success) {
        setIncomes(incomes.filter(i => i.id !== id));
      } else {
        alert(res.error);
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

              <div className="form-group">
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
              
              <div className="form-group">
                <label className="form-label">Observação (Opcional)</label>
                <textarea 
                  className="input" 
                  style={{ minHeight: "80px", resize: "vertical" }}
                  value={formData.note} 
                  onChange={(e) => setFormData({...formData, note: e.target.value})} 
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

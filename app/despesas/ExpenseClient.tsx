"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createExpense, updateExpense, deleteExpense } from "../actions/expense";

type Category = { id: string; name: string };
type CreditCard = { id: string; name: string };
type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: string;
  note: string | null;
  categoryId: string;
  category?: Category;
  creditCardId: string | null;
  creditCard?: CreditCard | null;
};

const PAYMENT_METHODS = [
  { value: "PIX", label: "PIX" },
  { value: "DEBITO", label: "Cartão de Débito" },
  { value: "CREDITO", label: "Cartão de Crédito" },
  { value: "DINHEIRO", label: "Dinheiro" },
];

export default function ExpenseClient({ 
  initialExpenses, 
  categories, 
  creditCards 
}: { 
  initialExpenses: any[], 
  categories: Category[],
  creditCards: CreditCard[] 
}) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "PIX",
    categoryId: "",
    creditCardId: "",
    note: "",
  });
  
  const [loading, setLoading] = useState(false);

  // Derivando totais do mês seria interessante, mas vamos manter simples por agora
  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        date: new Date(expense.date).toISOString().split("T")[0],
        paymentMethod: expense.paymentMethod,
        categoryId: expense.categoryId,
        creditCardId: expense.creditCardId || "",
        note: expense.note || "",
      });
    } else {
      setEditingId(null);
      setFormData({ 
        description: "", 
        amount: "", 
        date: new Date().toISOString().split("T")[0], 
        paymentMethod: "PIX",
        categoryId: categories.length > 0 ? categories[0].id : "", 
        creditCardId: "",
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
    if (!formData.description || !formData.amount || !formData.categoryId || !formData.paymentMethod) return;

    if (formData.paymentMethod === "CREDITO" && !formData.creditCardId) {
      alert("Selecione um cartão de crédito.");
      return;
    }

    setLoading(true);
    const payload = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date + "T12:00:00"), // Evitar problemas de fuso horário
      paymentMethod: formData.paymentMethod,
      categoryId: formData.categoryId,
      creditCardId: formData.paymentMethod === "CREDITO" ? formData.creditCardId : undefined,
      note: formData.note || undefined,
    };

    if (editingId) {
      const res = await updateExpense(editingId, payload);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error);
      }
    } else {
      const res = await createExpense(payload);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, description: string) => {
    if (confirm(`Tem certeza que deseja excluir a despesa "${description}"?`)) {
      const res = await deleteExpense(id);
      if (res.success) {
        setExpenses(expenses.filter(e => e.id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  const getPaymentLabel = (value: string) => PAYMENT_METHODS.find(m => m.value === value)?.label || value;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Despesas</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Adicionar Despesa
        </button>
      </div>

      <div className="card" style={{ marginBottom: "2rem", display: "inline-block", padding: "1rem 2rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase" }}>Total de Despesas</p>
        <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--danger)" }}>
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
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>Pagamento</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)", textAlign: "right" }}>Valor</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "1rem" }}>{format(new Date(expense.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 500 }}>{expense.description}</div>
                      {expense.note && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{expense.note}</div>}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ backgroundColor: "var(--background)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.875rem" }}>
                        {expense.category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: "0.875rem" }}>{getPaymentLabel(expense.paymentMethod)}</div>
                      {expense.paymentMethod === "CREDITO" && expense.creditCard && (
                        <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 500 }}>
                          {expense.creditCard.name}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--danger)" }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button className="btn" style={{ padding: "0.4rem", backgroundColor: "transparent", color: "var(--text-muted)" }} onClick={() => openModal(expense)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "0.4rem" }} onClick={() => handleDelete(expense.id, expense.description)}>
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
          <div className="card" style={{ width: "100%", maxWidth: "550px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button 
              onClick={closeModal}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar Despesa" : "Nova Despesa"}</h2>
            
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
                  <label className="form-label">Forma de Pagamento</label>
                  <select 
                    className="select" 
                    value={formData.paymentMethod} 
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value, creditCardId: e.target.value !== 'CREDITO' ? '' : formData.creditCardId})}
                    required
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.paymentMethod === "CREDITO" && (
                <div className="form-group">
                  <label className="form-label">Cartão de Crédito</label>
                  <select 
                    className="select" 
                    value={formData.creditCardId} 
                    onChange={(e) => setFormData({...formData, creditCardId: e.target.value})}
                    required
                  >
                    <option value="" disabled>Selecione um cartão</option>
                    {creditCards.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
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

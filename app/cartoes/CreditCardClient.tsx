"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, CreditCard as CardIcon } from "lucide-react";
import { createCreditCard, updateCreditCard, deleteCreditCard } from "../actions/creditCard";
import { useDialog } from "@/components/DialogProvider";
import Link from "next/link";

type CreditCard = {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
};

export default function CreditCardClient({ initialCards }: { initialCards: CreditCard[] }) {
  const { alert, confirm } = useDialog();
  const [cards, setCards] = useState<CreditCard[]>(initialCards);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    limit: "",
    closingDay: "",
    dueDay: "",
  });
  
  const [loading, setLoading] = useState(false);

  const openModal = (card?: CreditCard) => {
    if (card) {
      setEditingId(card.id);
      setFormData({
        name: card.name,
        limit: card.limit.toString(),
        closingDay: card.closingDay.toString(),
        dueDay: card.dueDay.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", limit: "", closingDay: "", dueDay: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", limit: "", closingDay: "", dueDay: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.limit || !formData.closingDay || !formData.dueDay) return;

    setLoading(true);
    const payload = {
      name: formData.name,
      limit: parseFloat(formData.limit),
      closingDay: parseInt(formData.closingDay, 10),
      dueDay: parseInt(formData.dueDay, 10),
    };

    if (editingId) {
      const res = await updateCreditCard(editingId, payload);
      if (res.success) {
        setCards(cards.map(c => c.id === editingId ? { ...c, ...payload } : c));
        closeModal();
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    } else {
      const res = await createCreditCard(payload);
      if (res.success) {
        window.location.reload();
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Tem certeza que deseja excluir este cartão?", { type: "error" })) {
      const res = await deleteCreditCard(id);
      if (res.success) {
        setCards(cards.filter(c => c.id !== id));
      } else {
        await alert(res.error || "Erro", { type: "error" });
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Cartões de Crédito</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Adicionar Cartão
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {cards.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)" }}>Nenhum cartão cadastrado.</p>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", position: "relative", zIndex: 10 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{card.name}</h3>
                <div style={{ display: "flex", gap: "0.25rem", background: "var(--background)", padding: "0.25rem", borderRadius: "8px" }}>
                  <button className="btn" style={{ padding: "0.3rem", backgroundColor: "transparent", color: "var(--text-muted)", border: "none" }} onClick={() => openModal(card)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: "0.3rem", backgroundColor: "transparent", border: "none", color: "var(--danger)" }} onClick={() => handleDelete(card.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Limite</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit)}
                </p>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Fechamento</p>
                  <p style={{ fontWeight: 500 }}>Dia {card.closingDay}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Vencimento</p>
                  <p style={{ fontWeight: 500 }}>Dia {card.dueDay}</p>
                </div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Link 
                  href={`/cartoes/${card.id}`} 
                  style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "0.5rem", borderRadius: "8px", backgroundColor: "var(--primary-light, #e8f5e9)", color: "var(--primary)", fontWeight: 600, fontSize: "0.875rem" }}
                >
                  Ver Faturas
                </Link>
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
            <h2 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar Cartão" : "Novo Cartão"}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome do Cartão (ex: Nubank, Itaú)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Limite (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="input" 
                  value={formData.limit} 
                  onChange={(e) => setFormData({...formData, limit: e.target.value})} 
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Dia de Fechamento</label>
                  <input 
                    type="number" 
                    min="1" max="31"
                    className="input" 
                    value={formData.closingDay} 
                    onChange={(e) => setFormData({...formData, closingDay: e.target.value})} 
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Dia de Vencimento</label>
                  <input 
                    type="number" 
                    min="1" max="31"
                    className="input" 
                    value={formData.dueDay} 
                    onChange={(e) => setFormData({...formData, dueDay: e.target.value})} 
                    required
                  />
                </div>
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

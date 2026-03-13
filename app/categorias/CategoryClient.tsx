"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "../actions/category";

type Category = {
  id: string;
  name: string;
};

export default function CategoryClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setName(category.name);
    } else {
      setEditingId(null);
      setName("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    if (editingId) {
      const res = await updateCategory(editingId, name);
      if (res.success) {
        setCategories(categories.map(c => c.id === editingId ? { ...c, name } : c));
        closeModal();
      } else {
        alert(res.error);
      }
    } else {
      const res = await createCategory(name);
      if (res.success) {
        // Optimistic refresh; in reality Server Action revalidates path
        // but we'll reload or let the page handle it.
        window.location.reload(); 
      } else {
        alert(res.error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      const res = await deleteCategory(id);
      if (res.success) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Categorias</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Adicionar Categoria
        </button>
      </div>

      <div className="card">
        {categories.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
            Nenhuma categoria cadastrada.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                padding: "1rem", backgroundColor: "var(--background)", borderRadius: "8px",
                border: "1px solid var(--border)"
              }}>
                <span style={{ fontWeight: 500 }}>{cat.name}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn" style={{ padding: "0.4rem", backgroundColor: "transparent", color: "var(--text-muted)" }} onClick={() => openModal(cat)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: "0.4rem" }} onClick={() => handleDelete(cat.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
            <button 
              onClick={closeModal}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar Categoria" : "Nova Categoria"}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome da Categoria</label>
                <input 
                  type="text" 
                  className="input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  autoFocus
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

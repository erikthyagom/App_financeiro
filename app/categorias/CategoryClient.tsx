"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Plus, X } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "../actions/category";

type Category = {
  id: string;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
};

export default function CategoryClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
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
      const res = await createCategory(name, activeTab);
      if (res.success) {
        window.location.reload(); 
      } else {
        alert(res.error);
      }
    }
    setLoading(false);
  };

  // Mocked archive functionality
  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja arquivar/excluir esta categoria?")) {
      deleteCategory(id).then(res => {
        if (res.success) setCategories(categories.filter(c => c.id !== id));
      });
    }
  };

  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingBottom: "3rem" }}>
      <div className="card" style={{ width: "100%", maxWidth: "800px", padding: "3rem", borderRadius: "16px", backgroundColor: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>Categorias</h2>
          <button 
            onClick={() => openModal()}
            style={{ 
              display: "flex", alignItems: "center", gap: "0.5rem", 
              backgroundColor: "#dcfce7", color: "#16a34a", 
              border: "none", padding: "0.5rem 1rem", borderRadius: "4px", 
              fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" 
            }}
          >
            <Plus size={16} strokeWidth={3} /> Categoria de {activeTab === "EXPENSE" ? "despesa" : "receita"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "1rem" }}>
          <button 
            onClick={() => setActiveTab("EXPENSE")}
            style={{ 
              flex: 1, padding: "1rem", background: "none", border: "none", cursor: "pointer", 
              fontWeight: 600, fontSize: "0.875rem",
              color: activeTab === "EXPENSE" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "EXPENSE" ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            Despesas
          </button>
          <button 
            onClick={() => setActiveTab("INCOME")}
            style={{ 
              flex: 1, padding: "1rem", background: "none", border: "none", cursor: "pointer", 
              fontWeight: 600, fontSize: "0.875rem",
              color: activeTab === "INCOME" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "INCOME" ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            Receitas
          </button>
        </div>

        {/* Categories List */}
        <div>
          {filteredCategories.length === 0 ? (
             <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem 0" }}>Nenhuma categoria encontrada.</p>
          ) : (
            filteredCategories.map((cat) => {
              const IconComponent = (LucideIcons as any)[cat.icon || "List"] || LucideIcons.List;
              return (
                <div key={cat.id} style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center", 
                  padding: "1rem 0", borderBottom: "1px solid rgba(0,0,0,0.03)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ 
                      width: "40px", height: "40px", borderRadius: "50%", 
                      backgroundColor: cat.color || "#94a3b8", display: "flex", 
                      alignItems: "center", justifyContent: "center", color: "white" 
                    }}>
                      <IconComponent size={20} strokeWidth={2} />
                    </div>
                    <span style={{ fontWeight: 500, color: "var(--foreground)", fontSize: "0.95rem" }}>{cat.name}</span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1.25rem" }}>
                    <button 
                      onClick={(e) => handleArchive(cat.id, e)}
                      style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "0.875rem", cursor: "pointer", padding: 0 }}
                    >
                      arquivar
                    </button>
                    <button 
                      style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "0.875rem", cursor: "pointer", padding: 0 }}
                    >
                      + sub-categoria
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

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

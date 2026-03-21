"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Trash2, ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteTransaction } from "../actions/transactions";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: number;
  date: Date;
  category: any;
  sourceName: string;
};

type TransactionsData = {
  incomes: number;
  expenses: number;
  balance: number;
  list: Transaction[];
};

export default function TransactionsClient({ initialData, currentMonth, currentYear }: { initialData: TransactionsData, currentMonth: number, currentYear: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handlePrevMonth = () => {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    router.push(`/lancamentos?month=${m}&year=${y}`);
  };

  const handleNextMonth = () => {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    router.push(`/lancamentos?month=${m}&year=${y}`);
  };

  const handleDelete = async (id: string, type: "INCOME"| "EXPENSE") => {
    if (!confirm("Tem certeza que deseja deletar este lançamento?")) return;
    setIsDeleting(id);
    const res = await deleteTransaction(id, type);
    setIsDeleting(null);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('pt-BR', { month: 'long' });
  const today = new Date();

  return (
    <div>
      <h1 className="page-title">Extrato de Lançamentos</h1>

      <div className="card" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={handlePrevMonth} className="btn" style={{ background: "transparent", color: "var(--foreground)" }}><ChevronLeft /></button>
        <h2 style={{ fontSize: "1.25rem", textTransform: "capitalize", fontWeight: 600 }}>{monthName} {currentYear}</h2>
        <button onClick={handleNextMonth} className="btn" style={{ background: "transparent", color: "var(--foreground)" }}><ChevronRight /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "1rem", backgroundColor: "var(--success-light, #e8f5e9)", borderRadius: "12px", color: "var(--success)" }}>
            <ArrowUpCircle size={28} />
          </div>
          <div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>Receitas</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.incomes)}
            </p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "1rem", backgroundColor: "var(--danger-light, #ffebee)", borderRadius: "12px", color: "var(--danger)" }}>
            <ArrowDownCircle size={28} />
          </div>
          <div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>Despesas</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.expenses)}
            </p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ padding: "1rem", backgroundColor: "var(--background)", borderRadius: "12px", color: "var(--primary)" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>$</span>
          </div>
          <div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>Saldo Mensal</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: initialData.balance >= 0 ? "var(--success)" : "var(--danger)" }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {initialData.list.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <p>Nenhum lançamento encontrado para este mês.</p>
          </div>
        ) : (
          initialData.list.map((item) => {
            const isIncome = item.type === "INCOME";
            const amountColor = isIncome ? "var(--success)" : "var(--foreground)";
            const prefix = isIncome ? "+" : "-";
            const itemDate = new Date(item.date);
            const isPaid = itemDate <= today;
            const categoryColor = item.category?.color || "var(--text-muted)";

            return (
              <div key={item.id} style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
                opacity: isDeleting === item.id ? 0.5 : 1
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ 
                    width: "48px", height: "48px", borderRadius: "50%", 
                    backgroundColor: `${categoryColor}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: categoryColor,
                    fontSize: "1.2rem", fontWeight: 600
                  }}>
                    {item.category?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.2rem", fontSize: "1.05rem" }}>
                      {item.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: isPaid ? "var(--success)" : "var(--text-muted)" }}>
                        {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {format(itemDate, "dd/MM", { locale: ptBR })}
                      </span>
                      <span>•</span>
                      <span>{item.sourceName}</span>
                      <span>•</span>
                      <span>{item.category?.name || "Sem categoria"}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <p style={{ fontWeight: 600, color: amountColor, fontSize: "1.1rem" }}>
                    {prefix} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                  </p>
                  
                  <button 
                    onClick={() => handleDelete(item.id, item.type)}
                    style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "0.5rem", opacity: 0.7 }}
                    title="Excluir Lançamento"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

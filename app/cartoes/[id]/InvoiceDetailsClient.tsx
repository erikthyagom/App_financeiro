"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { payInvoice } from "@/app/actions/creditCard";

export default function InvoiceDetailsClient({ invoiceData, accounts, currentMonth, currentYear, cardId }: { invoiceData: any, accounts: any[], currentMonth: number, currentYear: number, cardId: string }) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);

  const handlePrevMonth = () => {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    router.push(`/cartoes/${cardId}?month=${m}&year=${y}`);
  };

  const handleNextMonth = () => {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    router.push(`/cartoes/${cardId}?month=${m}&year=${y}`);
  };

  const handlePay = async () => {
    if (!selectedAccount) return alert("Selecione uma conta origem");
    setIsPaying(true);
    // pay current invoice total
    const result = await payInvoice(cardId, selectedAccount, invoiceData.totalAmount, new Date());
    setIsPaying(false);
    if (result.success) {
      setShowPayModal(false);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('pt-BR', { month: 'long' });

  // Status colors
  let statusColor = "var(--primary)";
  let StatusIcon = Clock;
  if (invoiceData.status === "Paga") {
    statusColor = "#10b981"; // green
    StatusIcon = CheckCircle;
  } else if (invoiceData.status === "Vencida") {
    statusColor = "var(--danger)"; // red
    StatusIcon = AlertCircle;
  } else if (invoiceData.status === "Fechada") {
    statusColor = "#f59e0b"; // yellow/orange
    StatusIcon = AlertCircle;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem", gap: "1rem" }}>
        <Link href="/cartoes" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <ArrowLeft size={20} />
          Voltar
        </Link>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Faturas: {invoiceData.cardInfo.name}</h1>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <button onClick={handlePrevMonth} className="btn" style={{ background: "transparent", color: "var(--foreground)" }}><ChevronLeft /></button>
          <h2 style={{ fontSize: "1.25rem", textTransform: "capitalize" }}>{monthName} {currentYear}</h2>
          <button onClick={handleNextMonth} className="btn" style={{ background: "transparent", color: "var(--foreground)" }}><ChevronRight /></button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Valor Total da Fatura</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--foreground)" }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceData.totalAmount)}
            </p>
          </div>
          
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: statusColor, fontWeight: 600, padding: "0.5rem 1rem", borderRadius: "99px", backgroundColor: "white", border: `1px solid ${statusColor}` }}>
              <StatusIcon size={18} />
              {invoiceData.status}
            </div>
            
            {(invoiceData.status === "Fechada" || invoiceData.status === "Vencida") && (
              <button 
                className="btn" 
                style={{ backgroundColor: statusColor, color: "white", padding: "0.75rem 2rem" }}
                onClick={() => setShowPayModal(true)}
              >
                Pagar Fatura
              </button>
            )}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Fechamento</p>
            <p style={{ fontWeight: 500 }}>{format(new Date(invoiceData.endDate), "dd 'de' MMMM", { locale: ptBR })}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Vencimento</p>
            <p style={{ fontWeight: 500 }}>{format(new Date(invoiceData.dueDate), "dd 'de' MMMM", { locale: ptBR })}</p>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Transações da Fatura</h3>
      
      {invoiceData.expenses.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <p>Nenhuma compra registrada nesta fatura.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {invoiceData.expenses.map((expense: any) => (
            <div key={expense.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ 
                  width: "40px", height: "40px", borderRadius: "50%", 
                  backgroundColor: expense.category?.color ? `${expense.category.color}20` : "var(--background)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: expense.category?.color || "var(--text-muted)"
                }}>
                  {/* Simplificando icone por usar a 1a letra do nome ou icon genérico */}
                  {expense.category?.name.charAt(0) || "C"}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.2rem" }}>{expense.description}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{format(new Date(expense.date), "dd/MM/yyyy")} • {expense.category?.name}</p>
                </div>
              </div>
              <p style={{ fontWeight: 600, color: "var(--danger)" }}>
                - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* PAy Modal */}
      {showPayModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Pagar Fatura</h2>
            <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>De qual conta o dinheiro saiu para pagar esta fatura?</p>
            
            <div style={{ marginBottom: "2rem" }}>
              <select 
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "8px", outline: "none" }}
                value={selectedAccount}
                onChange={e => setSelectedAccount(e.target.value)}
              >
                <option value="" disabled>Selecione a conta</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} - Saldo: R$ {acc.balance.toFixed(2)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button className="btn" style={{ background: "transparent", color: "var(--text-muted)" }} onClick={() => setShowPayModal(false)}>Cancelar</button>
              <button className="btn" style={{ backgroundColor: "var(--primary)", color: "white" }} onClick={handlePay} disabled={isPaying}>
                {isPaying ? "Pagando..." : "Confirmar Pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

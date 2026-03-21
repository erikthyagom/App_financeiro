"use client";

import { useState } from "react";
import { X, Calendar, ThumbsUp, Wallet, ArrowRightLeft, MessageSquare, Paperclip, Tag, Check } from "lucide-react";
import { format } from "date-fns";

type Account = { id: string; name: string };
type CreditCard = { id: string; name: string };
type Category = { id: string; name: string };

type NewExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
};

export default function NewExpenseModal({ isOpen, onClose, onSubmit, accounts, creditCards, categories }: NewExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"fixed" | "installments" | "">("");
  const [fixedFrequency, setFixedFrequency] = useState("Mensal");
  const [installmentsCount, setInstallmentsCount] = useState("2");
  const [installmentsPeriod, setInstallmentsPeriod] = useState("Meses");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!description || !amount || !accountId || !categoryId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    
    setIsLoading(true);
    
    // Check if the selected ID belongs to a credit card
    const isCreditCard = creditCards.some(c => c.id === accountId);
    const finalAccountId = isCreditCard ? undefined : accountId;
    const finalCreditCardId = isCreditCard ? accountId : undefined;
    const finalPaymentMethod = isCreditCard ? "CREDIT" : "PIX";

    await onSubmit({
      description,
      amount: parseFloat(amount),
      date: new Date(date + "T12:00:00"),
      categoryId,
      paymentMethod: finalPaymentMethod, 
      accountId: finalAccountId,
      creditCardId: finalCreditCardId,
      repeatMode,
      fixedFrequency: repeatMode === "fixed" ? fixedFrequency : undefined,
      installmentsCount: repeatMode === "installments" ? parseInt(installmentsCount) : undefined,
      installmentsPeriod: repeatMode === "installments" ? installmentsPeriod : undefined
    });
    setIsLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "550px", position: "relative", padding: "2rem", backgroundColor: "white", borderRadius: "16px" }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "2rem" }}>Nova despesa</h2>
        
        {/* Descrição */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>Descrição</label>
          <input 
            type="text" 
            style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "4px", outline: "none", fontSize: "1rem" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoFocus
          />
        </div>

        {/* Valor e Data */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>Valor</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>R$</span>
              <input 
                type="number" 
                step="0.01"
                placeholder="0,00"
                style={{ width: "100%", padding: "0.75rem 0.75rem 0.75rem 2.5rem", border: "1px solid var(--border)", borderRadius: "4px", outline: "none", fontSize: "1rem", color: "var(--danger)", fontWeight: 600 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>Data</label>
              <div style={{ position: "relative" }}>
                <input 
                  type="date" 
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "4px", outline: "none", fontSize: "1rem", color: "var(--foreground)", paddingRight: "2.5rem" }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginLeft: "1rem", display: "flex", alignItems: "center", justifyContent: "center", height: "46px" }}>
              <ThumbsUp fill="var(--primary)" color="var(--primary)" size={24} />
            </div>
          </div>
        </div>

        {/* Conta e Categoria */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>Conta/Cartão</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                <Wallet size={18} />
              </span>
              <select 
                style={{ width: "100%", padding: "0.75rem 2rem 0.75rem 2.5rem", border: "1px solid var(--border)", borderRadius: "4px", outline: "none", fontSize: "0.95rem", appearance: "none", backgroundColor: "white", color: "var(--foreground)", fontWeight: 500 }}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="" disabled>Selecione a conta</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
                {creditCards.map(card => (
                  <option key={card.id} value={card.id}>{card.name} (Cartão)</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
                <X size={16} />
              </span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>Categoria</label>
            <select 
              style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "4px", outline: "none", fontSize: "0.95rem", backgroundColor: "white", color: "var(--foreground)" }}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="" disabled>Buscar a categoria..</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.03)", marginBottom: "1.5rem" }}></div>

        {/* Repetir Section */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 500 }}>Repetir</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.9rem", cursor: "pointer" }}>
              <input 
                type="radio" 
                name="repeat" 
                checked={repeatMode === "fixed"}
                onChange={() => setRepeatMode("fixed")}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} 
              />
              é uma despesa fixa
            </label>
            
            {repeatMode === "fixed" && (
              <div style={{ paddingLeft: "1.75rem", marginBottom: "0.5rem", marginTop: "0.25rem" }}>
                <div style={{ position: "relative" }}>
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
                    <option value="Trimestral">Trimestral</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Quinzenal">Quinzenal</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Diário">Diário</option>
                  </select>
                </div>
              </div>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.9rem", cursor: "pointer" }}>
              <input 
                type="radio" 
                name="repeat" 
                checked={repeatMode === "installments"}
                onChange={() => setRepeatMode("installments")}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} 
              />
              é um lançamento parcelado em
            </label>

            {repeatMode === "installments" && (
              <div style={{ paddingLeft: "1.75rem", marginBottom: "0.5rem", marginTop: "0.25rem" }}>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <select 
                      style={{ 
                        width: "100%", padding: "0.6rem 0.75rem", 
                        border: "1px solid var(--border)", borderRadius: "4px", 
                        outline: "none", fontSize: "0.95rem", 
                        backgroundColor: "white", color: "var(--foreground)", fontWeight: 500
                      }}
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(e.target.value)}
                    >
                      {Array.from({ length: 480 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    <select 
                      style={{ 
                        width: "100%", padding: "0.6rem 0.75rem", 
                        border: "1px solid var(--border)", borderRadius: "4px", 
                        outline: "none", fontSize: "0.95rem", 
                        backgroundColor: "white", color: "var(--foreground)", fontWeight: 500
                      }}
                      value={installmentsPeriod}
                      onChange={(e) => setInstallmentsPeriod(e.target.value)}
                    >
                      <option value="Anos">Anos</option>
                      <option value="Semestres">Semestres</option>
                      <option value="Trimestres">Trimestres</option>
                      <option value="Bimestres">Bimestres</option>
                      <option value="Meses">Meses</option>
                      <option value="Quinzenas">Quinzenas</option>
                      <option value="Semanas">Semanas</option>
                      <option value="Dias">Dias</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>
                  Serão lançadas {installmentsCount} parcelas de <span style={{ color: "var(--success)", fontWeight: 600 }}>{
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      (parseFloat(amount) || 0) / parseInt(installmentsCount || "1")
                    )
                  }</span>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    Em caso de divisão não exata, a sobra será somada à primeira parcela.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
              <ArrowRightLeft size={24} color="#94a3b8" />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Repetir</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
              <MessageSquare size={24} color="#94a3b8" />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Observação</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
              <Paperclip size={24} color="#94a3b8" />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Anexo</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
              <Tag size={24} color="#94a3b8" />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Tags</span>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "-1.5rem", position: "relative", zIndex: 10 }}>
          <button 
            disabled={isLoading}
            onClick={handleSubmit} 
            style={{ 
              width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "var(--primary)", border: "none", cursor: "pointer", 
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(27, 193, 84, 0.3)",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <Check size={36} color="white" />
          </button>
        </div>

      </div>
    </div>
  );
}

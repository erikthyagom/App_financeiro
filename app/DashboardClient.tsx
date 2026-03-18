"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpCircle, ArrowDownCircle, Wallet, PieChart, Info, CreditCard, Target, Plus, X, Layers } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGoal } from "@/app/actions/goal";

ChartJS.register(ArcElement, Tooltip, Legend);

type DashboardData = {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  chartData: {
    labels: string[];
    data: number[];
  };
  accounts: any[];
  creditCards: any[];
  goals: any[];
  userName: string;
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const generateColors = (count: number) => {
  const colors = [
    "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", 
    "#10b981", "#34d399", "#6ee7b7", "#f59e0b", "#fbbf24", 
    "#fcd34d", "#ef4444", "#f87171", "#fca5a5"
  ];
  return colors.slice(0, count);
};

export default function DashboardClient({ initialData, initialMonth, initialYear }: { initialData: DashboardData, initialMonth: number, initialYear: number }) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: "", targetAmount: "", currentAmount: "" });
  const [goalLoading, setGoalLoading] = useState(false);

  const handleFilterChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
    router.push(`/?month=${m}&year=${y}`);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalLoading(true);
    const result = await createGoal({
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.targetAmount.replace(",", ".")),
      currentAmount: parseFloat(goalForm.currentAmount.replace(",", ".") || "0"),
    });
    setGoalLoading(false);
    if (result.success) {
      setShowGoalModal(false);
      setGoalForm({ name: "", targetAmount: "", currentAmount: "" });
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const chartColors = generateColors(initialData.chartData.labels.length);

  const chartConfig = {
    labels: initialData.chartData.labels,
    datasets: [
      {
        data: initialData.chartData.data,
        backgroundColor: chartColors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        display: false // We will build a custom legend below
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { family: 'Inter', size: 14 },
        bodyFont: { family: 'Inter', size: 14 },
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <select 
            className="select" 
            style={{ width: "auto", margin: 0, padding: "0.5rem 1rem", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }}
            value={month} 
            onChange={(e) => handleFilterChange(parseInt(e.target.value), year)}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select 
            className="select" 
            style={{ width: "auto", margin: 0, padding: "0.5rem 1rem", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }}
            value={year} 
            onChange={(e) => handleFilterChange(month, parseInt(e.target.value))}
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Top Section - Greeting and Quick Access */}
      <div className="card" style={{ display: "flex", flexWrap: "wrap", marginBottom: "2rem", padding: "0", overflow: "hidden" }}>
        
        {/* Left Side: Overview */}
        <div style={{ flex: "1 1 350px", padding: "2rem" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Boa tarde,</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{initialData.userName}!</h2>
            <span style={{ fontSize: "1.5rem" }}>👋</span>
          </div>

          <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
             <div>
               <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.5rem" }}>Receitas no mês atual</p>
               <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--success)" }}>
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.totalIncomes)}
               </p>
             </div>
             <div>
               <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.5rem" }}>Despesas no mês atual</p>
               <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--danger)" }}>
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.totalExpenses)}
               </p>
             </div>
             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.5rem", width: "40px", height: "40px", cursor: "pointer" }}>
               <PieChart size={20} color="var(--text-muted)" />
             </div>
          </div>
        </div>

        {/* Right Side: Quick Access */}
        <div style={{ flex: "1 1 350px", padding: "2rem", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "rgba(0,0,0,0.01)" }}>
          <p style={{ fontWeight: 600, marginBottom: "1.5rem", textAlign: "center", width: "100%" }}>Acesso rápido</p>
          
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {/* Action 1: Despesa */}
            <Link href="/despesas" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid var(--danger)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--danger)", transition: "all 0.2s", backgroundColor: "white" }}>
                <ArrowDownCircle size={24} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase" }}>Despesa</span>
            </Link>

            {/* Action 2: Receita */}
            <Link href="/receitas" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid var(--success)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--success)", transition: "all 0.2s", backgroundColor: "white" }}>
                <ArrowUpCircle size={24} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase" }}>Receita</span>
            </Link>

            {/* Action 3: Transf */}
            <Link href="/contas" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid #94a3b8", display: "flex", justifyContent: "center", alignItems: "center", color: "#94a3b8", transition: "all 0.2s", backgroundColor: "white" }}>
                <Layers size={24} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase" }}>Transf.</span>
            </Link>

            {/* Action 4: Importar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", opacity: 0.5, cursor: "not-allowed" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid #cbd5e1", display: "flex", justifyContent: "center", alignItems: "center", color: "#94a3b8", backgroundColor: "white" }}>
                <Wallet size={24} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase" }}>Importar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Layout - 4 Columns */}
      <div className="dashboard-grid">
        
        {/* Gastos por Categoria */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <div style={{ width: "4px", height: "20px", backgroundColor: "var(--primary)", borderRadius: "2px" }}></div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--foreground)" }}>Gastos por Categoria</h3>
          </div>
          
          {initialData.chartData.labels.length > 0 ? (
            <>
              <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "2rem" }}>
                <Doughnut data={chartConfig} options={chartOptions as any} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {initialData.chartData.labels.map((label, index) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: chartColors[index] }}></span>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.chartData.data[index])}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", gap: "1rem" }}>
              <PieChart size={32} opacity={0.2} />
              <p style={{ fontSize: "0.875rem", textAlign: "center" }}>Não há despesas.</p>
            </div>
          )}
        </div>

        {/* Minhas Contas */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "4px", height: "20px", backgroundColor: "var(--success)", borderRadius: "2px" }}></div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--foreground)" }}>Minhas Contas</h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
            {initialData.accounts?.length > 0 ? (
              initialData.accounts.map((acc: any) => (
                <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Wallet size={16} color="var(--text-muted)" />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{acc.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Conta corrente</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary)" }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>Nenhuma conta cadastrada.</p>
            )}
          </div>
          
          <Link href="/contas" className="btn" style={{ width: "100%", marginTop: "1.5rem", border: "1px solid var(--border)", color: "var(--text-muted)", backgroundColor: "transparent", fontSize: "0.875rem", padding: "0.75rem" }}>
            Gerenciar contas
          </Link>
        </div>

        {/* Meus Cartões */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "4px", height: "20px", backgroundColor: "var(--primary)", borderRadius: "2px" }}></div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--foreground)" }}>Meus Cartões</h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
            {initialData.creditCards?.length > 0 ? (
              initialData.creditCards.map((card: any) => {
                const spent = card.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
                return (
                  <div key={card.id} style={{ display: "flex", flexDirection: "column", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CreditCard size={16} color="var(--text-muted)" />
                        </div>
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{card.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Cartão de crédito</p>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--success)", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "0.25rem 0.5rem", borderRadius: "12px", fontWeight: 600 }}>Ver fatura</span>
                    </div>
                    
                    <div style={{ display: "flex", backgroundColor: "var(--background)", padding: "1rem", borderRadius: "8px", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Limite Disponível</p>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit - spent)}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Fatura atual <span style={{ textTransform: "none", opacity: 0.7 }}>(Venc. {card.dueDay})</span></p>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>Nenhum cartão cadastrado.</p>
            )}
          </div>
          
          <Link href="/cartoes" className="btn" style={{ width: "100%", marginTop: "1.5rem", border: "1px solid var(--border)", color: "var(--text-muted)", backgroundColor: "transparent", fontSize: "0.875rem", padding: "0.75rem" }}>
            Gerenciar cartões
          </Link>
        </div>

        {/* Metas Financeiras */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "4px", height: "20px", backgroundColor: "var(--success)", borderRadius: "2px" }}></div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--foreground)" }}>Metas Financeiras</h3>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", letterSpacing: "0.5px" }}
            >
              Nova Meta
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
            {initialData.goals?.length > 0 ? (
              initialData.goals.map((goal: any) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const barColor = percent >= 75 ? "var(--success)" : percent >= 40 ? "var(--primary)" : "#f59e0b";
                return (
                  <div key={goal.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{goal.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.currentAmount)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.targetAmount)}
                      </p>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "var(--border)", borderRadius: "4px", overflow: "hidden", marginBottom: "0.4rem" }}>
                      <div style={{ height: "100%", width: `${percent}%`, backgroundColor: barColor, borderRadius: "4px", transition: "width 0.5s ease" }}></div>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: barColor, fontWeight: 600 }}>{percent}% concluído</p>
                  </div>
                );
              })
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", gap: "1rem", paddingTop: "2rem" }}>
                <Target size={32} opacity={0.2} />
                <p style={{ fontSize: "0.875rem", textAlign: "center" }}>Nenhuma meta definida.</p>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="btn btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                >
                  <Plus size={14} /> Criar primeira meta
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Nova Meta */}
      {showGoalModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card" style={{ width: "100%", maxWidth: "440px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Nova Meta Financeira</h2>
              <button onClick={() => setShowGoalModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGoal}>
              <div className="form-group">
                <label className="form-label">Nome da Meta</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ex: Reserva de Emergência"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor Alvo (R$)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 10000"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor Atual (R$)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 2500 (opcional)"
                  value={goalForm.currentAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="btn"
                  style={{ flex: 1, border: "1px solid var(--border)", color: "var(--text-muted)", backgroundColor: "transparent" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={goalLoading}
                >
                  {goalLoading ? "Salvando..." : "Salvar Meta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpCircle, ArrowDownCircle, Wallet, PieChart, Info, CreditCard, Target, Plus } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const handleFilterChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
    router.push(`/?month=${m}&year=${y}`);
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

      {/* Top Summary Cards */}
      <div className="summary-grid">
        
        {/* Card Saldo */}
        <div className="card" style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "140px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Saldo do Mês</p>
            <div style={{ padding: "0.4rem", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", color: "var(--primary)" }}>
              <Wallet size={18} />
            </div>
          </div>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--foreground)"}}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.balance)}
          </p>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "var(--primary)" }}></div>
        </div>

        {/* Card Receitas */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "140px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Total de Receitas</p>
            <div style={{ padding: "0.4rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "8px", color: "var(--success)" }}>
              <ArrowUpCircle size={18} />
            </div>
          </div>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)"}}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.totalIncomes)}
          </p>
        </div>

        {/* Card Despesas */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "140px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Total de Despesas</p>
            <div style={{ padding: "0.4rem", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", color: "var(--danger)" }}>
              <ArrowDownCircle size={18} />
            </div>
          </div>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--danger)"}}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Bottom Layout - 4 Columns */}
      <div className="dashboard-grid">
        
        {/* Gastos por Categoria */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <PieChart size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Gastos por Categoria</h3>
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
                      <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.chartData.data[index])}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", gap: "1rem" }}>
              <Info size={32} opacity={0.2} />
              <p style={{ fontSize: "0.875rem", textAlign: "center" }}>Não há despesas.</p>
            </div>
          )}
        </div>

        {/* Minhas Contas */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Wallet size={18} color="var(--primary)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Minhas Contas</h3>
            </div>
            <Link href="/contas" style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, textTransform: "uppercase" }}>Ver Todas</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
            {initialData.accounts?.length > 0 ? (
              initialData.accounts.map((acc: any) => (
                <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <Wallet size={16} color="var(--text-muted)" />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>{acc.name}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>Nenhuma conta cadastrada.</p>
            )}
          </div>
          
          <Link href="/contas" className="btn" style={{ width: "100%", marginTop: "1.5rem", border: "1px dashed var(--border)", color: "var(--text-muted)", backgroundColor: "transparent", fontSize: "0.875rem", padding: "0.75rem" }}>
            <Plus size={16} /> Conectar
          </Link>
        </div>

        {/* Meus Cartões */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CreditCard size={18} color="var(--primary)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Meus Cartões</h3>
            </div>
            <Link href="/cartoes" style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, textTransform: "uppercase" }}>Ver Todos</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
            {initialData.creditCards?.length > 0 ? (
              initialData.creditCards.map((card: any) => {
                const spent = card.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
                return (
                  <div key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ padding: "0.4rem 0.6rem", borderRadius: "4px", backgroundColor: "var(--primary)", color: "white", fontSize: "0.7rem", fontWeight: 800 }}>
                        {card.name.substring(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>{card.name}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Limite: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit)}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--success)" }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}</p>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>Nenhum cartão cadastrado.</p>
            )}
          </div>
          
          <Link href="/cartoes" className="btn" style={{ width: "100%", marginTop: "1.5rem", border: "1px dashed var(--border)", color: "var(--text-muted)", backgroundColor: "transparent", fontSize: "0.875rem", padding: "0.75rem" }}>
            <Plus size={16} /> Adicionar
          </Link>
        </div>

        {/* Metas Financeiras */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Target size={18} color="var(--primary)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Metas Financeiras</h3>
            </div>
            <button style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, textTransform: "uppercase", cursor: "pointer" }}>Nova Meta</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
            {initialData.goals?.length > 0 ? (
              initialData.goals.map((goal: any) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>{goal.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.currentAmount)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.targetAmount)}
                      </p>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
                      <div style={{ height: "100%", width: `${percent}%`, backgroundColor: "var(--primary)", borderRadius: "3px" }}></div>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>{percent}% concluído</p>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>Nenhuma meta definida.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

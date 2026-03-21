"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ReportsClient({ initialData, currentMonth, currentYear }: { initialData: any, currentMonth: number, currentYear: number }) {
  const router = useRouter();

  const handlePrevMonth = () => {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    router.push(`/relatorios?month=${m}&year=${y}`);
  };

  const handleNextMonth = () => {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    router.push(`/relatorios?month=${m}&year=${y}`);
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('pt-BR', { month: 'long' });

  if (!initialData) return <div>Sem dados</div>;

  const barData = {
    labels: initialData.cashFlow.labels,
    datasets: [
      {
        label: 'Receitas',
        data: initialData.cashFlow.incomes,
        backgroundColor: '#10b981', // success
        borderRadius: 4,
      },
      {
        label: 'Despesas',
        data: initialData.cashFlow.expenses,
        backgroundColor: '#ef4444', // danger
        borderRadius: 4,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { family: 'Inter', color: '#64748b' } // text-muted color
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', size: 14 },
        bodyFont: { family: 'Inter', size: 14 },
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { border: { display: false } }
    }
  };

  const doughnutData = {
    labels: initialData.categoryChart.labels,
    datasets: [
      {
        data: initialData.categoryChart.data,
        backgroundColor: initialData.categoryChart.colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '75%',
    plugins: {
      legend: { display: false },
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
      <h1 className="page-title">Gráficos e Relatórios</h1>

      <div className="card" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={handlePrevMonth} className="btn" style={{ background: "transparent", color: "var(--foreground)" }}><ChevronLeft /></button>
        <h2 style={{ fontSize: "1.25rem", textTransform: "capitalize", fontWeight: 600 }}>{monthName} {currentYear}</h2>
        <button onClick={handleNextMonth} className="btn" style={{ background: "transparent", color: "var(--foreground)" }}><ChevronRight /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "2rem" }}>
        
        {/* Gráfico Barras (Fluxo de Caixa) */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>Fluxo de Caixa Diário</h3>
          <div style={{ flex: 1, minHeight: "350px", position: "relative" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Gráfico Rosca (Categorias) */}
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>Despesas por Categoria</h3>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "relative", width: "250px", height: "250px" }}>
              {initialData.categoryChart.data.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)", borderRadius: "50%", color: "var(--text-muted)", border: "8px solid var(--border)" }}>
                  Sem despesas
                </div>
              )}
              {initialData.categoryChart.data.length > 0 && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Total</p>
                  <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--danger)" }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.totals.expenses)}
                  </p>
                </div>
              )}
            </div>

            <div style={{ flex: "1 1 200px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {initialData.categoryChart.breakdown.map((cat: any) => (
                  <li key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: cat.color }}></div>
                      <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>{cat.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 600 }}>{cat.percentage.toFixed(1)}%</span>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.value)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import { PieChart, BarChart2, Info } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const generateColors = (count: number) => {
  const colors = [
    "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", 
    "#10b981", "#34d399", "#6ee7b7", "#f59e0b", "#fbbf24", 
    "#fcd34d", "#ef4444", "#f87171", "#fca5a5"
  ];
  return colors.slice(0, count);
};

export default function ReportsClient({ initialData, initialYear }: { initialData: any, initialYear: number }) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);

  const handleYearChange = (y: number) => {
    setYear(y);
    router.push(`/relatorios?year=${y}`);
  };

  // Gráfico de Barras - Comparação
  const barChartData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Receitas',
        data: initialData.monthlyComparison.incomes,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Despesas',
        data: initialData.monthlyComparison.expenses,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { family: 'Inter', size: 13 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', size: 14 },
        bodyFont: { family: 'Inter', size: 14 },
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { family: 'Inter' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' } }
      }
    }
  };

  // Gráfico de Rosca - Categorias
  const pieChartData = {
    labels: initialData.expensesByCategory.labels,
    datasets: [{
      data: initialData.expensesByCategory.data,
      backgroundColor: generateColors(initialData.expensesByCategory.labels.length),
      borderWidth: 0,
    }]
  };

  const pieChartOptions = {
    cutout: '70%',
    plugins: {
      legend: { position: 'right' as const, labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 13 } } },
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

  const totalIncomes = initialData.monthlyComparison.incomes.reduce((a: number, b: number) => a + b, 0);
  const totalExpenses = initialData.monthlyComparison.expenses.reduce((a: number, b: number) => a + b, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Relatórios e Gráficos</h1>
        
        <select 
          className="select" 
          style={{ width: "auto", margin: 0 }}
          value={year} 
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
        >
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - 2 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card">
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase" }}>Balanço Anual</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: totalIncomes - totalExpenses >= 0 ? "var(--success)" : "var(--danger)"}}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncomes - totalExpenses)}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Gráfico Bar */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <BarChart2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Receitas vs Despesas ({year})</h3>
          </div>
          
          <div style={{ height: "400px", width: "100%" }}>
            <Bar data={barChartData} options={barChartOptions as any} />
          </div>
        </div>

        {/* Gráfico Doughnut */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <PieChart size={20} color="var(--primary)" />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Gastos por Categoria ({year})</h3>
          </div>
          
          {initialData.expensesByCategory.labels.length > 0 ? (
            <div style={{ height: "350px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Doughnut data={pieChartData} options={pieChartOptions as any} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "250px", color: "var(--text-muted)", gap: "1rem" }}>
              <Info size={48} opacity={0.2} />
              <p>Não há despesas registradas em {year}.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

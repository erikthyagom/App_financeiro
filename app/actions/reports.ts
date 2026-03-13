"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "./auth";

export async function getReportsData(year: number) {
  const userId = await getCurrentUserId();
  if (!userId) return {
    monthlyComparison: { incomes: [], expenses: [] },
    expensesByCategory: { labels: [], data: [] }
  };

  // Obter receitas e despesas do ano
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { category: true },
    }),
  ]);

  // Agrupar receitas por mês
  const monthlyIncomes = Array(12).fill(0);
  incomes.forEach(inc => {
    const month = inc.date.getMonth();
    monthlyIncomes[month] += inc.amount;
  });

  // Agrupar despesas por mês
  const monthlyExpenses = Array(12).fill(0);
  const expensesByCategory: Record<string, number> = {};

  expenses.forEach(exp => {
    const month = exp.date.getMonth();
    monthlyExpenses[month] += exp.amount;

    const catName = exp.category?.name || "Sem categoria";
    expensesByCategory[catName] = (expensesByCategory[catName] || 0) + exp.amount;
  });

  return {
    monthlyComparison: {
      incomes: monthlyIncomes,
      expenses: monthlyExpenses,
    },
    expensesByCategory: {
      labels: Object.keys(expensesByCategory),
      data: Object.values(expensesByCategory),
    }
  };
}

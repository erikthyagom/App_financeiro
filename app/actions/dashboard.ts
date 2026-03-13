"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardData(month?: number, year?: number) {
  const currentDate = new Date();
  const targetMonth = month !== undefined ? month : currentDate.getMonth(); // 0-based
  const targetYear = year !== undefined ? year : currentDate.getFullYear();

  // Create start and end dates for the target month
  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const [incomes, expenses, accounts, creditCards, goals] = await Promise.all([
    prisma.income.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { category: true },
    }),
    prisma.account.findMany(),
    prisma.creditCard.findMany({
      include: { expenses: { where: { date: { gte: startDate, lte: endDate } } } }
    }),
    prisma.goal.findMany()
  ]);

  const totalIncomes = incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  // Group expenses by category for the chart
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((expense: any) => {
    const catName = expense.category?.name || "Sem categoria";
    expensesByCategory[catName] = (expensesByCategory[catName] || 0) + expense.amount;
  });

  const chartData = {
    labels: Object.keys(expensesByCategory),
    data: Object.values(expensesByCategory),
  };

  return {
    totalIncomes,
    totalExpenses,
    balance,
    chartData,
    accounts,
    creditCards,
    goals
  };
}

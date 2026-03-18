"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "./auth";

export async function getDashboardData(month?: number, year?: number) {
  const userId = await getCurrentUserId();
  if (!userId) return {
    totalIncomes: 0, totalExpenses: 0, balance: 0,
    chartData: { labels: [], data: [] },
    accounts: [], creditCards: [], goals: [],
    userName: ""
  };

  const currentDate = new Date();
  const targetMonth = month !== undefined ? month : currentDate.getMonth(); // 0-based
  const targetYear = year !== undefined ? year : currentDate.getFullYear();

  // Create start and end dates for the target month
  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const [incomes, expenses, accounts, creditCards, goals, user] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { category: true },
    }),
    prisma.account.findMany({ where: { userId } }),
    prisma.creditCard.findMany({
      where: { userId },
      include: { expenses: { where: { date: { gte: startDate, lte: endDate } } } }
    }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
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
    goals,
    userName: user?.name || "Usuário",
  };
}

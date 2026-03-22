"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "./auth";

export async function getDashboardData(month?: number, year?: number) {
  const userId = await getCurrentUserId();
  if (!userId) return {
    totalIncomes: 0, totalExpenses: 0, balance: 0,
    chartData: { labels: [], data: [] },
    accounts: [], creditCards: [], goals: [], categories: [],
    userName: ""
  };

  const currentDate = new Date();
  const targetMonth = month !== undefined ? month : currentDate.getMonth(); // 0-based
  const targetYear = year !== undefined ? year : currentDate.getFullYear();

  // Create start and end dates for the target month
  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const [incomes, expenses, accounts, creditCards, goals, user, categories] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
    }),
    prisma.expense.findMany({
      where: { 
        userId, 
        date: { gte: startDate, lte: endDate },
        paymentMethod: { not: "INVOICE_PAYMENT" }
      },
      include: { category: true },
    }),
    prisma.account.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.creditCard.findMany({
      where: { userId },
      include: { expenses: { where: { date: { gte: startDate, lte: endDate } } } },
      orderBy: { name: "asc" }
    }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.category.findMany({ where: { userId } })
  ]);

  const validExpenses = expenses.filter((expense: any) => {
    if (expense.paymentMethod !== "CREDIT" || !expense.creditCardId) return true;
    
    const card = creditCards.find((c: any) => c.id === expense.creditCardId);
    if (!card) return true;

    const { closingDay, dueDay } = card;
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();
    const expenseDay = expenseDate.getDate();

    let invoiceMonth = expenseMonth;
    let invoiceYear = expenseYear;

    if (expenseDay > closingDay) {
      invoiceMonth++;
      if (invoiceMonth > 11) {
        invoiceMonth = 0;
        invoiceYear++;
      }
    }

    let dueMonth = invoiceMonth;
    let dueYear = invoiceYear;
    if (dueDay < closingDay) {
      dueMonth++;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear++;
      }
    }

    const isDueFuture = dueYear > targetYear || (dueYear === targetYear && dueMonth > targetMonth);
    return !isDueFuture; // Only include if it is NOT due in the future
  });

  const totalIncomes = incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpenses = validExpenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  // Group expenses by category for the chart
  const expensesByCategory: Record<string, number> = {};
  validExpenses.forEach((expense: any) => {
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
    categories,
    goals,
    userName: user?.name || "Usuário",
  };
}

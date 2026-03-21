"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "./auth";

export async function getReportsData(month: number, year: number) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const daysInMonth = endDate.getDate();

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } }
    }),
    prisma.expense.findMany({
      where: { 
        userId, 
        date: { gte: startDate, lte: endDate },
        paymentMethod: { not: "INVOICE_PAYMENT" }
      },
      include: { category: true }
    })
  ]);

  // DAILY CASH FLOW
  // Arrays length = daysInMonth, index 0 = day 1
  const dailyIncomes = Array(daysInMonth).fill(0);
  const dailyExpenses = Array(daysInMonth).fill(0);

  incomes.forEach(inc => {
    const day = new Date(inc.date).getDate();
    dailyIncomes[day - 1] += inc.amount;
  });

  expenses.forEach(exp => {
    const day = new Date(exp.date).getDate();
    dailyExpenses[day - 1] += exp.amount;
  });

  const cashFlow = {
    labels: Array.from({ length: daysInMonth }, (_, k) => (k + 1).toString()),
    incomes: dailyIncomes,
    expenses: dailyExpenses
  };

  // EXPENSES BY CATEGORY
  const expensesByCategory: Record<string, { value: number, color: string }> = {};
  
  let totalExpenses = 0;
  expenses.forEach(exp => {
    totalExpenses += exp.amount;
    const catName = exp.category?.name || "Outros";
    const catColor = exp.category?.color || "#94a3b8";
    
    if (!expensesByCategory[catName]) {
      expensesByCategory[catName] = { value: 0, color: catColor };
    }
    expensesByCategory[catName].value += exp.amount;
  });

  // Calculate percentages and sort
  const categoryBreakdown = Object.keys(expensesByCategory).map(name => {
    const val = expensesByCategory[name].value;
    return {
      name,
      value: val,
      percentage: totalExpenses > 0 ? (val / totalExpenses) * 100 : 0,
      color: expensesByCategory[name].color
    };
  }).sort((a, b) => b.value - a.value); // Sort descending

  const categoryChart = {
    labels: categoryBreakdown.map(c => c.name),
    colors: categoryBreakdown.map(c => c.color),
    data: categoryBreakdown.map(c => c.value),
    breakdown: categoryBreakdown
  };

  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  return {
    cashFlow,
    categoryChart,
    totals: {
      incomes: totalIncomes,
      expenses: totalExpenses,
      balance
    }
  };
}

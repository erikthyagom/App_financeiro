"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "./auth";
import { revalidatePath } from "next/cache";

export async function getAllTransactions(month: number, year: number) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { incomes: 0, expenses: 0, balance: 0, list: [] };
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { category: true, account: true }
    }),
    prisma.expense.findMany({
      where: { 
        userId, 
        date: { gte: startDate, lte: endDate },
        paymentMethod: { not: "INVOICE_PAYMENT" }
      },
      include: { category: true, account: true, creditCard: true }
    })
  ]);

  const totalIncomes = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const normalizedIncomes = incomes.map(i => ({
    id: i.id,
    type: "INCOME" as const,
    description: i.description,
    amount: i.amount,
    date: i.date,
    category: i.category,
    sourceName: i.account?.name || "Saldo Geral"
  }));

  const normalizedExpenses = expenses.map(e => ({
    id: e.id,
    type: "EXPENSE" as const,
    description: e.description,
    amount: e.amount,
    date: e.date,
    category: e.category,
    sourceName: e.creditCard?.name ? `${e.creditCard.name}` : (e.account?.name || "Saldo Geral")
  }));

  const list = [...normalizedIncomes, ...normalizedExpenses].sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    incomes: totalIncomes,
    expenses: totalExpenses,
    balance: balance,
    list
  };
}

export async function deleteTransaction(id: string, type: "INCOME" | "EXPENSE") {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    if (type === "INCOME") {
      await prisma.income.delete({ where: { id, userId } });
    } else {
      await prisma.expense.delete({ where: { id, userId } });
    }
    revalidatePath("/lancamentos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Falha ao deletar transação: " + error.message };
  }
}

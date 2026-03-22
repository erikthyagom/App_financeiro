"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./auth";

export async function getExpenses() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { category: true, creditCard: true },
  });
}

export async function createExpense(data: { 
  description: string; 
  amount: number; 
  date: Date; 
  paymentMethod: string; 
  note?: string; 
  categoryId: string; 
  creditCardId?: string; 
  accountId?: string;
  repeatMode?: string;
  fixedFrequency?: string;
  installmentsCount?: number;
  installmentsPeriod?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    const { 
      repeatMode, fixedFrequency, installmentsCount, installmentsPeriod,
      ...baseExpenseData 
    } = data;

    // Helper: deduct from account only for non-credit payments
    const shouldDeductFromAccount = (method: string) =>
      method !== "CREDITO" && method !== "INVOICE_PAYMENT";

    if (repeatMode === "installments" && installmentsCount && installmentsCount > 1) {
      const expensesToCreate = [];
      const baseDate = new Date(baseExpenseData.date);
      const amountPerInstallment = baseExpenseData.amount / installmentsCount;
      
      for (let i = 0; i < installmentsCount; i++) {
        const d = new Date(baseDate);
        if (installmentsPeriod === "Meses") d.setMonth(d.getMonth() + i);
        else if (installmentsPeriod === "Dias") d.setDate(d.getDate() + i);
        else if (installmentsPeriod === "Semanas") d.setDate(d.getDate() + i * 7);
        else if (installmentsPeriod === "Anos") d.setFullYear(d.getFullYear() + i);
        
        expensesToCreate.push({
          ...baseExpenseData,
          userId,
          date: d,
          description: `${baseExpenseData.description} (${i + 1}/${installmentsCount})`,
          amount: amountPerInstallment
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.expense.createMany({ data: expensesToCreate });
        // For installments, deduct total from account once
        if (baseExpenseData.accountId && shouldDeductFromAccount(baseExpenseData.paymentMethod)) {
          await tx.account.update({
            where: { id: baseExpenseData.accountId },
            data: { balance: { decrement: baseExpenseData.amount } },
          });
        }
      });
    } else if (repeatMode === "fixed" && fixedFrequency) {
      const expensesToCreate = [];
      const baseDate = new Date(baseExpenseData.date);
      const occurrences = 12; // Project 12 occurrences into the future
      
      for (let i = 0; i < occurrences; i++) {
        const d = new Date(baseDate);
        if (fixedFrequency === "Mensal") d.setMonth(d.getMonth() + i);
        else if (fixedFrequency === "Semanal") d.setDate(d.getDate() + i * 7);
        else if (fixedFrequency === "Anual") d.setFullYear(d.getFullYear() + i);
        else if (fixedFrequency === "Diário") d.setDate(d.getDate() + i);
        
        expensesToCreate.push({
          ...baseExpenseData,
          userId,
          date: d,
          description: baseExpenseData.description,
          amount: baseExpenseData.amount
        });
      }
      
      await prisma.$transaction(async (tx) => {
        await tx.expense.createMany({ data: expensesToCreate });
        // For fixed recurring, only deduct the first occurrence from account
        if (baseExpenseData.accountId && shouldDeductFromAccount(baseExpenseData.paymentMethod)) {
          await tx.account.update({
            where: { id: baseExpenseData.accountId },
            data: { balance: { decrement: baseExpenseData.amount } },
          });
        }
      });
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.expense.create({ 
          data: { ...baseExpenseData, userId } 
        });
        // Deduct from account if a non-credit payment and account is linked
        if (baseExpenseData.accountId && shouldDeductFromAccount(baseExpenseData.paymentMethod)) {
          await tx.account.update({
            where: { id: baseExpenseData.accountId },
            data: { balance: { decrement: baseExpenseData.amount } },
          });
        }
      });
    }
    revalidatePath("/despesas");
    revalidatePath("/contas");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar despesa:", error);
    return { success: false, error: "Failed to create expense: " + error.message };
  }
}

export async function updateExpense(id: string, data: { 
  description: string; 
  amount: number; 
  date: Date; 
  paymentMethod: string; 
  note?: string; 
  categoryId: string; 
  creditCardId?: string; 
  accountId?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  const shouldDeductFromAccount = (method: string) =>
    method !== "CREDITO" && method !== "INVOICE_PAYMENT";

  try {
    const { 
      repeatMode, fixedFrequency, installmentsCount, installmentsPeriod,
      ...baseExpenseData 
    } = data as any;

    await prisma.$transaction(async (tx) => {
      // Fetch old expense to reverse its balance effect
      const oldExpense = await tx.expense.findUnique({ where: { id, userId } });

      await tx.expense.update({
        where: { id, userId },
        data: baseExpenseData,
      });

      // Reverse old account deduction
      if (oldExpense?.accountId && shouldDeductFromAccount(oldExpense.paymentMethod)) {
        await tx.account.update({
          where: { id: oldExpense.accountId },
          data: { balance: { increment: oldExpense.amount } },
        });
      }

      // Apply new account deduction
      if (baseExpenseData.accountId && shouldDeductFromAccount(baseExpenseData.paymentMethod)) {
        await tx.account.update({
          where: { id: baseExpenseData.accountId },
          data: { balance: { decrement: baseExpenseData.amount } },
        });
      }
    });

    revalidatePath("/despesas");
    revalidatePath("/contas");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar despesa:", error);
    return { success: false, error: "Failed to update expense: " + error.message };
  }
}

export async function deleteExpense(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  const shouldDeductFromAccount = (method: string) =>
    method !== "CREDITO" && method !== "INVOICE_PAYMENT";

  try {
    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id, userId } });

      await tx.expense.delete({ where: { id, userId } });

      // Refund amount back to account
      if (expense?.accountId && shouldDeductFromAccount(expense.paymentMethod)) {
        await tx.account.update({
          where: { id: expense.accountId },
          data: { balance: { increment: expense.amount } },
        });
      }
    });

    revalidatePath("/despesas");
    revalidatePath("/contas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete expense." };
  }
}

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
      
      await prisma.expense.createMany({ data: expensesToCreate });
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
      
      await prisma.expense.createMany({ data: expensesToCreate });
    } else {
      await prisma.expense.create({ 
        data: { ...baseExpenseData, userId } 
      });
    }
    revalidatePath("/despesas");
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

  try {
    const { 
      repeatMode, fixedFrequency, installmentsCount, installmentsPeriod,
      ...baseExpenseData 
    } = data as any;

    await prisma.expense.update({
      where: { id, userId },
      data: baseExpenseData,
    });
    revalidatePath("/despesas");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar despesa:", error);
    return { success: false, error: "Failed to update expense: " + error.message };
  }
}

export async function deleteExpense(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.expense.delete({ 
      where: { id, userId } 
    });
    revalidatePath("/despesas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete expense." };
  }
}

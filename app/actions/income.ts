"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./auth";

export async function getIncomes() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return await prisma.income.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { category: true },
  });
}

export async function createIncome(data: { 
  description: string; 
  amount: number; 
  date: Date; 
  note?: string; 
  categoryId: string;
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
      repeatMode, fixedFrequency, installmentsCount, installmentsPeriod, accountId,
      ...baseIncomeData 
    } = data;

    await prisma.$transaction(async (tx) => {
      let totalToAddToAccount = 0;

      if (repeatMode === "installments" && installmentsCount && installmentsCount > 1) {
        const incomesToCreate = [];
        const baseDate = new Date(baseIncomeData.date);
        const amountPerInstallment = baseIncomeData.amount / installmentsCount;
        
        for (let i = 0; i < installmentsCount; i++) {
          const d = new Date(baseDate);
          if (installmentsPeriod === "Meses") d.setMonth(d.getMonth() + i);
          else if (installmentsPeriod === "Dias") d.setDate(d.getDate() + i);
          else if (installmentsPeriod === "Semanas") d.setDate(d.getDate() + i * 7);
          else if (installmentsPeriod === "Anos") d.setFullYear(d.getFullYear() + i);
          
          incomesToCreate.push({
            ...baseIncomeData,
            userId,
            accountId,
            date: d,
            description: `${baseIncomeData.description} (${i + 1}/${installmentsCount})`,
            amount: amountPerInstallment
          });
        }
        
        await tx.income.createMany({ data: incomesToCreate });
        totalToAddToAccount = baseIncomeData.amount; // Total sum of installments
      } else if (repeatMode === "fixed" && fixedFrequency) {
        const incomesToCreate = [];
        const baseDate = new Date(baseIncomeData.date);
        const occurrences = 12; // Project 12 occurrences into the future
        
        for (let i = 0; i < occurrences; i++) {
          const d = new Date(baseDate);
          if (fixedFrequency === "Mensal") d.setMonth(d.getMonth() + i);
          else if (fixedFrequency === "Semanal") d.setDate(d.getDate() + i * 7);
          else if (fixedFrequency === "Anual") d.setFullYear(d.getFullYear() + i);
          else if (fixedFrequency === "Diário") d.setDate(d.getDate() + i);
          
          incomesToCreate.push({
            ...baseIncomeData,
            userId,
            accountId,
            date: d,
            description: baseIncomeData.description,
            amount: baseIncomeData.amount
          });
        }
        
        await tx.income.createMany({ data: incomesToCreate });
        totalToAddToAccount = baseIncomeData.amount * occurrences;
      } else {
        await tx.income.create({ 
          data: { ...baseIncomeData, userId, accountId } 
        });
        totalToAddToAccount = baseIncomeData.amount;
      }

      if (accountId && totalToAddToAccount > 0) {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: totalToAddToAccount } }
        });
      }
    });

    revalidatePath("/receitas");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar receita:", error);
    return { success: false, error: "Failed to create income: " + error.message };
  }
}

export async function updateIncome(id: string, data: { description: string; amount: number; date: Date; note?: string; categoryId: string; accountId?: string }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      // Find old income
      const oldIncome = await tx.income.findUnique({ where: { id, userId } });
      if (!oldIncome) throw new Error("Income not found");

      // Revert old account balance if it was linked
      if (oldIncome.accountId) {
        await tx.account.update({
          where: { id: oldIncome.accountId },
          data: { balance: { decrement: oldIncome.amount } }
        });
      }

      // Apply new account balance if it is linked
      if (data.accountId) {
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: data.amount } }
        });
      }

      // Update the income
      await tx.income.update({
        where: { id, userId },
        data: data as any,
      });
    });

    revalidatePath("/receitas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to update income: " + error.message };
  }
}

export async function deleteIncome(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      const oldIncome = await tx.income.findUnique({ where: { id, userId } });
      if (!oldIncome) throw new Error("Income not found");

      if (oldIncome.accountId) {
        await tx.account.update({
          where: { id: oldIncome.accountId },
          data: { balance: { decrement: oldIncome.amount } }
        });
      }

      await tx.income.delete({ 
        where: { id, userId } 
      });
    });

    revalidatePath("/receitas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete income: " + error.message };
  }
}

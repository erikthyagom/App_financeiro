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
      ...baseIncomeData 
    } = data;

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
          date: d,
          description: `${baseIncomeData.description} (${i + 1}/${installmentsCount})`,
          amount: amountPerInstallment
        });
      }
      
      await prisma.income.createMany({ data: incomesToCreate });
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
          date: d,
          description: baseIncomeData.description,
          amount: baseIncomeData.amount
        });
      }
      
      await prisma.income.createMany({ data: incomesToCreate });
    } else {
      await prisma.income.create({ 
        data: { ...baseIncomeData, userId } 
      });
    }

    revalidatePath("/receitas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create income" };
  }
}

export async function updateIncome(id: string, data: { description: string; amount: number; date: Date; note?: string; categoryId: string }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.income.update({
      where: { id, userId },
      data,
    });
    revalidatePath("/receitas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update income" };
  }
}

export async function deleteIncome(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.income.delete({ 
      where: { id, userId } 
    });
    revalidatePath("/receitas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete income." };
  }
}

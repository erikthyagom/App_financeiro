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

export async function createIncome(data: { description: string; amount: number; date: Date; note?: string; categoryId: string }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.income.create({ 
      data: { ...data, userId } 
    });
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

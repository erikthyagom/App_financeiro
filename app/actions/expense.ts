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
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.expense.create({ 
      data: { ...data, userId } 
    });
    revalidatePath("/despesas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create expense" };
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
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.expense.update({
      where: { id, userId },
      data,
    });
    revalidatePath("/despesas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update expense" };
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

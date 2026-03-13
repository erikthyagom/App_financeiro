"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExpenses() {
  return await prisma.expense.findMany({
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
  try {
    await prisma.expense.create({ data });
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
  try {
    await prisma.expense.update({
      where: { id },
      data,
    });
    revalidatePath("/despesas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update expense" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/despesas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete expense." };
  }
}

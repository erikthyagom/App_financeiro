"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getIncomes() {
  return await prisma.income.findMany({
    orderBy: { date: "desc" },
    include: { category: true },
  });
}

export async function createIncome(data: { description: string; amount: number; date: Date; note?: string; categoryId: string }) {
  try {
    await prisma.income.create({ data });
    revalidatePath("/receitas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create income" };
  }
}

export async function updateIncome(id: string, data: { description: string; amount: number; date: Date; note?: string; categoryId: string }) {
  try {
    await prisma.income.update({
      where: { id },
      data,
    });
    revalidatePath("/receitas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update income" };
  }
}

export async function deleteIncome(id: string) {
  try {
    await prisma.income.delete({ where: { id } });
    revalidatePath("/receitas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete income." };
  }
}

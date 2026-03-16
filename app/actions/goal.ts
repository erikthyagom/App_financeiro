"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./auth";

export async function getGoals() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGoal(data: { name: string; targetAmount: number; currentAmount: number }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.goal.create({
      data: { ...data, userId },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar meta:", error);
    return { success: false, error: "Falha ao criar meta: " + (error?.message || String(error)) };
  }
}

export async function updateGoal(id: string, data: { name: string; targetAmount: number; currentAmount: number }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.goal.update({
      where: { id, userId },
      data,
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar meta" };
  }
}

export async function deleteGoal(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.goal.delete({ where: { id, userId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao excluir meta" };
  }
}

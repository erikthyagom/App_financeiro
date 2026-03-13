"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./auth";

export async function getCreditCards() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return await prisma.creditCard.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createCreditCard(data: { name: string; limit: number; closingDay: number; dueDay: number }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.creditCard.create({
      data: { ...data, userId },
    });
    revalidatePath("/cartoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create credit card" };
  }
}

export async function updateCreditCard(id: string, data: { name: string; limit: number; closingDay: number; dueDay: number }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.creditCard.update({
      where: { id, userId },
      data,
    });
    revalidatePath("/cartoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update credit card" };
  }
}

export async function deleteCreditCard(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.creditCard.delete({
      where: { id, userId },
    });
    revalidatePath("/cartoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete credit card. It might have associated expenses." };
  }
}

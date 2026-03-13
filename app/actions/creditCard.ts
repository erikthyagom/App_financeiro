"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCreditCards() {
  return await prisma.creditCard.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCreditCard(data: { name: string; limit: number; closingDay: number; dueDay: number }) {
  try {
    await prisma.creditCard.create({
      data,
    });
    revalidatePath("/cartoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create credit card" };
  }
}

export async function updateCreditCard(id: string, data: { name: string; limit: number; closingDay: number; dueDay: number }) {
  try {
    await prisma.creditCard.update({
      where: { id },
      data,
    });
    revalidatePath("/cartoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update credit card" };
  }
}

export async function deleteCreditCard(id: string) {
  try {
    await prisma.creditCard.delete({
      where: { id },
    });
    revalidatePath("/cartoes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete credit card. It might have associated expenses." };
  }
}

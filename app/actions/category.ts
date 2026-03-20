"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./auth";

export async function getCategories() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string, type: string = "EXPENSE", color: string = "#94a3b8", icon: string = "List") {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.category.create({
      data: { name, type, color, icon, userId },
    });
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, name: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.category.update({
      where: { id, userId },
      data: { name },
    });
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.category.delete({
      where: { id, userId },
    });
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete category. It might be in use." };
  }
}

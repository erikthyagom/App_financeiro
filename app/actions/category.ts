"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  try {
    await prisma.category.create({
      data: { name },
    });
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    await prisma.category.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/categorias");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete category. It might be in use." };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./auth";

export async function getAccounts() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return await prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createAccount(data: { name: string; balance: number }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.account.create({ 
      data: { ...data, userId } 
    });
    revalidatePath("/contas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar conta" };
  }
}

export async function updateAccount(id: string, data: { name: string; balance: number }) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.account.update({
      where: { id, userId },
      data,
    });
    revalidatePath("/contas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar conta" };
  }
}

export async function deleteAccount(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.account.delete({ 
      where: { id, userId } 
    });
    revalidatePath("/contas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao excluir conta. Verifique se existem transações vinculadas." };
  }
}

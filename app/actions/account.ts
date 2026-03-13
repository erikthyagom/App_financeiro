"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  return await prisma.account.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createAccount(data: { name: string; balance: number }) {
  try {
    await prisma.account.create({ data });
    revalidatePath("/contas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao criar conta" };
  }
}

export async function updateAccount(id: string, data: { name: string; balance: number }) {
  try {
    await prisma.account.update({
      where: { id },
      data,
    });
    revalidatePath("/contas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar conta" };
  }
}

export async function deleteAccount(id: string) {
  try {
    await prisma.account.delete({ where: { id } });
    revalidatePath("/contas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao excluir conta. Verifique se existem transações vinculadas." };
  }
}

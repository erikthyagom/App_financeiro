"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "./auth";

export async function updateUserName(newName: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  if (!newName || newName.trim().length === 0) {
    return { success: false, error: "Nome não pode estar vazio" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: newName.trim() },
    });
    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar nome" };
  }
}

export async function resetTransactions() {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      // Deletar todas as transações (Receitas e Despesas)
      await tx.income.deleteMany({ where: { userId } });
      await tx.expense.deleteMany({ where: { userId } });
      
      // Zerar todos os saldos das contas
      await tx.account.updateMany({
        where: { userId },
        data: { balance: 0 },
      });

      // Zerar o progresso de todas as metas
      await tx.goal.updateMany({
        where: { userId },
        data: { currentAmount: 0 },
      });
    });

    revalidatePath("/");
    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao zerar movimentações" };
  }
}

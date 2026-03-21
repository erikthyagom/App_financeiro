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

export async function getInvoiceData(creditCardId: string, month: number, year: number) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const card = await prisma.creditCard.findUnique({
    where: { id: creditCardId, userId }
  });

  if (!card) return null;

  const { closingDay, dueDay } = card;

  // Invoice for `month`/`year`
  // An invoice for month M covers expenses from M-1(closingDay+1) to M(closingDay)
  // month is 0-indexed (0 = Jan, 11 = Dec)
  
  const startDate = new Date(year, month - 1, closingDay + 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, closingDay, 23, 59, 59, 999);
  const dueDate = new Date(year, month, dueDay, 23, 59, 59, 999);
  
  // Se o dueDay é menor que o closingDay, significa que vence no mês seguinte!
  if (dueDay < closingDay) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      creditCardId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      category: true
    },
    orderBy: { date: "desc" }
  });

  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Check if there is an INVOICE_PAYMENT for this specific card and month
  // Ideally, an invoice payment is done near the dueDate, so we search around it.
  const paymentRecord = await prisma.expense.findFirst({
    where: {
      userId,
      creditCardId,
      paymentMethod: "INVOICE_PAYMENT",
      date: {
        gte: startDate, // Has to be paid after the invoice opened
        lte: new Date(dueDate.getTime() + 15 * 24 * 60 * 60 * 1000) // Or paid up to 15 days late
      }
    }
  });

  let status = "Aberta";
  const now = new Date();
  
  if (paymentRecord) {
    status = "Paga";
  } else if (now > endDate && now <= dueDate) {
    status = "Fechada";
  } else if (now > dueDate) {
    status = "Vencida";
  }

  return {
    cardInfo: card,
    expenses,
    totalAmount,
    startDate,
    endDate,
    dueDate,
    status,
    paymentRecord
  };
}

export async function payInvoice(creditCardId: string, accountId: string, amount: number, date: Date) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Não autorizado" };

  try {
    const defaultCategory = await prisma.category.findFirst({
      where: { userId, type: "EXPENSE" }
    });

    if (!defaultCategory) {
      return { success: false, error: "Nenhuma categoria de despesa encontrada no sistema." };
    }

    await prisma.expense.create({
      data: {
        userId,
        description: "Pagamento de Fatura",
        amount,
        date,
        paymentMethod: "INVOICE_PAYMENT",
        categoryId: defaultCategory.id,
        accountId,
        creditCardId
      }
    });

    revalidatePath("/cartoes");
    revalidatePath("/despesas");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao pagar fatura:", error);
    return { success: false, error: "Failed to pay invoice: " + error.message };
  }
}

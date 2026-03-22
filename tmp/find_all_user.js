const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.findFirst({
    where: { name: { contains: 'inter', mode: 'insensitive' } }
  });

  if (!account) return;

  const allUserIncomes = await prisma.income.findMany({
    where: { userId: account.userId },
    include: { category: true, account: true }
  });

  const allUserExpenses = await prisma.expense.findMany({
    where: { userId: account.userId },
    include: { category: true, account: true }
  });

  console.log(`USER ID: ${account.userId}`);
  console.log("ALL INCOMES:");
  allUserIncomes.forEach(i => console.log(`- ${i.description}: ${i.amount} (${i.date}) - Account: ${i.account?.name || 'None'}`));

  console.log("\nALL EXPENSES:");
  allUserExpenses.forEach(e => console.log(`- ${e.description}: ${e.amount} (${e.date}) - Account: ${e.account?.name || 'None'}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

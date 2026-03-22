const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allIncomes = await prisma.income.findMany({ include: { account: true } });
  const allExpenses = await prisma.expense.findMany({ include: { account: true } });

  console.log("ALL INCOMES:");
  allIncomes.forEach(i => console.log(`- ${i.description}: ${i.amount} (Account: ${i.account?.name || 'None'})`));

  console.log("\nALL EXPENSES:");
  allExpenses.forEach(e => console.log(`- ${e.description}: ${e.amount} (Account: ${e.account?.name || 'None'})`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

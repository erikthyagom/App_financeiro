const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allIncomes = await prisma.income.findMany({ include: { account: true, user: true } });
  const allExpenses = await prisma.expense.findMany({ include: { account: true, user: true } });
  const allAccounts = await prisma.account.findMany({ include: { user: true } });

  console.log("ALL ACCOUNTS:");
  allAccounts.forEach(a => console.log(`- ${a.name}: ${a.balance} (User: ${a.user.email})`));

  console.log("\nALL INCOMES:");
  allIncomes.forEach(i => console.log(`- ${i.description}: ${i.amount} (Account: ${i.account?.name || 'None'}) (User: ${i.user.email})`));

  console.log("\nALL EXPENSES:");
  allExpenses.forEach(e => console.log(`- ${e.description}: ${e.amount} (Account: ${e.account?.name || 'None'}) (User: ${e.user.email})`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

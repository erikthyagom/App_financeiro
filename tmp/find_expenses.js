const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.findFirst({
    where: { name: { contains: 'inter', mode: 'insensitive' } }
  });

  if (!account) return;

  // Let's see if there are expenses created today
  const today = new Date();
  today.setHours(0,0,0,0);

  const recentExpenses = await prisma.expense.findMany({
    where: { 
      // userId: account.userId 
    },
    include: { account: true, category: true }
  });

  console.log("RECENT EXPENSES:");
  recentExpenses.forEach(e => {
    console.log(`- ${e.description}: ${e.amount} (Account: ${e.account?.name || 'None'}) - ID: ${e.id}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.findFirst({
    where: {
      name: { contains: 'inter', mode: 'insensitive' }
    },
    include: {
      incomes: true,
      expenses: true
    }
  });

  if (!account) {
    console.log("Account 'inter' not found.");
    return;
  }

  console.log(`Account: ${account.name} (ID: ${account.id})`);
  console.log(`Current Balance in DB: ${account.balance}`);
  
  console.log("\nIncomes:");
  account.incomes.forEach(i => console.log(`- ${i.description}: ${i.amount} (${i.date})`));
  
  console.log("\nExpenses:");
  account.expenses.forEach(e => console.log(`- ${e.description}: ${e.amount} (${e.date})`));

  const totalIncomes = account.incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalExpenses = account.expenses.reduce((acc, e) => acc + e.amount, 0);
  const calculatedBalance = totalIncomes - totalExpenses;

  console.log(`\nCalculated Balance (Incomes - Expenses): ${calculatedBalance}`);
  
  if (account.balance !== calculatedBalance) {
    console.log(`DISCREPANCY FOUND! DB has ${account.balance}, but sum is ${calculatedBalance}`);
  } else {
    console.log("DB balance matches the sum of transactions.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

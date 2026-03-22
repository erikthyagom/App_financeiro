const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.findFirst({
    where: { name: { contains: 'inter', mode: 'insensitive' } }
  });

  if (account) {
    const updated = await prisma.account.update({
      where: { id: account.id },
      data: { balance: 3400.0 }
    });
    console.log(`Updated ${updated.name} balance to: ${updated.balance}`);
  } else {
    console.log("Account 'inter' not found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

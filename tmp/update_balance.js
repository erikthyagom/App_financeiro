const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.findFirst({
    where: {
      name: {
        contains: 'inter',
        mode: 'insensitive'
      }
    }
  });

  if (account) {
    console.log(`Found account: ${account.name} (ID: ${account.id}) with balance: ${account.balance}`);
    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: { balance: 3400.0 }
    });
    console.log(`Updated balance to: ${updatedAccount.balance}`);
  } else {
    console.log("Account 'inter' not found.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

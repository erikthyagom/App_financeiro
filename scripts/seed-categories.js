const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  // Despesas
  { name: "Alimentação", type: "EXPENSE", color: "#f472b6", icon: "Utensils" },
  { name: "Assinaturas e serviços", type: "EXPENSE", color: "#a78bfa", icon: "Tv" },
  { name: "Bares e restaurantes", type: "EXPENSE", color: "#64748b", icon: "Wine" },
  { name: "Casa", type: "EXPENSE", color: "#60a5fa", icon: "Home" },
  { name: "Compras", type: "EXPENSE", color: "#fb7185", icon: "ShoppingBag" },
  { name: "Cuidados pessoais", type: "EXPENSE", color: "#f87171", icon: "User" },
  { name: "Dívidas e empréstimos", type: "EXPENSE", color: "#fb923c", icon: "ClipboardList" },
  { name: "Educação", type: "EXPENSE", color: "#4f46e5", icon: "GraduationCap" },
  { name: "Família e filhos", type: "EXPENSE", color: "#86efac", icon: "Users" },
  { name: "Impostos e Taxas", type: "EXPENSE", color: "#fb923c", icon: "Percent" },
  { name: "Investimentos", type: "EXPENSE", color: "#f472b6", icon: "TrendingUp" },
  { name: "Lazer e hobbies", type: "EXPENSE", color: "#86efac", icon: "Smile" },
  { name: "Mercado", type: "EXPENSE", color: "#fb923c", icon: "ShoppingCart" },
  { name: "Outros", type: "EXPENSE", color: "#94a3b8", icon: "List" },
  { name: "Pets", type: "EXPENSE", color: "#fbbf24", icon: "PawPrint" },
  { name: "Presentes e doações", type: "EXPENSE", color: "#60a5fa", icon: "Gift" },
  { name: "Roupas", type: "EXPENSE", color: "#fb923c", icon: "Shirt" },
  { name: "Saúde", type: "EXPENSE", color: "#38bdf8", icon: "Activity" },
  { name: "Trabalho", type: "EXPENSE", color: "#3b82f6", icon: "Briefcase" },
  { name: "Transporte", type: "EXPENSE", color: "#38bdf8", icon: "Car" },
  { name: "Viagem", type: "EXPENSE", color: "#ef4444", icon: "Plane" },
  // Receitas
  { name: "Salário", type: "INCOME", color: "#22c55e", icon: "Coins" },
  { name: "Investimentos", type: "INCOME", color: "#f472b6", icon: "TrendingUp" },
  { name: "Prêmios", type: "INCOME", color: "#fbbf24", icon: "Trophy" },
  { name: "Outras receitas", type: "INCOME", color: "#94a3b8", icon: "List" }
];

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    console.log(`Processing categories for user ${user.name}...`);
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await prisma.category.findFirst({
        where: { userId: user.id, name: cat.name }
      });
      if (!exists) {
        await prisma.category.create({
          data: { ...cat, userId: user.id }
        });
      } else {
        await prisma.category.update({
          where: { id: exists.id },
          data: { color: cat.color, icon: cat.icon, type: cat.type }
        });
      }
    }
  }
}

main()
  .then(() => { 
    console.log("Seeding Done!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const fs = require('fs');
const path = require('path');

['category.ts', 'creditCard.ts', 'dashboard.ts', 'expense.ts', 'income.ts', 'reports.ts'].forEach(file => {
  const p = path.join('app', 'actions', file);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace('import { PrismaClient } from "@prisma/client";', 'import { prisma } from "@/lib/prisma";');
  content = content.replace(/const prisma = new PrismaClient\(\);?\s*/, '');
  fs.writeFileSync(p, content);
});

['categorias', 'cartoes', 'receitas', 'despesas', 'relatorios'].forEach(dir => {
  const p = path.join('app', dir, 'page.tsx');
  let content = fs.readFileSync(p, 'utf8');
  content = 'export const dynamic = "force-dynamic";\n' + content;
  fs.writeFileSync(p, content);
});

const homeP = path.join('app', 'page.tsx');
let homeContent = fs.readFileSync(homeP, 'utf8');
homeContent = 'export const dynamic = "force-dynamic";\n' + homeContent;
fs.writeFileSync(homeP, homeContent);

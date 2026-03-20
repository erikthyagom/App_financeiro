"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT, verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Credenciais inválidas" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { error: "Credenciais inválidas" };
  }

  const token = await signJWT({ id: user.id, email: user.email, name: user.name });
  
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
  });

  redirect("/");
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos" };
  }

  // Verifica se o email já existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    return { error: "Este email já está cadastrado" };
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria o usuário
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Cria categorias padrão
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

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId: user.id }))
  });

  const token = await signJWT({ id: user.id, email: user.email, name: user.name });

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) return null;

  const payload = await verifyJWT(token);
  return payload?.id as string | null;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) return null;

  const payload = await verifyJWT(token);
  return payload as { id: string, name: string, email: string } | null;
}

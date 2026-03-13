export const dynamic = "force-dynamic";
import { getExpenses } from "../actions/expense";
import { getCategories } from "../actions/category";
import { getCreditCards } from "../actions/creditCard";
import ExpenseClient from "./ExpenseClient";

export const metadata = {
  title: "Despesas | Controle Financeiro",
};

export default async function DespesasPage() {
  const expenses = await getExpenses();
  const categories = await getCategories();
  const creditCards = await getCreditCards();
  
  return (
    <div>
      <ExpenseClient 
        initialExpenses={expenses} 
        categories={categories} 
        creditCards={creditCards} 
      />
    </div>
  );
}

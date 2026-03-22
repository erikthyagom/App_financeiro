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
  const allCategories = await getCategories();
  const creditCards = await getCreditCards();
  
  const expenseCategories = allCategories.filter((c: any) => c.type === "EXPENSE");

  return (
    <div>
      <ExpenseClient 
        initialExpenses={expenses} 
        categories={expenseCategories} 
        creditCards={creditCards} 
      />
    </div>
  );
}

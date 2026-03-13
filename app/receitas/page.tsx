export const dynamic = "force-dynamic";
import { getIncomes } from "../actions/income";
import { getCategories } from "../actions/category";
import IncomeClient from "./IncomeClient";

export const metadata = {
  title: "Receitas | Controle Financeiro",
};

export default async function ReceitasPage() {
  const incomes = await getIncomes();
  const categories = await getCategories();
  
  return (
    <div>
      <IncomeClient initialIncomes={incomes} categories={categories} />
    </div>
  );
}

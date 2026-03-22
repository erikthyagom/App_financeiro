export const dynamic = "force-dynamic";
import { getIncomes } from "../actions/income";
import { getCategories } from "../actions/category";
import { getAccounts } from "../actions/account";
import IncomeClient from "./IncomeClient";

export const metadata = {
  title: "Receitas | Controle Financeiro",
};

export default async function ReceitasPage() {
  const incomes = await getIncomes();
  const allCategories = await getCategories();
  const accounts = await getAccounts();
  
  const incomeCategories = allCategories.filter((c: any) => c.type === "INCOME");

  return (
    <div>
      <IncomeClient initialIncomes={incomes} categories={incomeCategories} accounts={accounts} />
    </div>
  );
}

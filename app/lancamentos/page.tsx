import { getAllTransactions } from "../actions/transactions";
import TransactionsClient from "./TransactionsClient";

export default async function LancamentosPage(props: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const searchParams = await props.searchParams;
  
  const now = new Date();
  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth();
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();

  const data = await getAllTransactions(month, year);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <TransactionsClient initialData={data} currentMonth={month} currentYear={year} />
    </div>
  );
}

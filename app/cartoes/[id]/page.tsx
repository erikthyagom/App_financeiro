import { getInvoiceData } from "@/app/actions/creditCard";
import InvoiceDetailsClient from "./InvoiceDetailsClient";
import { getAccounts } from "@/app/actions/account";
import { redirect } from "next/navigation";

export default async function InvoicePage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ month?: string; year?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id } = params;

  const now = new Date();
  const parsedMonth = parseInt(searchParams.month || "");
  const parsedYear = parseInt(searchParams.year || "");
  const month = !isNaN(parsedMonth) ? parsedMonth : now.getMonth();
  const year = !isNaN(parsedYear) ? parsedYear : now.getFullYear();

  const invoiceData = await getInvoiceData(id, month, year);
  if (!invoiceData) {
    redirect("/cartoes");
  }

  const accounts = await getAccounts();

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <InvoiceDetailsClient 
        invoiceData={invoiceData as any} 
        accounts={accounts} 
        currentMonth={month} 
        currentYear={year} 
        cardId={id}
      />
    </div>
  );
}

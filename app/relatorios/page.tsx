export const dynamic = "force-dynamic";
import { getReportsData } from "../actions/reports";
import ReportsClient from "./ReportsClient";

export const metadata = {
  title: "Relatórios | Controle Financeiro",
};

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const currentDate = new Date();
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : currentDate.getFullYear();
  
  const reportsData = await getReportsData(year);
  
  return (
    <div>
      <ReportsClient initialData={reportsData} initialYear={year} />
    </div>
  );
}

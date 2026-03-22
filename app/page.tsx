export const dynamic = "force-dynamic";
import { getDashboardData } from "./actions/dashboard";
import DashboardClient from "./DashboardClient";

export default async function Home({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const currentDate = new Date();
  const params = await searchParams;
  const parsedMonth = parseInt(params.month || "");
  const parsedYear = parseInt(params.year || "");
  const month = !isNaN(parsedMonth) ? parsedMonth : currentDate.getMonth();
  const year = !isNaN(parsedYear) ? parsedYear : currentDate.getFullYear();
  
  const dashboardData = await getDashboardData(month, year);
  
  return (
    <div>
      <DashboardClient initialData={dashboardData} currentMonth={month} currentYear={year} />
    </div>
  );
}

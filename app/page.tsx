export const dynamic = "force-dynamic";
import { getDashboardData } from "./actions/dashboard";
import DashboardClient from "./DashboardClient";

export default async function Home({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const currentDate = new Date();
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : currentDate.getMonth();
  const year = params.year ? parseInt(params.year) : currentDate.getFullYear();
  
  const dashboardData = await getDashboardData(month, year);
  
  return (
    <div>
      <DashboardClient initialData={dashboardData} initialMonth={month} initialYear={year} />
    </div>
  );
}

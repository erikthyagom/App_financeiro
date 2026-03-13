export const dynamic = "force-dynamic";
import { getAccounts } from "../actions/account";
import AccountClient from "./AccountClient";

export const metadata = {
  title: "Contas | Controle Financeiro",
};

export default async function ContasPage() {
  const accounts = await getAccounts();
  
  return (
    <div>
      <AccountClient initialAccounts={accounts} />
    </div>
  );
}

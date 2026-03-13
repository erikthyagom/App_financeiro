export const dynamic = "force-dynamic";
import { getCreditCards } from "../actions/creditCard";
import CreditCardClient from "./CreditCardClient";

export const metadata = {
  title: "Cartões de Crédito | Controle Financeiro",
};

export default async function CartoesPage() {
  const cards = await getCreditCards();
  
  return (
    <div>
      <CreditCardClient initialCards={cards} />
    </div>
  );
}

export const dynamic = "force-dynamic";
import { getCategories } from "../actions/category";
import CategoryClient from "./CategoryClient";

export const metadata = {
  title: "Categorias | Controle Financeiro",
};

export default async function CategoriasPage() {
  const categories = await getCategories();
  
  return (
    <div>
      <CategoryClient initialCategories={categories} />
    </div>
  );
}

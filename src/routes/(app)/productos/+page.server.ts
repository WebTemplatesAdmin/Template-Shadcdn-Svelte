import type { PageServerLoad } from './$types';
import type { Producto } from "./table/columns";

export const load: PageServerLoad = ({ locals }) => {
   
  const productos: Producto[] = [
    { id: 1, name: "Camiseta básica algodón", price: 45000, stock: 120, category: "Ropa" },
    { id: 2, name: "Pantalón jean", price: 89000, stock: 45, category: "Ropa" },
    { id: 3, name: "Tenis running", price: 150000, stock: 8, category: "Calzado" },
    { id: 4, name: "Camiseta deportiva", price: 60000, stock: 100, category: "Ropa" },
    { id: 5, name: "Pantón deportivo", price: 120000, stock: 50, category: "Ropa" },
    { id: 6, name: "Tenis casual", price: 100000, stock: 15, category: "Calzado" },
    { id: 7, name: "Camiseta casual", price: 50000, stock: 200, category: "Ropa" },
    { id: 8, name: "Pantón casual", price: 100000, stock: 100, category: "Ropa" },
    { id: 9, name: "Tenis casual", price: 120000, stock: 10, category: "Calzado" },
    { id: 10, name: "Camiseta casual", price: 50000, stock: 200, category: "Ropa" },
  ];

  return { productos };
};
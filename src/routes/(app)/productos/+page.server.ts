import { obtenerProductos } from "$lib/server/api/productos.api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ fetch }) => {
  return {
    productos: obtenerProductos(fetch), // 👈 SIN await — se retorna la promesa tal cual
  };
};

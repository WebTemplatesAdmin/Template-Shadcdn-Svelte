import { obtenerPedidos } from "$lib/server/api/pedidos.api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ fetch }) => {
  // Sin await: la promesa se transmite y el skeleton se muestra enseguida.
  return { pedidos: obtenerPedidos(fetch) };
};

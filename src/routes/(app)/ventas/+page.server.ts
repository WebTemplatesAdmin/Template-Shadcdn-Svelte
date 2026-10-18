import { obtenerPedidos } from "$lib/server/api/pedidos.api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ fetch, locals }) => {
  return {
    session: locals.session,
    // Sin await: la promesa se transmite y el skeleton se muestra enseguida.
    pedidos: obtenerPedidos(fetch),
  };
};

import { obtenerPedidos } from "$lib/server/api/pedidos.api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ fetch, url }) => {
  const ver = Number(url.searchParams.get("ver"));

  // Sin await: la promesa se transmite y el skeleton se muestra enseguida.
  return {
    pedidos: obtenerPedidos(fetch),
    // Permite abrir el detalle desde un enlace: /pedidos?ver=1042
    ver: Number.isInteger(ver) && ver > 0 ? ver : null,
  };
};

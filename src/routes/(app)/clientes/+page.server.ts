import { obtenerClientes } from "$lib/server/api/clientes.api";
import { obtenerPedidos } from "$lib/server/api/pedidos.api";
import type { ClienteResumen } from "$lib/types/cliente";
import type { PageServerLoad } from "./$types";

async function cargarClientes(fetch: typeof globalThis.fetch) {
  const [clientes, pedidos] = await Promise.all([
    obtenerClientes(fetch),
    obtenerPedidos(fetch),
  ]);

  return clientes.map<ClienteResumen>((cliente) => {
    const suyos = pedidos.filter(
      (pedido) =>
        pedido.estado !== "cancelado" &&
        (pedido.clienteId === cliente.id ||
          pedido.cliente.nombre === cliente.nombre),
    );

    return {
      ...cliente,
      pedidos: suyos.length,
      totalComprado: suyos.reduce((suma, pedido) => suma + pedido.total, 0),
    };
  });
}

export const load: PageServerLoad = ({ fetch }) => {
  // Sin await: la promesa se transmite y el skeleton se muestra enseguida.
  return { clientes: cargarClientes(fetch) };
};

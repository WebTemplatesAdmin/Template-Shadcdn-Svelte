import { obtenerClientes } from "$lib/server/api/clientes.api";
import { obtenerPedidos } from "$lib/server/api/pedidos.api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const [clientes, pedidos] = await Promise.all([
    obtenerClientes(fetch),
    obtenerPedidos(fetch),
  ]);

  const id = Number(params.id);
  const cliente = clientes.find((c) => c.id === id) ?? null;

  // Los pedidos guardan un snapshot del cliente: se cruzan por id o por nombre.
  const suyos = cliente
    ? pedidos.filter(
        (pedido) =>
          pedido.clienteId === cliente.id ||
          pedido.cliente.nombre === cliente.nombre,
      )
    : [];

  // Si es null, puede ser un cliente creado en la sesión (se resuelve en cliente).
  return { cliente, clienteId: id, pedidos: suyos };
};

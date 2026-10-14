import { error } from "@sveltejs/kit";
import {
  obtenerProductoPorId,
  obtenerHistorialProducto,
} from "$lib/server/api/productos.api";
import type { PageServerLoad } from "./$types";

// Origen permitido para "Volver" (evita open redirect).
const VOLVER_VALIDO = /^\/productos\/\d+\/(ver|editar)$/;

export const load: PageServerLoad = ({ params, url, fetch }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw error(400, "ID inválido");

  // Streaming: se devuelven promesas para mostrar el skeleton mientras cargan.
  const producto = obtenerProductoPorId(fetch, id).catch(() => {
    throw error(404, "Producto no encontrado");
  });
  const historial = obtenerHistorialProducto(fetch, id).catch(() => []);

  const origen = url.searchParams.get("volver");
  const volver =
    origen && VOLVER_VALIDO.test(origen) ? origen : `/productos/${id}/ver`;

  return { producto, historial, volver };
};

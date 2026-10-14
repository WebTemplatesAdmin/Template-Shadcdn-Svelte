import { error } from "@sveltejs/kit";
import {
  obtenerProductoPorId,
  obtenerHistorialProducto,
} from "$lib/server/api/productos.api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params, fetch }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw error(400, "ID inválido");

  // Streaming: se devuelven promesas (sin await) para que la vista muestre
  // un skeleton mientras llegan los datos, en vez de bloquear la navegación.
  const producto = obtenerProductoPorId(fetch, id).catch(() => {
    throw error(404, "Producto no encontrado");
  });
  // El historial no es crítico: si falla, la ficha igual se muestra.
  const historial = obtenerHistorialProducto(fetch, id).catch(() => []);

  return { producto, historial };
};

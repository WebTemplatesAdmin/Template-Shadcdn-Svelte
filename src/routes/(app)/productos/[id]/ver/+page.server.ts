import { error } from "@sveltejs/kit";
import {
  obtenerProductoPorId,
  obtenerHistorialProducto,
} from "$lib/server/api/productos.api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw error(400, "ID inválido");

  let producto;
  try {
    producto = await obtenerProductoPorId(fetch, id);
  } catch {
    throw error(404, "Producto no encontrado");
  }

  // El historial no es crítico: si falla, la ficha igual se muestra.
  const historial = await obtenerHistorialProducto(fetch, id);

  return { producto, historial };
};

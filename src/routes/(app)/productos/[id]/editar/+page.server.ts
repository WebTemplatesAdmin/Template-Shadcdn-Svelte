import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { productoSchema } from "../../schemas/schema";
import {
  obtenerProductoPorId,
  obtenerHistorialProducto,
} from "$lib/server/api/productos.api";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params, fetch }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw error(400, "ID inválido");

  // Streaming: el formulario (que depende del producto) se devuelve como
  // promesa para mostrar un skeleton mientras se pre-rellena.
  const form = (async () => {
    const producto = await obtenerProductoPorId(fetch, id).catch(() => {
      throw error(404, "Producto no encontrado");
    });
    // Fallback del costo: el mock / la API externa puede no traerlo
    // y el schema lo exige como número no negativo.
    return superValidate(
      { ...producto, costPrice: producto.costPrice ?? 0 },
      zod4(productoSchema),
    );
  })();

  // El historial no es crítico: si falla, el formulario igual se muestra.
  const historial = obtenerHistorialProducto(fetch, id).catch(() => []);

  return { form, id, historial };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const form = await superValidate(request, zod4(productoSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // TODO: llamar a actualizarProducto(fetch, Number(params.id), form.data)
    console.log("Actualizando producto", params.id, form.data);

    redirect(303, "/productos");
  },
};

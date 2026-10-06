import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { productoSchema } from "../../schemas/schema";
import { obtenerProductoPorId } from "$lib/server/api/productos.api";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw error(400, "ID inválido");

  let producto;
  try {
    producto = await obtenerProductoPorId(fetch, id);
  } catch {
    throw error(404, "Producto no encontrado");
  }

  // 👇 LA CLAVE: pasar datos al schema → formulario PRE-RELLENADO
  const form = await superValidate(
    {
      ...producto,
      // Fallbacks para los campos que Fake Store no tiene (evita que el form
      // se abra inválido por volumen / tipoEnvase / costPrice obligatorios):
      volumen: producto.volumen ?? 1,
      tipoEnvase: producto.tipoEnvase ?? "pet",
      costPrice: producto.costPrice ?? 0,
    },
    zod4(productoSchema),
  );

  return { form, id };
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
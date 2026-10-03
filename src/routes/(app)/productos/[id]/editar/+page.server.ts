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
      name: producto.name,
      price: producto.price,
      stock: producto.stock,
      minStock: producto.minStock,
      category: producto.category,
      // volumen, tipoEnvase, brand, etc. → los completa el mapper
      // cuando conectes tu products-ms real (hoy Fake Store no los tiene)
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
import { fail, redirect } from "@sveltejs/kit";
import { superValidate, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { productoSchema } from "./schemas/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const form = await superValidate(zod4(productoSchema));
  return { form };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(productoSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // TODO: llamar a tu products-ms para crear el producto real
    console.log("Creando producto:", form.data);

    redirect(303, "/productos");
  },
};
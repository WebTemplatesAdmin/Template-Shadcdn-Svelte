import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { construirPayloadProducto, productoSchema } from "../schemas/schema";
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

    // JSON que tu backend debe recibir (ver `construirPayloadProducto`).
    const payload = construirPayloadProducto(form.data);
    console.log(
      `[productos] Payload (CREAR) →\n${JSON.stringify(payload, null, 2)}`,
    );

    // TODO: llamar a tu API → POST /productos con `payload`.

    redirect(303, "/productos");
  },
};
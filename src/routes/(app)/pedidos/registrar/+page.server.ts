import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { obtenerProductos } from "$lib/server/api/productos.api";
import { obtenerClientes } from "$lib/server/api/clientes.api";
import { construirPayloadPedido, pedidoSchema } from "./schemas/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  // Formulario + catálogo (artículos) + clientes (selector) en paralelo.
  const [form, catalogo, clientes] = await Promise.all([
    superValidate(zod4(pedidoSchema)),
    obtenerProductos(fetch),
    obtenerClientes(fetch),
  ]);

  return { form, catalogo, clientes };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(pedidoSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Sin backend, el id/código se simulan: tu API real los asigna.
    const id = 1050 + Math.floor(Math.random() * 8000);
    const payload = construirPayloadPedido(form.data, {
      id,
      codigo: `#${id}`,
    });

    // JSON que tu backend debe recibir (ver `construirPayloadPedido`).
    console.log(
      `[pedidos] Payload (CREAR) →\n${JSON.stringify(payload, null, 2)}`,
    );

    // TODO: llamar a tu API → POST /pedidos con `payload`.

    redirect(303, "/pedidos");
  },
};

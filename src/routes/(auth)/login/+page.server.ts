import { fail, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { loginSchema } from "./schema";
import type { Actions, PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies, url }) => {

  const sesion = cookies.get("sesion");
  if (sesion) {
    redirect(307, url.searchParams.get("redirectTo") || "/dashboard");
  }

  const form = await superValidate(zod4(loginSchema));
  return { form };
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(loginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

     // Simulación temporal: aquí luego conectamos con tu API real
    cookies.set("sesion", "activa", {
      path: "/",
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24,
    });

    // TODO: lógica de autenticación pendiente
    return { form };
  },
};
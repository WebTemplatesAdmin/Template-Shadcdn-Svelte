import { redirect, } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types"; 

export const actions: Actions = {
  default: async ({ cookies }) => {
    cookies.delete("sesion", { path: "/" });
    redirect(303, "/login");
  },
};

// Opcional: si alguien entra GET /logout directamente, también le cerramos sesión
export const load: PageServerLoad = async ({ cookies }) => {
  cookies.delete("sesion", { path: "/" });
  redirect(303, "/login");
};
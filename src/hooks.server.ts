import { redirect, type Handle } from "@sveltejs/kit";
// import { jwtVerify } from "jose";

const RUTAS_AUTH = ["/login" /* , "/register" */];
const RUTA_LOGOUT = ["/logout"];

// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function esRutaAuth(pathname: string): boolean {
  return RUTAS_AUTH.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

function esRutaLogout(pathname: string): boolean {
  return RUTA_LOGOUT.some((r) => pathname === r);
}

export const handle: Handle = async ({ event, resolve }) => {
  const cookieSesion = event.cookies.get("sesion");

  // TODO: reemplazar por verificación real con jwtVerify cuando se conecte el backend
  const sesion = cookieSesion ? { activa: true } : null;

  // if (cookieSesion) {
  //   try {
  //     const { payload } = await jwtVerify(cookieSesion, secret);
  //     sesion = payload as typeof sesion;
  //   } catch {
  //     event.cookies.delete("sesion", { path: "/" });
  //     sesion = null;
  //   }
  // }

  event.locals.session = sesion;

  const { pathname } = event.url;

  // Caso especial: ruta raíz
  if (pathname === "/") {
    redirect(302, sesion ? "/dashboard" : "/login");
  }

  // Usuario logueado intentando entrar a login/register
  if (sesion && esRutaAuth(pathname)) {
    const redirectTo = event.url.searchParams.get("redirectTo") || "/dashboard";
    redirect(307, redirectTo);
  }

  // Usuario sin sesión intentando entrar a ruta protegida
  if (!sesion && !esRutaAuth(pathname) && !esRutaLogout(pathname)) {
    const rutaDestino = pathname + event.url.search;
    const redirLogin = `/login?redirectTo=${encodeURIComponent(rutaDestino)}`;
    // Protección: NO hacer redirect si ya está yendo a /login (romper loop)
    if (!rutaDestino.startsWith("/login")) {
      redirect(307, redirLogin);
    }
  }

  return resolve(event);
};
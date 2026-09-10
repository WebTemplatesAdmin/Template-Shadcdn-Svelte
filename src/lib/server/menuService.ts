/**
 * ================================================================
 *  MENU SERVICE: Servicio para OBTENER el menú desde el BACKEND
 *  (Microservicio NestJS / API REST / Base de Datos)
 * ================================================================
 *
 *  USO:
 *  Importar en src/routes/(app)/+layout.server.ts dentro del load():
 *    import { obtenerMenuPorUsuario } from "$lib/server/menuService";
 *    const menuDB = await obtenerMenuPorUsuario(idUsuario, rol);
 *
 *  OBJETIVO:
 *  No poner la lógica de fetch directamente en el load(),
 *  sino aquí para mantener SEPARACIÓN DE RESPONSABILIDADES.
 *
 *  SOLO TIENES QUE REEMPLAZAR LOS BLOQUES MARCADOS COMO:
 *    👉 TODO #1: URL base del backend (o variable de entorno)
 *    👉 TODO #2: Endpoint exacto de tu API
 *    👉 TODO #3: Token / autenticación (si usas JWT)
 *    👉 TODO #4: Mapeo campos API ↔ MenuItemDB (si difieren nombres)
 * ================================================================
 */

import type { MenuItemDB } from "$lib/utils/menu";

// ───────────────────────────────────────────────────────────────
// TIPOS AUXILIARES (modifícalos según la respuesta REAL de tu API)
// ───────────────────────────────────────────────────────────────

/**
 * Respuesta estándar que retorna NestJS usando:
 *   @Get('/menu')
 *   getMenu() { return { statusCode: 200, data: MenuItemDB[] }; }
 *
 * Si tu API retorna directamente el array MenuItemDB[] (sin wrapper),
 * cambia el tipo a MenuItemDB[] en la respuesta del fetch.
 */
type RespuestaAPIMenu = {
  statusCode: number;
  message?: string;
  data: MenuItemDB[];
};

// ───────────────────────────────────────────────────────────────
// CONFIGURACIÓN GLOBAL
// ───────────────────────────────────────────────────────────────

// 👉 TODO #1: URL base del backend (idealmente desde .env)
//            SvelteKit recomienda usar import.meta.env.VAR_NAME para variables públicas.
//            Si el backend es privado, usa process.env dentro del +layout.server.ts
//            y pásalo como parámetro a la función.
const BASE_URL_BACKEND: string =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:3000";

// Tiempo máximo de espera por la respuesta (para no colgar el SSR)
const TIMEOUT_MS = 5_000; // 5 segundos

// ───────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL PÚBLICA (la que importarás)
// ───────────────────────────────────────────────────────────────

/**
 * Obtener el array PLANO de menú desde el backend.
 * Posteriormente se transforma con agruparMenuPorSeccion() desde el layout.server.ts
 *
 * @param idUsuario  (opcional) ID real del usuario logueado (para filtros de BD)
 * @param rol        (opcional) "admin" | "vendedor" | "cliente" ... para pedir menú por rol
 * @param tokenJWT   (opcional) Token Bearer con el que hablas con tu backend
 * @returns          Promise<MenuItemDB[]> → Array PLANO tal cual viene de BD
 */
export async function obtenerMenuPorUsuario(
  idUsuario?: number | string,
  rol?: string,
  tokenJWT?: string
): Promise<MenuItemDB[]> {
  try {
    // 👉 TODO #2: Endpoint EXACTO de tu NestJS.
    //            Ej: GET /api/v1/menu?rol=admin&idUsuario=5
    const url = new URL(`${BASE_URL_BACKEND}/api/v1/menu`);

    if (idUsuario !== undefined) {
      url.searchParams.append("idUsuario", String(idUsuario));
    }
    if (rol !== undefined && rol.length > 0) {
      url.searchParams.append("rol", rol);
    }

    // ============================================================
    // LLAMADA FETCH con AbortController (timeout 5s)
    // ============================================================
    const controlador = new AbortController();
    const idTimeout = setTimeout(() => controlador.abort(), TIMEOUT_MS);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      // 👉 TODO #3: Si tu backend requiere autenticación, descomenta
      //            y pasa el token real desde hooks.server.ts / locals
      // ...(tokenJWT ? { Authorization: `Bearer ${tokenJWT}` } : {}),
    };

    const respuesta = await fetch(url.toString(), {
      method: "GET",
      headers,
      credentials: "include", // 👈 Si tu backend usa cookies httpOnly sesión
      signal: controlador.signal,
    });

    clearTimeout(idTimeout);

    if (!respuesta.ok) {
      // Status 4xx / 5xx → cae al catch para devolver menú fallback
      throw new Error(
        `[menuService] API rechazó: status ${respuesta.status} ${respuesta.statusText}`
      );
    }

    // Parseamos la respuesta
    // Si tu backend retorna el array DIRECTAMENTE (sin { data: ... }),
    // reemplaza la línea por: const datos = await respuesta.json() as MenuItemDB[];
    const datos = (await respuesta.json()) as RespuestaAPIMenu;

    const menuDesdeApi = datos?.data ?? [];

    // 👉 TODO #4: Si los nombres de campos de tu API DIFIEREN de MenuItemDB
    //            haz aquí el mapeo. Ejemplo:
    //
    // const menuMapeado: MenuItemDB[] = menuDesdeApi.map((filaApi) => ({
    //   id_menu: filaApi.id,
    //   titulo: filaApi.nombre_menu,
    //   url: filaApi.ruta,
    //   icono: filaApi.nombre_icono,
    //   seccion: filaApi.grupo ?? null,
    //   orden: filaApi.posicion ?? 0,
    //   badge: filaApi.texto_badge ?? null,
    // }));
    // return menuMapeado;

    // Por defecto retornamos lo que venga (asumimos que coincide 1:1 con MenuItemDB)
    return menuDesdeApi;

    // ============================================================
    // MANEJO DE ERRORES (no crashea toda la app)
    // ============================================================
  } catch (error: unknown) {
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido";

    // Logueamos SOLO en SSR (consola del servidor), NO al cliente
    console.warn("[menuService] Falló obtención de menú, usando fallback:", mensaje);

    // 👉 MENÚ FALLBACK BÁSICO (se muestra SI el backend está caído)
    //    Puedes reemplazarlo por un menú mínimo "Solo Dashboard" o lo que prefieras
    return obtenerMenuFallback();
  }
}

// ───────────────────────────────────────────────────────────────
// FALLBACK: Menú mínimo que se muestra SI el backend NO responde
// (evita página en blanco / error 500 en producción)
// ───────────────────────────────────────────────────────────────

function obtenerMenuFallback(): MenuItemDB[] {
  return [
    {
      id_menu: 1,
      titulo: "Dashboard",
      url: "/dashboard",
      icono: "LayoutDashboard",
      seccion: "Principal",
      orden: 1,
      badge: null,
    },
    {
      id_menu: 99,
      titulo: "Servicio no disponible",
      url: "/ayuda",
      icono: "CircleHelp",
      seccion: "Sistema",
      orden: 100,
      badge: "OFFLINE",
    },
  ];
}

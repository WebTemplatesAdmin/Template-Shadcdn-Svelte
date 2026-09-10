import type { MenuItemDB } from "$lib/utils/menu";
import type { LayoutServerLoad } from "./$types";
export const load: LayoutServerLoad = async ({ locals }) => {
  // =============================================================
  // TODO: Reemplazar este bloque MOCK por tu llamada REAL a BD/API
  // Ejemplo:
  //   const menuDB = await menuService.obtenerMenuPorRol(locals.session.rol);
  // =============================================================
  const menuDB: MenuItemDB[] = [
    // --- SECCIÓN: Principal ---
    {
      id_menu: 1,
      titulo: "Dashboard",
      url: "/dashboard",
      icono: "LayoutDashboard",
      seccion: "Principal",
      orden: 1,
      badge: null,
    },

    // --- SECCIÓN: Gestión ---
    {
      id_menu: 2,
      titulo: "Productos",
      url: "/productos",
      icono: "Package",
      seccion: "Gestión",
      orden: 1,
      badge: null,
    },
    {
      id_menu: 3,
      titulo: "Pedidos",
      url: "/pedidos",
      icono: "ShoppingCart",
      seccion: "Gestión",
      orden: 2,
      badge: "12",
    },
    {
      id_menu: 4,
      titulo: "Ventas",
      url: "/ventas",
      icono: "TrendingUp",
      seccion: "Gestión",
      orden: 3,
      badge: null,
    },
    {
      id_menu: 5,
      titulo: "Usuarios",
      url: "/usuarios",
      icono: "Users",
      seccion: "Gestión",
      orden: 4,
      badge: null,
    },

    // --- SECCIÓN: Sistema ---
    {
      id_menu: 6,
      titulo: "Configuración",
      url: "/configuracion",
      icono: "Settings",
      seccion: "Sistema",
      orden: 1,
      badge: null,
    },
    {
      id_menu: 7,
      titulo: "Ayuda",
      url: "/ayuda",
      icono: "HelpCircle",
      seccion: "Sistema",
      orden: 2,
      badge: null,
    },
  ];
  // =============================================================
  // FIN BLOQUE MOCK
  // =============================================================

  // Retornamos el MENÚ PLANO (sin transformar) al cliente.
  // La transformación a secciones la haremos en +layout.svelte,
  // aunque también podrías hacerla aquí si prefieres.
  return {
    menu: menuDB,

    // De paso, aprovechamos para pasar info del usuario al layout
    // (luego la reemplazas por datos reales de locals.session)
    usuario: {
      nombre: "Juan Pérez",
      email: "juan@tienda.com",
      rol: "Administrador",
      iniciales: "JP",
    },
  };
};
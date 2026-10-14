// src/lib/utils/breadcrumbs.ts
type BreadcrumbItem = {
  label: string;
  href?: string;
};

// Las claves sin ":" son rutas ESTÁTICAS (match exacto).
// Las claves con ":param" son rutas DINÁMICAS (ej. /productos/:id/editar).
const breadcrumbsConfig: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Dashboard" }],
  "/productos": [{ label: "Gestión", href: "/" }, { label: "Productos" }],
  "/productos/registrar": [
    { label: "Gestión", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Nuevo producto" },
  ],
  "/productos/:id/editar": [
    { label: "Gestión", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Editar producto" },
  ],
  "/productos/:id/ver": [
    { label: "Gestión", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Detalle del producto" },
  ],
  "/productos/:id/historial": [
    { label: "Gestión", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Historial de cambios" },
  ],
  "/pedidos": [{ label: "Gestión", href: "/" }, { label: "Pedidos" }],
  "/ventas": [{ label: "Gestión", href: "/" }, { label: "Ventas" }],
  "/usuarios": [{ label: "Gestión", href: "/" }, { label: "Usuarios" }],
  "/configuracion": [{ label: "Sistema", href: "/" }, { label: "Configuración" }],
  "/ayuda": [{ label: "Sistema", href: "/" }, { label: "Ayuda" }],
};

/**
 * Convierte una plantilla con ":param" en una RegExp.
 * "/productos/:id/editar" → /^\/productos\/[^/]+\/editar\/?$/
 */
function plantillaARegExp(plantilla: string): RegExp {
  const partes = plantilla.split("/").map((segmento) =>
    segmento.startsWith(":")
      ? "[^/]+"
      : segmento.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return new RegExp(`^${partes.join("/")}/?$`);
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // 1. Match EXACTO (rutas estáticas)
  if (breadcrumbsConfig[pathname]) {
    return breadcrumbsConfig[pathname];
  }

  // 2. Rutas DINÁMICAS (claves con ":param")
  for (const [plantilla, items] of Object.entries(breadcrumbsConfig)) {
    if (!plantilla.includes(":")) continue;
    if (plantillaARegExp(plantilla).test(pathname)) {
      return items;
    }
  }

  // 3. Prefijo más largo que coincida (ignorando las plantillas dinámicas)
  const match = Object.keys(breadcrumbsConfig)
    .filter((key) => !key.includes(":") && pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  return match ? breadcrumbsConfig[match] : [{ label: "Panel" }];
}
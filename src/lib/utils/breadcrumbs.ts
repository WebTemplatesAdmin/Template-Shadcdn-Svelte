// src/lib/utils/breadcrumbs.ts
type BreadcrumbItem = {
  label: string;
  href?: string;
};

const breadcrumbsConfig: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Dashboard" }],
  "/productos": [{ label: "Gestión", href: "/" }, { label: "Productos" }],
  "/productos/registrar": [
    { label: "Gestión", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Nuevo producto" },
  ],
  "/pedidos": [{ label: "Gestión", href: "/" }, { label: "Pedidos" }],
  "/ventas": [{ label: "Gestión", href: "/" }, { label: "Ventas" }],
  "/usuarios": [{ label: "Gestión", href: "/" }, { label: "Usuarios" }],
  "/configuracion": [{ label: "Sistema", href: "/" }, { label: "Configuración" }],
  "/ayuda": [{ label: "Sistema", href: "/" }, { label: "Ayuda" }],
};

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (breadcrumbsConfig[pathname]) {
    return breadcrumbsConfig[pathname];
  }

  // Si no hay match exacto, busca el prefijo más largo que coincida
  // (útil para rutas dinámicas futuras, ej. /productos/42/editar)
  const match = Object.keys(breadcrumbsConfig)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  return match ? breadcrumbsConfig[match] : [{ label: "Panel" }];
}
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "@lucide/svelte";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = {
  sectionTitle?: string;
  items: NavItem[];
};

export const navigationConfig: NavSection[] = [
  {
    sectionTitle: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    sectionTitle: "Gestión",
    items: [
      {
        title: "Productos",
        url: "/productos",
        icon: Package,
      },
      {
        title: "Pedidos",
        url: "/pedidos",
        icon: ShoppingCart,
        badge: "12",
      },
      {
        title: "Ventas",
        url: "/ventas",
        icon: TrendingUp,
      },
      {
        title: "Usuarios",
        url: "/usuarios",
        icon: Users,
      },
    ],
  },
  {
    sectionTitle: "Sistema",
    items: [
      {
        title: "Configuración",
        url: "/configuracion",
        icon: Settings,
      },
      {
        title: "Ayuda",
        url: "/ayuda",
        icon: HelpCircle,
      },
    ],
  },
];
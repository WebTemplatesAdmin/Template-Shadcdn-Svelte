import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
import Package from "@lucide/svelte/icons/package";
import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
import TrendingUp from "@lucide/svelte/icons/trending-up";
import Users from "@lucide/svelte/icons/users";
import Settings from "@lucide/svelte/icons/settings";
import HelpCircle from "@lucide/svelte/icons/help-circle";
import type { Icon as LucideIcon } from "@lucide/svelte";
import type { Component } from "svelte";



export type NavItem = {
  title: string;
  url: string;
  icon: Component;
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
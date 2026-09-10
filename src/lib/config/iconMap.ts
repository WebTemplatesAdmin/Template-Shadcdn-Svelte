import * as iconos from "@lucide/svelte";
import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
import ShoppingBasket from "@lucide/svelte/icons/shopping-basket";
import TrendingUp from "@lucide/svelte/icons/trending-up";
import TrendingUpDown from "@lucide/svelte/icons/trending-up-down";
import LineChart from "@lucide/svelte/icons/line-chart";
import BarChart3 from "@lucide/svelte/icons/bar-chart-3";
import Users from "@lucide/svelte/icons/users";
import Users2 from "@lucide/svelte/icons/users-2";
import UserCog from "@lucide/svelte/icons/user-cog";
import Settings from "@lucide/svelte/icons/settings";
import Settings2 from "@lucide/svelte/icons/settings-2";
import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";
import HelpCircle from "@lucide/svelte/icons/help-circle";
import CircleHelp from "@lucide/svelte/icons/circle-help";
import Bell from "@lucide/svelte/icons/bell";
import Search from "@lucide/svelte/icons/search";
import Menu from "@lucide/svelte/icons/menu";
import X from "@lucide/svelte/icons/x";
import LogOut from "@lucide/svelte/icons/log-out";
import User from "@lucide/svelte/icons/user";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import type { LucideIcon } from "@lucide/svelte";

/**
 * Lista BLANCA de iconos que tu app SI usa.
 * Escribe aquí el NOMBRE que tendrás en la BD.
 *
 * TypeScript te marcará EN ROJO inmediatamente si pones un nombre que NO exista
 * en tu versión instalada de @lucide/svelte. ¡Adiós iconos deprecados sin avisar!
 */
const NOMBRES_ICONOS_PERMITIDOS = [
  "LayoutDashboard",
  "LayoutGrid",
  "Gauge",
  "Package",
  "Package2",
  "ShoppingCart",
  "ShoppingBasket",
  "TrendingUp",
  "TrendingUpDown",
  "LineChart",
  "BarChart3",
  "Users",
  "Users2",
  "UserCog",
  "Settings",
  "Settings2",
  "SlidersHorizontal",
  "HelpCircle",
  "CircleHelp",
  "Bell",
  "Search",
  "Menu",
  "X",
  "LogOut",
  "User",
  "ChevronDown",
] as const;

type NombreIconoPermitido = (typeof NOMBRES_ICONOS_PERMITIDOS)[number];

/**
 * Diccionario tipado estrictamente.
 * Si el nombre NO existe en @lucide/svelte → TS error inmediato.
 */
const iconMap: Record<NombreIconoPermitido, LucideIcon> = {
  LayoutDashboard: iconos.LayoutDashboard ?? iconos.LayoutGrid ?? iconos.Gauge,
  LayoutGrid: iconos.LayoutGrid,
  Gauge: iconos.Gauge ?? iconos.LayoutDashboard,
  Package: iconos.Package,
  Package2: iconos.Package2 ?? iconos.Package,
  ShoppingCart: iconos.ShoppingCart,
  ShoppingBasket: iconos.ShoppingBasket ?? iconos.ShoppingCart,
  TrendingUp: iconos.TrendingUp,
  TrendingUpDown: iconos.TrendingUpDown ?? iconos.TrendingUp,
  LineChart: iconos.LineChart ?? iconos.TrendingUp,
  BarChart3: iconos.BarChart3,
  Users: iconos.Users,
  Users2: iconos.Users2 ?? iconos.Users,
  UserCog: iconos.UserCog ?? iconos.Users,
  Settings: iconos.Settings,
  Settings2: iconos.Settings2 ?? iconos.Settings,
  SlidersHorizontal: iconos.SlidersHorizontal ?? iconos.Settings,
  HelpCircle: iconos.HelpCircle ?? iconos.CircleHelp,
  CircleHelp: iconos.CircleHelp ?? iconos.HelpCircle,
  Bell: iconos.Bell,
  Search: iconos.Search,
  Menu: iconos.Menu,
  X: iconos.X,
  LogOut: iconos.LogOut,
  User: iconos.User,
  ChevronDown: iconos.ChevronDown,
};

/**
 * Obtener icono por nombre STRING (el que viene de la BD).
 * Tiene FALLBACK EN CASCADA:
 *   1. Busca el nombre exacto
 *   2. Si no existe → intenta un alias común
 *   3. Si nada → CircleHelp (así ves visualmente que falta uno)
 */
export function getIcon(nombreIcono: string): LucideIcon {
  const clave = nombreIcono as NombreIconoPermitido;
  return iconMap[clave] ?? iconos.CircleHelp ?? iconos.HelpCircle;
}
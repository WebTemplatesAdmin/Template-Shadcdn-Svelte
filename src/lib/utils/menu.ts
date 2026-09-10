/**
 * ================================================================
 *  UTILERÍA DE MENÚ ANIDADO
 * ================================================================
 *  Soporta LOS 2 PATRONES MÁS COMUNES EN PRODUCCIÓN:
 *
 *  🅰️ ADYACENCIA (MySQL / TypeORM relacional):
 *     Cada fila tiene `id_menu_padre: number | null` que apunta a otra fila.
 *     El buildArbolDesdeAdyacencia() arma el árbol recursivamente.
 *
 *  🅱️ NESTED JSON (MongoDB / NestJS Controller que lo devuelve ya armado):
 *     Cada nodo tiene `hijos: MenuItemDB[] | null` con el array anidado.
 *
 *  En runtime se detecta AUTOMÁTICAMENTE cuál patrón viene de la API
 *  (mirando si la 1ª fila tiene `hijos` definido → patrón nested).
 * ================================================================
 */

import { getIcon } from "$lib/config/iconMap";
import type { LucideIcon } from "@lucide/svelte";

// ───────────────────────────────────────────────────────────
// 1. TIPOS: Formato PLANO (tal cual viene de BD o API)
// ───────────────────────────────────────────────────────────
export type MenuItemDB = {
  id_menu: number;
  titulo: string;
  url: string | null;        // 👉 null = menú PADRE (solo expande, no navega)
  icono: string;
  seccion: string | null;
  orden: number;
  badge: string | null;

  // 🅰️ Patrón ADYACENCIA (MySQL relacional): FK a sí mismo
  id_menu_padre?: number | null;

  // 🅱️ Patrón NESTED JSON (MongoDB / API): hijos dentro del propio objeto
  hijos?: MenuItemDB[] | null;
};

// ───────────────────────────────────────────────────────────
// 2. TIPOS: Formato AGRUPADO por SECCIÓN + ÁRBOL de iconos COMPONENTES
// ───────────────────────────────────────────────────────────
export type NavItem = {
  id: number;              // id_menu original (para keys en #each)
  title: string;
  url: string | null;      // null si es padre sin navegación
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];    // 👉 SOPORTE ANIDADO N NIVELES
};

export type NavSection = {
  sectionTitle?: string;
  items: NavItem[];
};

// ================================================================
// PASO 0: DETECTAR PATRÓN + CONVERTIR A ÁRBOL NESTED ESTÁNDAR
// ================================================================

/**
 * Asegura que la salida sea SIEMPRE un árbol NESTED (con propiedad .hijos),
 * sin importar qué patrón nos entregó la API.
 */
function asegurarArbol(items: MenuItemDB[]): MenuItemDB[] {
  if (!items || items.length === 0) return [];

  const primerItem = items[0];
  const vieneComoNested =
    "hijos" in primerItem && Array.isArray(primerItem.hijos);

  if (vieneComoNested) {
    // 🅱️ Patrón Nested JSON → lo retornamos tal cual, nos aseguramos
    // que todos los nodos tengan hijos[] (aunque sea []) para recursión uniforme.
    return normalizarHijos(items);
  } else {
    // 🅰️ Patrón Adyacencia (id_menu_padre) → armamos el árbol.
    return buildArbolDesdeAdyacencia(items);
  }
}

/**
 * 🅰️ Construye árbol recursivo desde lista plana con `id_menu_padre`.
 */
function buildArbolDesdeAdyacencia(items: MenuItemDB[]): MenuItemDB[] {
  const porPadre = new Map<number | null, MenuItemDB[]>();

  // Inicializar buckets
  porPadre.set(null, []);
  for (const it of items) {
    it.hijos = it.hijos ?? [];
    const padre = it.id_menu_padre ?? null;
    if (!porPadre.has(padre)) porPadre.set(padre, []);
    porPadre.get(padre)!.push(it);
  }

  // Recursión: adjuntar hijos a cada padre
  const armar = (padreId: number | null): MenuItemDB[] => {
    const lista = porPadre.get(padreId) ?? [];
    for (const nodo of lista) {
      nodo.hijos = armar(nodo.id_menu);
    }
    return [...lista].sort((a, b) => a.orden - b.orden);
  };

  return armar(null);
}

/**
 * Garantiza que TODO nodo (en todos los niveles) tenga `.hijos` como array.
 */
function normalizarHijos(nodos: MenuItemDB[]): MenuItemDB[] {
  const resultado: MenuItemDB[] = [];
  for (const n of nodos) {
    const hijo = { ...n };
    hijo.hijos = Array.isArray(n.hijos)
      ? normalizarHijos(n.hijos)
      : [];
    resultado.push(hijo);
  }
  return resultado.sort((a, b) => a.orden - b.orden);
}

// ================================================================
// PASO 1: Transformar 1 ítem (RECURSIVO: incluye transformar sus hijos)
// ================================================================

function transformarItem(nodo: MenuItemDB): NavItem {
  const hijosTransformados = Array.isArray(nodo.hijos) && nodo.hijos.length > 0
    ? nodo.hijos.map(transformarItem)
    : undefined;

  return {
    id: nodo.id_menu,
    title: nodo.titulo,
    url: nodo.url && nodo.url.length > 0 ? nodo.url : null,
    icon: getIcon(nodo.icono),
    ...(nodo.badge ? { badge: nodo.badge } : {}),
    ...(hijosTransformados ? { children: hijosTransformados } : {}),
  };
}

// ================================================================
// PASO 2: FUNCIÓN PÚBLICA PRINCIPAL (la que usa +layout.svelte)
// ================================================================

/**
 * Transforma un array MenuItemDB[] (cualquier patrón) → NavSection[] listo para Sidebar.
 * - Agrupa por `seccion`.
 * - Dentro de cada sección ordena por `orden`.
 * - Transforma str icono → componente Lucide en TODOS los niveles.
 * - Garantiza uniformidad: siempre NavItem.children? como array opcional.
 */
export function agruparMenuPorSeccion(itemsDB: MenuItemDB[]): NavSection[] {
  const arbol = asegurarArbol(itemsDB ?? []);

  // Agrupamos la capa RAÍZ (primer nivel) por `seccion`
  const porSeccion = new Map<string | null, MenuItemDB[]>();
  for (const item of arbol) {
    const seccion = item.seccion ?? null;
    if (!porSeccion.has(seccion)) porSeccion.set(seccion, []);
    porSeccion.get(seccion)!.push(item);
  }

  const resultado: NavSection[] = [];
  for (const [seccion, itemsGrupo] of porSeccion) {
    const itemsTransformados = itemsGrupo
      .sort((a, b) => a.orden - b.orden)
      .map(transformarItem);

    resultado.push({
      ...(seccion ? { sectionTitle: seccion } : {}),
      items: itemsTransformados,
    });
  }
  return resultado;
}

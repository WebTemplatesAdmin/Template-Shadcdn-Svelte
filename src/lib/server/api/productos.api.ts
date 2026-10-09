/**
 * ============================================================
 * EJEMPLO GUÍA — conexión a una API REST real
 * ============================================================
 * Usamos https://fakestoreapi.com (gratuita, sin necesidad de
 * backend propio) para que puedas ver el flujo completo
 * funcionando de punta a punta: fetch → transformación → UI.
 *
 * Cuando conectes TU backend real, reemplaza el contenido de
 * este archivo manteniendo los mismos nombres de función y el
 * mismo tipo de retorno (`Producto`) — así no tienes que tocar
 * ninguna otra parte de la app (tabla, formularios, etc.).
 * ============================================================
 */

import { env } from "$env/dynamic/private";
import type { EventoProducto, Producto } from "$lib/types/producto";

// El tipo de producto se define una sola vez en $lib/types (client-safe)
// y se re-exporta aquí para no romper los imports existentes.
export type { Producto };

// Forma CRUDA que devuelve Fake Store API — casi nunca coincide
// exactamente con lo que tu UI necesita mostrar.
type FakeStoreProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
};

const PRODUCTS_API_URL = env.PRODUCTS_API_URL ?? "https://fakestoreapi.com";

const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 1,
    name: "Coca-Cola 350ml",
    price: 3500,
    stock: 480,
    minStock: 40,
    category: "gaseosa",
    sku: "COCA-350",
    codigoBarras: "7701234567890",
    // 3 imágenes para probar la galería con varias
    imagenes: [
      "https://placehold.co/400x400/dc2626/ffffff?text=Coca-Cola",
      "https://placehold.co/400x400/1a1a1a/ffffff?text=Coca-Cola+6-pack",
      "https://placehold.co/400x400/374151/ffffff?text=Coca-Cola+12-pack",
    ],
  },
  {
    id: 2,
    name: "Agua Manantial 600ml",
    price: 2000,
    stock: 1200,
    minStock: 100,
    category: "agua",
    sku: "AGUA-600-1",
    codigoBarras: "7701234567890",
    imagenes: ["https://placehold.co/400x400/0ea5e9/ffffff?text=Agua+600ml"],
  },
  {
    id: 3,
    name: "Cerveza Águila 330ml",
    price: 4200,
    stock: 320,
    minStock: 50,
    category: "cerveza",
    sku: "CERVE-330",
    codigoBarras: "7701234567890",
    imagenes: ["https://placehold.co/400x400/f59e0b/ffffff?text=Aguila+330ml"],
  },
  {
    id: 4,
    name: "Jugo Hit Mora 500ml",
    price: 3800,
    stock: 210,
    minStock: 30,
    category: "jugo",
    sku: "JUGO-500",
    codigoBarras: "7701234567890",
    imagenes: ["https://placehold.co/400x400/7c3aed/ffffff?text=Hit+Mora"],
  },
  {
    id: 5,
    name: "Speed Max 400ml",
    price: 5500,
    stock: 90,
    minStock: 24,
    category: "energizante",
    sku: "SPEED-400",
    codigoBarras: "7701234567890",
    imagenes: ["https://placehold.co/400x400/16a34a/ffffff?text=Speed+Max"],
  },
  {
    id: 6,
    name: "Postobón Uva 400ml",
    price: 3000,
    stock: 640,
    minStock: 60,
    category: "gaseosa",
    sku: "POSTO-400",
    codigoBarras: "7701234567890",
    imagenes: ["https://placehold.co/400x400/9333ea/ffffff?text=Postobon+Uva"],
  },
  {
    id: 7,
    name: "Agua con Gas 500ml",
    price: 2500,
    stock: 0,
    minStock: 30,
    category: "agua",
    sku: "AGUA-500-1",
    codigoBarras: "7701234567890",
    imagenes: ["https://placehold.co/400x400/0891b2/ffffff?text=Agua+con+Gas"],
  },
  {
    id: 8,
    name: "Pony Malta 330ml",
    price: 3600,
    stock: 145,
    minStock: 36,
    category: "otro",
    sku: "PONY-330",
    codigoBarras: "7701234567890",
    imagenes: ["https://placehold.co/400x400/78350f/ffffff?text=Pony+Malta"],
  },
];

const USE_MOCK_DATA = env.USE_MOCK_DATA === "true";

/** Evita que un proveedor lento cuelgue el SSR. */
const TIMEOUT_MS = 5_000;

async function fetchConTimeout(fetchFn: typeof globalThis.fetch, url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetchFn(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function buscarEnMock(id: number): Producto {
  const encontrado = MOCK_PRODUCTOS.find((p) => p.id === id);
  if (!encontrado) {
    throw new Error(`Producto no encontrado en datos de prueba (id ${id} )`);
  }
  return encontrado;
}

/**
 * Traduce el formato externo al formato interno de tu app.
 * Esta es la pieza clave del patrón: si mañana cambias de
 * proveedor de datos, SOLO reescribes esta función — el resto
 * de la app sigue funcionando igual porque siempre recibe `Producto`.
 */
function mapFakeStoreProduct(raw: FakeStoreProduct): Producto {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
    category: raw.category,
    imagenes: raw.image ? [raw.image] : [],
    // Fake Store API no maneja inventario real; lo simulamos
    // con el "count" del rating para tener datos variados.
    stock: raw.rating.count,
    minStock: 20,
  };
}

export async function obtenerProductos(
  fetchFn: typeof globalThis.fetch,
): Promise<Producto[]> {
  if (USE_MOCK_DATA) return MOCK_PRODUCTOS;
  try {
    const res = await fetchConTimeout(fetchFn, `${PRODUCTS_API_URL}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status} `);
    const data: FakeStoreProduct[] = await res.json();
    return data.map<Producto>(mapFakeStoreProduct);
  } catch (e) {
    console.warn(
      "[productos.api] API externa no disponible → usando MOCK:",
      e instanceof Error ? e.message : e,
    );
    return MOCK_PRODUCTOS;
  }
}

export async function obtenerProductoPorId(
  fetchFn: typeof globalThis.fetch,
  id: number,
): Promise<Producto> {
  if (USE_MOCK_DATA) return buscarEnMock(id);
  try {
    const res = await fetchConTimeout(
      fetchFn,
      `${PRODUCTS_API_URL}/products/${id}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status} `);
    const data: FakeStoreProduct = await res.json();
    return mapFakeStoreProduct(data);
  } catch (e) {
    console.warn(
      "[productos.api] API externa no disponible → usando MOCK:",
      e instanceof Error ? e.message : e,
    );
    return buscarEnMock(id);
  }
}

/**
 * ⚠️ Igual que crearProducto, Fake Store API simula la actualización
 * (responde con éxito) pero no persiste el cambio de verdad.
 */

export type NuevoProductoInput = {
  name: string;
  price: number;
  category: string;
  description?: string;
};

export async function actualizarProducto(
  fetchFn: typeof globalThis.fetch,
  id: number,
  data: NuevoProductoInput,
): Promise<Producto> {
  const res = await fetchFn(`${PRODUCTS_API_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.name,
      price: data.price,
      category: data.category,
      description: data.description ?? "",
      image: "https://i.pravatar.cc/150",
    }),
  });

  if (!res.ok) {
    throw new Error("No se pudo actualizar el producto");
  }

  const raw: FakeStoreProduct = await res.json();
  return mapFakeStoreProduct(raw);
}

/**
 * ------------------------------------------------------------
 * 👉 CÓMO CONECTAR TU PROPIO BACKEND (ej. NestJS products-ms)
 * ------------------------------------------------------------
 * Reemplaza las funciones de arriba por algo como esto, usando
 * el cliente centralizado (client.ts) que ya maneja errores y
 * headers de forma consistente para toda tu app:
 *
 *   import { apiRequest } from "./client";
 *
 *   export function obtenerProductos(fetchFn: typeof globalThis.fetch) {
 *     return apiRequest<Producto[]>(fetchFn, "/productos");
 *   }
 *
 *   export function obtenerProductoPorId(fetchFn: typeof globalThis.fetch, id: number) {
 *     return apiRequest<Producto>(fetchFn, `/productos/${id}`);
 *   }
 *
 *   export function crearProducto(fetchFn: typeof globalThis.fetch, data: Partial<Producto>) {
 *     return apiRequest<Producto>(fetchFn, "/productos", { method: "POST", body: data });
 *   }
 *
 *   export function actualizarProducto(fetchFn: typeof globalThis.fetch, id: number, data: Partial<Producto>) {
 *     return apiRequest<Producto>(fetchFn, `/productos/${id}`, { method: "PATCH", body: data });
 *   }
 * ------------------------------------------------------------
 */


// ───────────────────────────────────────────────────────────────
// HISTORIAL / EVENTOS RELACIONADOS CON EL PRODUCTO
// ───────────────────────────────────────────────────────────────

// Datos de prueba por producto.
// TODO: reemplazar por GET /productos/:id/historial en tu products-ms
const MOCK_HISTORIAL: Record<number, EventoProducto[]> = {
  1: [
    {
      id: 1,
      tipo: "promocion",
      titulo: 'Promoción "2x1 Gaseosas"',
      detalle: "El producto participó en la promo de fin de semana.",
      fecha: "2026-03-01T09:00:00.000Z",
      enlace: "/promociones/12",
    },
    {
      id: 2,
      tipo: "precio",
      titulo: "Cambio de precio",
      detalle: "3.500 → 3.200 (rebaja del 8.6%)",
      fecha: "2026-02-20T15:30:00.000Z",
    },
    {
      id: 3,
      tipo: "stock",
      titulo: "Entrada de stock",
      detalle: "+480 unidades ingresadas al almacén.",
      fecha: "2026-02-14T11:10:00.000Z",
    },
    {
      id: 4,
      tipo: "venta",
      titulo: "Venta destacada",
      detalle: "120 unidades vendidas en el último pedido.",
      fecha: "2026-02-10T17:45:00.000Z",
    },
  ],
};

export async function obtenerHistorialProducto(
  fetchFn: typeof globalThis.fetch,
  id: number,
): Promise<EventoProducto[]> {
  if (USE_MOCK_DATA) return MOCK_HISTORIAL[id] ?? [];

  try {
    const res = await fetchConTimeout(
      fetchFn,
      `${PRODUCTS_API_URL}/products/${id}/historial`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as EventoProducto[];
  } catch (e) {
    console.warn(
      "[productos.api] Historial no disponible → usando MOCK:",
      e instanceof Error ? e.message : e,
    );
    return MOCK_HISTORIAL[id] ?? [];
  }
}
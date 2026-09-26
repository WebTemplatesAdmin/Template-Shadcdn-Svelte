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

// Forma de dato que espera el RESTO de tu aplicación
export type Producto = {
  id: number;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  imageUrl?: string;
};

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
    imageUrl: raw.image,
    // Fake Store API no maneja inventario real; lo simulamos
    // con el "count" del rating para tener datos variados.
    stock: raw.rating.count,
    minStock: 20,
  };
}

export async function obtenerProductos(
  fetchFn: typeof globalThis.fetch,
): Promise<Producto[]> {
  const res = await fetchFn(`${PRODUCTS_API_URL}/products`);
  if (!res.ok) {
    throw new Error("No se pudieron cargar los productos");
  }
  const data: FakeStoreProduct[] = await res.json();
  return data.map<Producto>(mapFakeStoreProduct);
}

export async function obtenerProductoPorId(
  fetchFn: typeof globalThis.fetch,
  id: number,
): Promise<Producto> {
  const res = await fetchFn(`${PRODUCTS_API_URL}/products/${id}`);
  if (!res.ok) {
    throw new Error("Producto no encontrado");
  }
  const data: FakeStoreProduct = await res.json();
  return mapFakeStoreProduct(data);
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
 *   export function crearProducto(fetchFn: typeof globalThis.fetch, data: Partial<Producto>) {
 *     return apiRequest<Producto>(fetchFn, "/productos", { method: "POST", body: data });
 *   }
 * ------------------------------------------------------------
 */
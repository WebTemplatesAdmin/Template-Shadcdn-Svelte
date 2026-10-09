// Utilidades de producto compartidas por el formulario y la vista de detalle.
// Solo lógica pura + un mapa de iconos (seguro para cliente).
import Tag from "@lucide/svelte/icons/tag";
import TrendingDown from "@lucide/svelte/icons/trending-down";
import PackagePlus from "@lucide/svelte/icons/package-plus";
import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
import Sparkles from "@lucide/svelte/icons/sparkles";
import type { EventoProducto } from "$lib/types/producto";

/** Margen bruto sobre el costo, en % (con 1 decimal). */
export function calcularMargen(costo: number, venta: number): string {
    if (!costo || !venta || costo === 0) return "0";
    return (((venta - costo) / costo) * 100).toFixed(1);
}

/** true si se vende por debajo del costo. */
export function esMargenNegativo(costo: number, venta: number): boolean {
    return costo > 0 && venta > 0 && venta < costo;
}

/** Valor total del inventario (stock × costo). */
export function calcularValorInventario(stock: number, costo: number): number {
    return stock > 0 && costo > 0 ? stock * costo : 0;
}

/** Precio con IVA aplicado según la tasa (%). */
export function calcularPrecioConIva(
    precio: number,
    taxRate: string | number,
): number {
    return precio > 0 ? precio * (1 + Number(taxRate) / 100) : 0;
}

/** Moneda local (por defecto COP). */
export function formatearMoneda(valor: number, currency = "COP"): string {
    return valor.toLocaleString("es-CO", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    });
}

/** Fecha corta en es-CO (ej. "05 oct 2026"). */
export function formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/** Icono (lucide) por tipo de evento del producto. */
export const ICONO_EVENTO: Record<
    EventoProducto["tipo"],
    typeof Tag
> = {
    promocion: Tag,
    precio: TrendingDown,
    stock: PackagePlus,
    venta: ShoppingCart,
    creacion: Sparkles,
};

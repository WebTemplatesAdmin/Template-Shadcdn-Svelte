// src/lib/utils/pedido.ts
// Helpers de dominio para pedidos. Mismo enfoque que $lib/utils/producto.ts.
import type { EstadoPedido, Pedido } from "$lib/types/pedido";

/** Orden del flujo. Fuera de él queda "cancelado". */
export const ORDEN_ESTADOS: EstadoPedido[] = [
  "pendiente",
  "preparando",
  "enviado",
  "entregado",
];

/** Estados que se muestran como segmentos en la página. */
export const ESTADOS: EstadoPedido[] = [...ORDEN_ESTADOS, "cancelado"];

/** Etiqueta legible del estado (el badge siempre muestra texto, no solo color). */
export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

type VarianteBadge = "default" | "secondary" | "destructive" | "outline";

/**
 * Estilo del estado: variante del Badge + acento del flujo.
 * Los acentos usan la misma convención que la NotificationCard del proyecto.
 */
export const ESTILO_ESTADO: Record<
  EstadoPedido,
  { variante: VarianteBadge; clase: string }
> = {
  pendiente: { variante: "secondary", clase: "" },
  preparando: {
    variante: "outline",
    clase: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  enviado: {
    variante: "outline",
    clase: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  },
  entregado: {
    variante: "outline",
    clase: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  cancelado: { variante: "destructive", clase: "" },
};

/** Unidades totales: suma de cantidades. */
export function totalUnidades(pedido: Pedido): number {
  return pedido.items.reduce((total, item) => total + item.cantidad, 0);
}

/** Líneas distintas del pedido. */
export function contarArticulos(pedido: Pedido): number {
  return pedido.items.length;
}

/** Montos del mock en COP. */
export function formatearMonto(valor: number): string {
  return `$${valor.toLocaleString("es-CO")}`;
}

export function formatearFechaPedido(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatearFechaHoraPedido(fecha: string): string {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Cantidad de pedidos por estado + total (para los segmentos). */
export function contarPorEstado(
  pedidos: Pedido[],
): Record<EstadoPedido, number> & { todos: number } {
  const conteo = {
    pendiente: 0,
    preparando: 0,
    enviado: 0,
    entregado: 0,
    cancelado: 0,
    todos: pedidos.length,
  };
  for (const pedido of pedidos) conteo[pedido.estado] += 1;
  return conteo;
}

/** Métricas de la franja superior. */
export function resumenPedidos(pedidos: Pedido[]) {
  const conteo = contarPorEstado(pedidos);

  // Demo estable: se toma la fecha del pedido más reciente como "ahora", para
  // que la métrica no dependa del reloj real. Con un backend, usa Date.now().
  const referencia = pedidos.reduce(
    (masReciente, pedido) =>
      Math.max(masReciente, new Date(pedido.fecha).getTime()),
    0,
  );
  const hace7Dias = referencia - 7 * 24 * 60 * 60 * 1000;

  const entregados7Dias = pedidos.filter(
    (pedido) =>
      pedido.estado === "entregado" &&
      new Date(pedido.fecha).getTime() >= hace7Dias,
  ).length;

  const vigentes = pedidos.filter((pedido) => pedido.estado !== "cancelado");
  const facturado = vigentes.reduce((total, pedido) => total + pedido.total, 0);

  return {
    pendientes: conteo.pendiente,
    preparando: conteo.preparando,
    entregados7Dias,
    ticketPromedio: vigentes.length
      ? Math.round(facturado / vigentes.length)
      : 0,
  };
}

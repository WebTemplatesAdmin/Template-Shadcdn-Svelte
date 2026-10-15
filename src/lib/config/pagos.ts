// src/lib/config/pagos.ts
// Fuente única de los métodos de pago. Ajústala a tu país/negocio:
// al cambiarla, la tabla, el detalle y los formularios se actualizan solos.
import type { MetodoPago } from "$lib/types/pedido";

/** Momento en que se cobra un método. */
export type MomentoCobro = "anticipado" | "entrega" | "plazo";

export const METODOS_PAGO: MetodoPago[] = [
  "Tarjeta",
  "Transferencia",
  "Billetera digital",
  "Efectivo",
  "Crédito",
];

/**
 * Cobro anticipado: se paga al crear el pedido.
 * Cobro en la entrega: se paga cuando el cliente recibe (típico en efectivo).
 * A plazo: queda por cobrar y se factura con vencimiento (crédito B2B).
 */
export const MOMENTO_COBRO: Record<MetodoPago, MomentoCobro> = {
  Tarjeta: "anticipado",
  Transferencia: "anticipado",
  "Billetera digital": "anticipado",
  Efectivo: "entrega",
  Crédito: "plazo",
};

/** Días de plazo para los pagos a crédito. */
export const DIAS_CREDITO = 30;

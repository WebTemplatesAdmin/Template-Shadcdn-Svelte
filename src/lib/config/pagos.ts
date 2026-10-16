// src/lib/config/pagos.ts
// Fuente única de los métodos de pago. Ajústala a tu país/negocio:
// al cambiarla, la tabla, el detalle y los formularios se actualizan solos.
import type { BilleteraVirtual, MetodoPago } from "$lib/types/pedido";

/** Momento en que se cobra un método. */
export type MomentoCobro = "anticipado" | "entrega" | "plazo";

/** Billeteras virtuales. Se listan separadas porque son locales a un país. */
export const BILLETERAS_VIRTUALES: BilleteraVirtual[] = [
  "Nequi",
  "Daviplata",
  "Zelle",
  "PayPal",
];

/** País de cada billetera (para etiquetar el selector y el detalle). */
export const PAIS_BILLETERA: Record<BilleteraVirtual, string> = {
  Nequi: "Colombia",
  Daviplata: "Colombia",
  Zelle: "Estados Unidos",
  PayPal: "Internacional",
};

export const METODOS_PAGO: MetodoPago[] = [
  "Tarjeta",
  "Transferencia",
  "Link de pago",
  ...BILLETERAS_VIRTUALES,
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
  "Link de pago": "anticipado",
  Nequi: "anticipado",
  Daviplata: "anticipado",
  Zelle: "anticipado",
  PayPal: "anticipado",
  Efectivo: "entrega",
  Crédito: "plazo",
};

/** Días de plazo para los pagos a crédito. */
export const DIAS_CREDITO = 30;

/**
 * Métodos que ADMITEN comprobante (es OPCIONAL, nunca bloquea el cobro).
 * El cliente suele pagar después y manda el soporte: transferencia, link de
 * pago o billetera virtual (Nequi, Daviplata, Zelle…). Efectivo y tarjeta no.
 */
export const METODOS_CON_COMPROBANTE: MetodoPago[] = [
  "Transferencia",
  "Link de pago",
  ...BILLETERAS_VIRTUALES,
];

/** Tipos de archivo aceptados como comprobante. */
export const TIPOS_COMPROBANTE = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

/** Tamaño máximo del comprobante, en MB. */
export const TAMANIO_MAX_COMPROBANTE_MB = 5;

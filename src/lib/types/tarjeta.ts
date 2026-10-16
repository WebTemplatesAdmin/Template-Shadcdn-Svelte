// src/lib/types/tarjeta.ts

/**
 * Tarjeta guardada de un cliente.
 *
 * SEGURIDAD (PCI-DSS): aquí NUNCA se guarda el número completo ni el CVV.
 * Solo se almacenan los últimos 4 dígitos y el `token` que devuelve la
 * pasarela de pago; ese token es lo único que se usa para cobrar.
 */
export type TarjetaGuardada = {
  id: string;
  clienteId: number;
  marca?: string;
  /** Últimos 4 dígitos. */
  ultimos4: string;
  titular: string;
  /** MM/AA. */
  vencimiento: string;
  /** Token de la pasarela (simulado en la demo). */
  token: string;
  predeterminada?: boolean;
  /** ISO 8601. */
  creadaEn: string;
};

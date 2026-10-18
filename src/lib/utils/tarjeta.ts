// src/lib/utils/tarjeta.ts
import type { TarjetaGuardada } from "$lib/types/tarjeta";

/** Marcas de tarjeta (ajústalas a tu país/pasarela). */
export const MARCAS_TARJETA = [
  "Visa",
  "Mastercard",
  "American Express",
  "Diners Club",
  "Otra",
];

/** Texto corto de la tarjeta (nunca muestra el número completo). */
export function resumenTarjeta(tarjeta: TarjetaGuardada): string {
  return `${tarjeta.marca ? tarjeta.marca + " " : ""}•••• ${tarjeta.ultimos4} · vence ${tarjeta.vencimiento}`;
}

/**
 * Crea una tarjeta guardada a partir de los datos del formulario.
 * SEGURIDAD: solo se manejan los últimos 4 dígitos y un token simulado;
 * el número completo y el CVV nunca llegan a la app.
 */
export function crearTarjeta(
  clienteId: number,
  datos: {
    marca?: string;
    ultimos4: string;
    titular: string;
    vencimiento: string;
  },
): TarjetaGuardada {
  return {
    id: `TAR-${clienteId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clienteId,
    ...(datos.marca ? { marca: datos.marca } : {}),
    ultimos4: datos.ultimos4,
    titular: datos.titular.trim(),
    vencimiento: datos.vencimiento,
    // Demo: la pasarela devolvería este token al tokenizar la tarjeta.
    token: `tok_${(datos.marca || "card").toLowerCase()}_${datos.ultimos4}`,
    creadaEn: new Date().toISOString(),
  };
}

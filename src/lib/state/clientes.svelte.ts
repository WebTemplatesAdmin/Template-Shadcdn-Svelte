// src/lib/state/clientes.svelte.ts
import type { Cliente } from "$lib/types/cliente";
import type { TarjetaGuardada } from "$lib/types/tarjeta";

/**
 * Datos creados en esta sesión (sin backend). Viven en memoria del cliente y
 * se pierden al recargar la página: es el puente entre el alta de pedido y el
 * catálogo mientras no exista un backend real.
 */
export const clientesCreados = $state<Cliente[]>([]);
export const tarjetasCreadas = $state<TarjetaGuardada[]>([]);

/** Agrega un cliente creado al vuelo en el alta. */
export function registrarClienteCreado(cliente: Cliente) {
  clientesCreados.unshift(cliente);
}

/** Agrega una tarjeta guardada (solo últimos 4 + token). */
export function registrarTarjetaCreada(tarjeta: TarjetaGuardada) {
  tarjetasCreadas.unshift(tarjeta);
}

/** Tarjetas de un cliente: las creadas en la sesión + las de su catálogo. */
export function tarjetasDeCliente(
  cliente: Cliente | null,
): TarjetaGuardada[] {
  if (!cliente) return [];
  const creadas = tarjetasCreadas.filter((t) => t.clienteId === cliente.id);
  return [...creadas, ...(cliente.tarjetas ?? [])];
}

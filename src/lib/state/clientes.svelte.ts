// src/lib/state/clientes.svelte.ts
import type {
  Cliente,
  ComunicacionCliente,
  NotaCliente,
} from "$lib/types/cliente";
import type { TarjetaGuardada } from "$lib/types/tarjeta";

/**
 * Datos creados en esta sesión (sin backend). Viven en memoria del cliente y
 * se pierden al recargar la página: es el puente entre el alta de pedido y el
 * catálogo mientras no exista un backend real.
 */
export const clientesCreados = $state<Cliente[]>([]);
export const tarjetasCreadas = $state<TarjetaGuardada[]>([]);
export const tarjetasEliminadas = $state<string[]>([]);
export const notasCreadas = $state<NotaCliente[]>([]);
export const notasEliminadas = $state<string[]>([]);
export const comunicacionesCreadas = $state<ComunicacionCliente[]>([]);
export const comunicacionesEliminadas = $state<string[]>([]);

/** Agrega un cliente creado al vuelo en el alta. */
export function registrarClienteCreado(cliente: Cliente) {
  clientesCreados.unshift(cliente);
}

/** Agrega una tarjeta guardada (solo últimos 4 + token). */
export function registrarTarjetaCreada(tarjeta: TarjetaGuardada) {
  tarjetasCreadas.unshift(tarjeta);
}

/** Quita una tarjeta: las de sesión se borran; las del mock se ocultan. */
export function eliminarTarjeta(id: string) {
  const indice = tarjetasCreadas.findIndex((tarjeta) => tarjeta.id === id);
  if (indice >= 0) {
    tarjetasCreadas.splice(indice, 1);
    return;
  }
  if (!tarjetasEliminadas.includes(id)) tarjetasEliminadas.push(id);
}

/** Tarjetas de un cliente: las creadas en la sesión + las de su catálogo. */
export function tarjetasDeCliente(
  cliente: Cliente | null,
): TarjetaGuardada[] {
  if (!cliente) return [];
  const creadas = tarjetasCreadas.filter((t) => t.clienteId === cliente.id);
  return [...creadas, ...(cliente.tarjetas ?? [])].filter(
    (tarjeta) => !tarjetasEliminadas.includes(tarjeta.id),
  );
}

/** Agrega una nota de la bitácora. */
export function registrarNotaCreada(nota: NotaCliente) {
  notasCreadas.unshift(nota);
}

/** Quita una nota: las de sesión se borran; las del mock se ocultan. */
export function eliminarNota(id: string) {
  const indice = notasCreadas.findIndex((nota) => nota.id === id);
  if (indice >= 0) {
    notasCreadas.splice(indice, 1);
    return;
  }
  if (!notasEliminadas.includes(id)) notasEliminadas.push(id);
}

/** Notas de un cliente, de la más reciente a la más antigua. */
export function notasDeCliente(cliente: Cliente | null): NotaCliente[] {
  if (!cliente) return [];
  const creadas = notasCreadas.filter((n) => n.clienteId === cliente.id);
  return [...creadas, ...(cliente.notas ?? [])]
    .filter((nota) => !notasEliminadas.includes(nota.id))
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

/** Agrega una comunicación al historial. */
export function registrarComunicacionCreada(comunicacion: ComunicacionCliente) {
  comunicacionesCreadas.unshift(comunicacion);
}

/** Quita una comunicación: las de sesión se borran; las del mock se ocultan. */
export function eliminarComunicacion(id: string) {
  const indice = comunicacionesCreadas.findIndex(
    (comunicacion) => comunicacion.id === id,
  );
  if (indice >= 0) {
    comunicacionesCreadas.splice(indice, 1);
    return;
  }
  if (!comunicacionesEliminadas.includes(id)) {
    comunicacionesEliminadas.push(id);
  }
}

/** Historial de un cliente, de la más reciente a la más antigua. */
export function comunicacionesDeCliente(
  cliente: Cliente | null,
): ComunicacionCliente[] {
  if (!cliente) return [];
  const creadas = comunicacionesCreadas.filter(
    (c) => c.clienteId === cliente.id,
  );
  return [...creadas, ...(cliente.comunicaciones ?? [])]
    .filter((comunicacion) => !comunicacionesEliminadas.includes(comunicacion.id))
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

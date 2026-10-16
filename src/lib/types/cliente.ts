// src/lib/types/cliente.ts
import type { TarjetaGuardada } from "./tarjeta";

/** Etiqueta geográfica libre (ciudad/municipio). Opcional, agnóstico al país. */
export type Cliente = {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad?: string;
  /** Tarjetas guardadas del cliente (solo últimos 4 + token). */
  tarjetas?: TarjetaGuardada[];
  /** ISO 8601. */
  creadoEn: string;
};

// src/lib/types/cliente.ts
import type { TarjetaGuardada } from "./tarjeta";

/** Tipo de entrada interna de la bitácora del cliente. */
export type TipoNota = "nota" | "restriccion";

/** Registro interno del cliente: nota libre o restricción. */
export type NotaCliente = {
  id: string;
  clienteId: number;
  tipo: TipoNota;
  contenido: string;
  /** Quién registró la nota. */
  autor: string;
  /** ISO 8601. */
  creadoEn: string;
};

/** Canal por el que se contactó al cliente o el cliente contactó. */
export type CanalComunicacion =
  | "llamada"
  | "whatsapp"
  | "chat"
  | "email"
  | "sms"
  | "presencial"
  | "otro";

/** Sentido de la comunicación respecto a la empresa. */
export type DireccionComunicacion = "entrante" | "saliente";

/** Desenlace de la comunicación. */
export type ResultadoComunicacion =
  | "contactado"
  | "sin_respuesta"
  | "ocupado"
  | "mensaje_dejado"
  | "reagendado";

/** Registro del historial omnicanal del cliente. */
export type ComunicacionCliente = {
  id: string;
  clienteId: number;
  canal: CanalComunicacion;
  direccion: DireccionComunicacion;
  resultado: ResultadoComunicacion;
  /** Solo aplica a llamadas. */
  duracionSegundos?: number;
  contenido: string;
  /** Quién registró la comunicación. */
  autor: string;
  /** ISO 8601. */
  creadoEn: string;
};

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
  /** Bitácora interna: notas y restricciones. */
  notas?: NotaCliente[];
  /** Historial omnicanal: llamadas, mensajería y contactos presenciales. */
  comunicaciones?: ComunicacionCliente[];
  /** ISO 8601. */
  creadoEn: string;
};

/** Cliente + métricas para la tabla del módulo de clientes. */
export type ClienteResumen = Cliente & {
  pedidos: number;
  totalComprado: number;
};

// src/lib/types/llamada.ts
/** Datos mínimos para iniciar una llamada saliente. */
export type SolicitudLlamada = {
  clienteId: number;
  /** E.164, por ejemplo +573002147788. */
  telefono: string;
  nombre: string;
  agenteId?: string;
};

export type RespuestaLLamada = {
  llamadaId: string;
  estado: "iniciada" | "encolada";
};

export type OpcionesLlamada = {
  signal?: AbortSignal;
  idempotencyKey?: string;
};

/** Contrato que debe implementar la plataforma RPC real. */
export interface ProveedorLlamadas {
  iniciar(
    solicitud: SolicitudLlamada,
    opciones?: OpcionesLlamada,
  ): Promise<RespuestaLLamada>;
}

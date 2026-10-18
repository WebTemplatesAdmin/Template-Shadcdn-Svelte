// src/lib/server/llamadas/rpc.ts
// Cliente del proveedor de llamadas. Vive solo en el servidor: el token de la
// plataforma nunca se expone al navegador.
import { env } from "$env/dynamic/private";
import type {
  OpcionesLlamada,
  RespuestaLLamada,
  SolicitudLlamada,
} from "$lib/types/llamada";

const TIMEOUT_MS = 8_000;
const USAR_MOCK = env.USE_MOCK_DATA === "true" || !env.LLAMADAS_RPC_URL;

/** Error de dominio con código y estado HTTP sugerido. */
export class LlamadaError extends Error {
  codigo: string;
  estado: number;

  constructor(codigo: string, mensaje: string, estado = 502) {
    super(mensaje);
    this.name = "LlamadaError";
    this.codigo = codigo;
    this.estado = estado;
  }
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

/**
 * Simulación para la plantilla. Sufijos especiales para probar errores:
 * - termina en 0000 → la plataforma rechaza la llamada (422)
 * - termina en 9999 → fallo de conexión (503)
 */
async function iniciarLlamadaMock(
  solicitud: SolicitudLlamada,
): Promise<RespuestaLLamada> {
  await esperar(900);

  if (solicitud.telefono.endsWith("0000")) {
    throw new LlamadaError(
      "rpc_rechazada",
      "La plataforma rechazó la llamada. Verifica el número e inténtalo de nuevo.",
      422,
    );
  }

  if (solicitud.telefono.endsWith("9999")) {
    throw new LlamadaError(
      "sin_conexion",
      "No se pudo conectar con la plataforma de llamadas.",
      503,
    );
  }

  return {
    llamadaId: `MOCK-${Date.now()}`,
    estado: "iniciada",
  };
}

async function iniciarLlamadaRpc(
  solicitud: SolicitudLlamada,
  opciones?: OpcionesLlamada,
): Promise<RespuestaLLamada> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const alAbortar = () => ctrl.abort();
  opciones?.signal?.addEventListener("abort", alAbortar, { once: true });

  try {
    const respuesta = await fetch(env.LLAMADAS_RPC_URL!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.LLAMADAS_RPC_TOKEN
          ? { authorization: `Bearer ${env.LLAMADAS_RPC_TOKEN}` }
          : {}),
        ...(opciones?.idempotencyKey
          ? { "idempotency-key": opciones.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: opciones?.idempotencyKey ?? globalThis.crypto.randomUUID(),
        method: env.LLAMADAS_RPC_METHOD ?? "call.start",
        params: {
          to: solicitud.telefono,
          clienteId: solicitud.clienteId,
          nombre: solicitud.nombre,
          ...(solicitud.agenteId ? { agenteId: solicitud.agenteId } : {}),
          ...(opciones?.idempotencyKey
            ? { idempotencyKey: opciones.idempotencyKey }
            : {}),
        },
      }),
      signal: ctrl.signal,
    });

    if (!respuesta.ok) {
      throw new LlamadaError(
        "plataforma_no_disponible",
        "La plataforma de llamadas no está disponible en este momento.",
        503,
      );
    }

    const datos = (await respuesta.json()) as {
      result?: { llamadaId?: string; estado?: string };
      error?: { code?: number; message?: string };
    };

    if (datos.error) {
      throw new LlamadaError(
        "rpc_rechazada",
        datos.error.message ??
          "La plataforma rechazó la llamada. Inténtalo de nuevo.",
        422,
      );
    }

    if (!datos.result?.llamadaId) {
      throw new LlamadaError(
        "respuesta_invalida",
        "La plataforma devolvió una respuesta inválida.",
        502,
      );
    }

    return {
      llamadaId: String(datos.result.llamadaId),
      estado: datos.result.estado === "encolada" ? "encolada" : "iniciada",
    };
  } catch (error) {
    if (error instanceof LlamadaError) throw error;

    if ((error as Error)?.name === "AbortError") {
      throw new LlamadaError(
        "timeout",
        "La plataforma tardó demasiado en responder. Inténtalo de nuevo.",
        504,
      );
    }

    throw new LlamadaError(
      "sin_conexion",
      "No se pudo conectar con la plataforma de llamadas.",
      503,
    );
  } finally {
    clearTimeout(timer);
    opciones?.signal?.removeEventListener("abort", alAbortar);
  }
}

/** Punto de entrada: usa el mock mientras no haya plataforma configurada. */
export function iniciarLlamada(
  solicitud: SolicitudLlamada,
  opciones?: OpcionesLlamada,
): Promise<RespuestaLLamada> {
  return USAR_MOCK
    ? iniciarLlamadaMock(solicitud)
    : iniciarLlamadaRpc(solicitud, opciones);
}

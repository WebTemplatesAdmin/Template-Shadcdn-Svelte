// src/routes/api/llamadas/+server.ts
import { json } from "@sveltejs/kit";
import { iniciarLlamada, LlamadaError } from "$lib/server/llamadas/rpc";
import { normalizarTelefono } from "$lib/utils/telefono";
import type { RequestHandler } from "./$types";

type Cuerpo = {
  clienteId?: unknown;
  nombre?: unknown;
  telefono?: unknown;
  agenteId?: unknown;
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.session) {
    return json(
      {
        ok: false,
        codigo: "sin_sesion",
        mensaje: "Tu sesión expiró. Inicia sesión de nuevo.",
      },
      { status: 401 },
    );
  }

  let cuerpo: Cuerpo;
  try {
    cuerpo = (await request.json()) as Cuerpo;
  } catch {
    return json(
      {
        ok: false,
        codigo: "cuerpo_invalido",
        mensaje: "La solicitud no contiene datos válidos.",
      },
      { status: 400 },
    );
  }

  const telefono = normalizarTelefono(
    typeof cuerpo.telefono === "string" ? cuerpo.telefono : null,
  );

  if (!telefono) {
    return json(
      {
        ok: false,
        codigo: "telefono_invalido",
        mensaje: "El cliente no tiene un teléfono válido registrado.",
      },
      { status: 400 },
    );
  }

  if (
    typeof cuerpo.clienteId !== "number" ||
    !Number.isInteger(cuerpo.clienteId) ||
    typeof cuerpo.nombre !== "string" ||
    !cuerpo.nombre.trim()
  ) {
    return json(
      {
        ok: false,
        codigo: "datos_invalidos",
        mensaje: "Faltan datos del cliente para iniciar la llamada.",
      },
      { status: 400 },
    );
  }

  try {
    const llamada = await iniciarLlamada(
      {
        clienteId: cuerpo.clienteId,
        nombre: cuerpo.nombre.trim(),
        telefono,
        ...(typeof cuerpo.agenteId === "string" && cuerpo.agenteId
          ? { agenteId: cuerpo.agenteId }
          : {}),
      },
      {
        idempotencyKey:
          request.headers.get("idempotency-key")?.slice(0, 100) ?? undefined,
      },
    );

    // TODO: reemplazar el mock de rpc.ts por tu plataforma real.
    console.log(
      `[llamadas] Llamada iniciada → cliente ${cuerpo.clienteId} · ${telefono} · ${llamada.llamadaId}`,
    );

    return json({
      ok: true,
      llamada,
      mensaje: "Llamada iniciada correctamente.",
    });
  } catch (error) {
    if (error instanceof LlamadaError) {
      return json(
        { ok: false, codigo: error.codigo, mensaje: error.message },
        { status: error.estado },
      );
    }

    console.error("[llamadas] Error inesperado", error);
    return json(
      {
        ok: false,
        codigo: "error_interno",
        mensaje: "Ocurrió un error inesperado al iniciar la llamada.",
      },
      { status: 500 },
    );
  }
};

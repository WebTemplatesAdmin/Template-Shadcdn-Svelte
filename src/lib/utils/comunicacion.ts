// src/lib/utils/comunicacion.ts
// Helpers del historial omnicanal del cliente.
import type {
  CanalComunicacion,
  ComunicacionCliente,
  DireccionComunicacion,
  ResultadoComunicacion,
} from "$lib/types/cliente";

type VarianteBadge = "default" | "secondary" | "destructive" | "outline";

export const CANALES_COMUNICACION: CanalComunicacion[] = [
  "llamada",
  "whatsapp",
  "chat",
  "email",
  "sms",
  "presencial",
  "otro",
];

export const ETIQUETA_CANAL: Record<CanalComunicacion, string> = {
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  chat: "Chat web",
  email: "Email",
  sms: "SMS",
  presencial: "Presencial",
  otro: "Otro",
};

export const DIRECCIONES_COMUNICACION: DireccionComunicacion[] = [
  "entrante",
  "saliente",
];

export const ETIQUETA_DIRECCION: Record<DireccionComunicacion, string> = {
  entrante: "Entrante",
  saliente: "Saliente",
};

export const RESULTADOS_COMUNICACION: ResultadoComunicacion[] = [
  "contactado",
  "sin_respuesta",
  "ocupado",
  "mensaje_dejado",
  "reagendado",
];

export const ETIQUETA_RESULTADO: Record<ResultadoComunicacion, string> = {
  contactado: "Contactado",
  sin_respuesta: "Sin respuesta",
  ocupado: "Ocupado",
  mensaje_dejado: "Mensaje dejado",
  reagendado: "Reagendado",
};

/** Variante del Badge + acento visual por resultado. */
export const ESTILO_RESULTADO: Record<
  ResultadoComunicacion,
  { variante: VarianteBadge; clase: string }
> = {
  contactado: {
    variante: "outline",
    clase: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  sin_respuesta: { variante: "secondary", clase: "" },
  ocupado: {
    variante: "outline",
    clase: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  mensaje_dejado: {
    variante: "outline",
    clase: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  },
  reagendado: {
    variante: "outline",
    clase: "border-violet-500/40 bg-violet-500/10 text-violet-600",
  },
};

/** Solo las llamadas registran duración. */
export function registraDuracion(canal: CanalComunicacion): boolean {
  return canal === "llamada";
}

/** "2:05"; guion si no hay duración (canales sin llamada). */
export function formatearDuracion(segundos?: number): string {
  if (segundos == null) return "—";
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

/** Crea una comunicación lista para guardar (id + fecha de creación). */
export function crearComunicacion(
  clienteId: number,
  datos: {
    canal: CanalComunicacion;
    direccion: DireccionComunicacion;
    resultado: ResultadoComunicacion;
    duracionSegundos?: number;
    contenido: string;
    autor: string;
  },
): ComunicacionCliente {
  return {
    id: `COM-${clienteId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clienteId,
    canal: datos.canal,
    direccion: datos.direccion,
    resultado: datos.resultado,
    ...(datos.duracionSegundos != null
      ? { duracionSegundos: datos.duracionSegundos }
      : {}),
    contenido: datos.contenido.trim(),
    autor: datos.autor.trim() || "Sistema",
    creadoEn: new Date().toISOString(),
  };
}

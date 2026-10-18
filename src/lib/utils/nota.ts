// src/lib/utils/nota.ts
// Helpers de la bitácora interna del cliente (notas y restricciones).
import type { NotaCliente, TipoNota } from "$lib/types/cliente";

type VarianteBadge = "default" | "secondary" | "destructive" | "outline";

export const TIPOS_NOTA: TipoNota[] = ["nota", "restriccion"];

export const ETIQUETA_NOTA: Record<TipoNota, string> = {
  nota: "Nota",
  restriccion: "Restricción",
};

/** Variante del Badge + acento visual por tipo. */
export const ESTILO_NOTA: Record<
  TipoNota,
  { variante: VarianteBadge; clase: string }
> = {
  nota: { variante: "secondary", clase: "" },
  restriccion: { variante: "destructive", clase: "" },
};

/** Crea una nota lista para guardar (id + fecha de creación). */
export function crearNota(
  clienteId: number,
  datos: { tipo: TipoNota; contenido: string; autor: string },
): NotaCliente {
  return {
    id: `NOT-${clienteId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clienteId,
    tipo: datos.tipo,
    contenido: datos.contenido.trim(),
    autor: datos.autor.trim() || "Sistema",
    creadoEn: new Date().toISOString(),
  };
}
